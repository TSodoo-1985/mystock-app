import React, { useState, useEffect } from 'react';
import { 
  Package, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Plus, 
  History,
  LayoutDashboard,
  Trash2,
  X,
  Download,
  ClipboardCheck,
  RotateCcw
} from 'lucide-react';

export default function WarehouseApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Өгөгдөл хадгалах (LocalStorage ашиглан хөтөч дээр хадгална)
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('warehouse_products');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('warehouse_transactions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('warehouse_products', JSON.stringify(products));
    localStorage.setItem('warehouse_transactions', JSON.stringify(transactions));
  }, [products, transactions]);

  // Төлөвүүд
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [txType, setTxType] = useState('IN');

  // Тооцооллууд
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  const totalValue = products.reduce((acc, curr) => acc + (curr.price * curr.stock), 0);
  const lowStockItems = products.filter(p => p.stock < 10);

  // CSV Тайлан татах функц
  const downloadReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,Бараа,Төрөл,Тоо ширхэг,Үнэ,Нийт дүн\n";
    products.forEach(p => {
      csvContent += `${p.name},${p.category},${p.stock},${p.price},${p.stock * p.price}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `warehouse_report_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  // Шинэ бараа нэмэх
  const handleAddProduct = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newProduct = {
      id: Date.now(),
      name: formData.get('name'),
      category: formData.get('category'),
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
    };
    setProducts([...products, newProduct]);
    setIsAddModalOpen(false);
  };

  // Гүйлгээ бүртгэх (Орлого / Зарлага)
  const handleTransaction = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const quantity = Number(formData.get('quantity'));
    const productId = Number(formData.get('productId'));
    const product = products.find(p => p.id === productId);

    if (!product) return;
    if (txType === 'OUT' && product.stock < quantity) {
      alert('Үлдэгдэл хүрэлцэхгүй байна!');
      return;
    }

    const updatedProducts = products.map(p => {
      if (p.id === productId) {
        return { ...p, stock: txType === 'IN' ? p.stock + quantity : p.stock - quantity };
      }
      return p;
    });

    const newTx = {
      id: Date.now(),
      productId,
      productName: product.name,
      type: txType,
      quantity,
      date: new Date().toLocaleString('mn-MN'),
      totalPrice: quantity * product.price
    };

    setProducts(updatedProducts);
    setTransactions([newTx, ...transactions]);
    setIsTxModalOpen(false);
  };

  // Тооллогын үр дүн шинэчлэх
  const updateAuditStock = (id, newStock) => {
    const updatedProducts = products.map(p => {
      if (p.id === id) {
        return { ...p, stock: Number(newStock) };
      }
      return p;
    });
    setProducts(updatedProducts);
  };

  // Хяналтын самбар
  const DashboardView = () => (
    <div className="space-y-4 p-4 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">Хяналтын самбар</h2>
        <button onClick={downloadReport} className="flex items-center gap-1 text-sm bg-gray-100 px-3 py-1.5 rounded-lg text-gray-600">
          <Download size={16} /> Тайлан
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-blue-100 text-xs uppercase tracking-wider font-medium">Нийт үлдэгдэл</p>
          <p className="text-2xl font-bold">{totalStock} ш</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-4 rounded-2xl text-white shadow-lg">
          <p className="text-emerald-100 text-xs uppercase tracking-wider font-medium">Нийт мөнгөн дүн</p>
          <p className="text-xl font-bold">{totalValue.toLocaleString()} ₮</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <button onClick={() => { setTxType('IN'); setIsTxModalOpen(true); }} className="flex flex-col items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm active:scale-95 transition-transform">
          <div className="bg-green-100 p-3 rounded-full mb-2"><ArrowDownCircle className="text-green-600 w-6 h-6" /></div>
          <span className="font-semibold text-gray-700">Орлого</span>
        </button>
        <button onClick={() => { setTxType('OUT'); setIsTxModalOpen(true); }} className="flex flex-col items-center p-4 bg-white border border-gray-100 rounded-2xl shadow-sm active:scale-95 transition-transform">
          <div className="bg-red-100 p-3 rounded-full mb-2"><ArrowUpCircle className="text-red-600 w-6 h-6" /></div>
          <span className="font-semibold text-gray-700">Зарлага</span>
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl">
          <h3 className="text-orange-800 font-bold text-sm flex items-center gap-2 mb-2">
            <ClipboardCheck size={16}/> Үлдэгдэл багассан ({lowStockItems.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {lowStockItems.map(p => (
              <span key={p.id} className="bg-white border border-orange-200 text-orange-700 text-[10px] px-2 py-1 rounded-md font-medium">
                {p.name}: {p.stock}ш
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-bold text-gray-700 mb-3">Сүүлийн гүйлгээ</h3>
        {transactions.length === 0 ? (
          <div className="space-y-3 text-center py-8 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">Одоогоор гүйлгээ хийгдээгүй байна</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map(tx => (
              <div key={tx.id} className="bg-white p-3 rounded-xl border border-gray-50 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${tx.type === 'IN' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {tx.type === 'IN' ? <ArrowDownCircle size={18} /> : <ArrowUpCircle size={18} />}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{tx.productName}</p>
                    <p className="text-[10px] text-gray-400 uppercase font-medium">{tx.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-black ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen font-sans max-w-md mx-auto shadow-2xl relative">
      {/* Толгой хэсэг */}
      <div className="bg-white px-6 pt-12 pb-4 shadow-sm border-b border-gray-50">
        <h1 className="text-2xl font-black text-blue-900 flex items-center gap-2">
          <Package className="text-blue-600" /> MyStock
        </h1>
        <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mt-1">Агуулахын удирдлагын систем</p>
      </div>

      {/* Үндсэн агуулга */}
      <main className="h-[calc(100vh-160px)] overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardView />}
        
        {activeTab === 'inventory' && (
           <div className="p-4 space-y-4">
             <div className="flex justify-between items-center">
               <h2 className="text-xl font-bold text-gray-800">Барааны бүртгэл</h2>
               <button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 text-white p-2 rounded-xl shadow-lg active:scale-90 transition-transform"><Plus/></button>
             </div>
             {products.length === 0 ? (
               <div className="text-center py-20">
                 <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Package className="text-gray-300" size={32} />
                 </div>
                 <p className="text-gray-500 font-medium">Бараа бүртгэгдээгүй байна</p>
                 <p className="text-gray-400 text-xs">"+" товчийг дарж бараа нэмнэ үү</p>
               </div>
             ) : (
               <div className="space-y-3 pb-24">
                  {products.map(p => (
                    <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 flex justify-between items-center shadow-sm">
                      <div>
                        <p className="font-bold text-gray-800">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.category} | {p.price.toLocaleString()} ₮</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-black ${p.stock < 10 ? 'text-red-500' : 'text-blue-600'}`}>{p.stock} <span className="text-xs">ш</span></p>
                        <button onClick={() => {
                          if(window.confirm('Устгах уу?')) setProducts(products.filter(item => item.id !== p.id))
                        }} className="text-gray-300 pt-1 hover:text-red-400 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </div>
                  ))}
               </div>
             )}
           </div>
        )}

        {activeTab === 'reports' && (
           <div className="p-4 space-y-4">
             <h2 className="text-xl font-bold text-gray-800">Гүйлгээний түүх</h2>
             {transactions.length === 0 ? (
               <div className="text-center py-20 text-gray-400">
                 <History size={40} className="mx-auto mb-3 opacity-20" />
                 <p>Гүйлгээний түүх хоосон байна</p>
               </div>
             ) : (
               <div className="space-y-2 pb-24">
                 {transactions.map(tx => (
                   <div key={tx.id} className="bg-white p-3 rounded-xl border-l-4 border-blue-500 flex justify-between shadow-sm">
                      <div>
                        <p className="font-bold text-sm text-gray-800">{tx.productName}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{tx.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${tx.type === 'IN' ? 'text-green-600' : 'text-red-600'}`}>{tx.type === 'IN' ? '+' : '-'}{tx.quantity}</p>
                        <p className="text-[10px] text-gray-400">{(tx.totalPrice).toLocaleString()} ₮</p>
                      </div>
                   </div>
                 ))}
               </div>
             )}
           </div>
        )}

        {activeTab === 'audit' && (
          <div className="p-4 space-y-4 animate-in slide-in-from-right duration-300">
            <h2 className="text-xl font-bold text-gray-800">Барааны тооллого</h2>
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl mb-4">
              <p className="text-xs text-blue-700 font-medium">Бодит үлдэгдлийг тоолж, доорх талбарт шинэчлэн оруулснаар систем дэх үлдэгдэл шууд засагдана.</p>
            </div>
            <div className="space-y-3 pb-24">
              {products.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-800">{p.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Одоо байгаа: {p.stock} ш</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      className="flex-1 p-3 bg-gray-50 border border-gray-200 rounded-xl text-center font-bold text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      placeholder="Шинэ тоо"
                      defaultValue={p.stock}
                      onBlur={(e) => updateAuditStock(p.id, e.target.value)}
                    />
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
                      <RotateCcw size={18} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="w-full bg-blue-600 text-white p-4 rounded-2xl text-center font-bold shadow-lg mt-4 cursor-pointer active:scale-95 transition-transform" onClick={() => setActiveTab('dashboard')}>
                Тооллого дуусгах
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Доод цэс */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 backdrop-blur-lg border-t border-gray-100 px-6 py-4 flex justify-between items-center z-40">
        <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-300'}><LayoutDashboard size={22}/></button>
        <button onClick={() => setActiveTab('inventory')} className={activeTab === 'inventory' ? 'text-blue-600' : 'text-gray-300'}><Package size={22}/></button>
        <div className="relative -mt-12">
          <button 
            onClick={() => { setTxType('IN'); setIsTxModalOpen(true); }}
            className="bg-blue-600 text-white rounded-full w-14 h-14 shadow-xl shadow-blue-200 flex items-center justify-center active:scale-90 transition-transform border-4 border-gray-50"
          >
            <Plus size={28} strokeWidth={3} />
          </button>
        </div>
        <button onClick={() => setActiveTab('reports')} className={activeTab === 'reports' ? 'text-blue-600' : 'text-gray-300'}><History size={22}/></button>
        <button onClick={() => setActiveTab('audit')} className={activeTab === 'audit' ? 'text-blue-600' : 'text-gray-300'}><ClipboardCheck size={22}/></button>
      </div>

      {/* Шинэ бараа нэмэх модал */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end p-4 backdrop-blur-sm">
          <div className="bg-white w-full rounded-3xl p-6 animate-in slide-in-from-bottom duration-300">
             <div className="flex justify-between mb-6 items-center">
               <h3 className="font-bold text-lg text-gray-800">Шинэ бараа нэмэх</h3>
               <button onClick={()=>setIsAddModalOpen(false)} className="bg-gray-100 p-1 rounded-full text-gray-500"><X size={20}/></button>
             </div>
             <form onSubmit={handleAddProduct} className="space-y-4">
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Барааны нэр</label>
                 <input name="name" placeholder="Жишээ: Атар талх" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" required />
               </div>
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Ангилал</label>
                 <input name="category" placeholder="Жишээ: Хүнс" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" required />
               </div>
               <div className="flex gap-3">
                 <div className="flex-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Нэгж үнэ (₮)</label>
                   <input name="price" type="number" placeholder="0" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" required />
                 </div>
                 <div className="flex-1">
                   <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Эхний үлдэгдэл</label>
                   <input name="stock" type="number" placeholder="0" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition-all" required />
                 </div>
               </div>
               <button type="submit" className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold shadow-lg shadow-blue-100 active:scale-95 transition-transform mt-2">Хадгалах</button>
             </form>
          </div>
        </div>
      )}

      {/* Орлого/Зарлага бүртгэх модал */}
      {isTxModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end p-4 backdrop-blur-sm">
          <div className="bg-white w-full rounded-3xl p-6 animate-in slide-in-from-bottom duration-300">
             <div className="flex justify-between mb-6 items-center">
               <h3 className="font-bold text-lg text-gray-800">{txType === 'IN' ? 'Орлого авах' : 'Зарлага гаргах'}</h3>
               <button onClick={()=>setIsTxModalOpen(false)} className="bg-gray-100 p-1 rounded-full text-gray-500"><X size={20}/></button>
             </div>
             <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-2xl">
                <button 
                  onClick={() => setTxType('IN')} 
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${txType === 'IN' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400'}`}
                >Орлого</button>
                <button 
                  onClick={() => setTxType('OUT')} 
                  className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${txType === 'OUT' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-400'}`}
                >Зарлага</button>
             </div>
             <form onSubmit={handleTransaction} className="space-y-4">
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Бараа сонгох</label>
                 <select name="productId" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white" required>
                   <option value="">Сонгоно уу...</option>
                   {products.map(p => <option key={p.id} value={p.id}>{p.name} (Үлдэгдэл: {p.stock}ш)</option>)}
                 </select>
               </div>
               <div>
                 <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block ml-1">Тоо ширхэг</label>
                 <input name="quantity" type="number" placeholder="0" className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white" required />
               </div>
               <button type="submit" className={`w-full p-5 rounded-2xl font-bold text-white shadow-lg active:scale-95 transition-transform mt-2 ${txType === 'IN' ? 'bg-green-600 shadow-green-100' : 'bg-red-600 shadow-red-100'}`}>
                 {txType === 'IN' ? 'Орлого бүртгэх' : 'Зарлага бүртгэх'}
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
