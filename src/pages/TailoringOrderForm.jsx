import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, CheckSquare, Plus, Scissors, Calendar, CreditCard } from 'lucide-react';

const TailoringOrderForm = () => {
  const navigate = useNavigate();

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [items, setItems] = useState([{ type: '', qty: 1 }]);
  const [datePlaced, setDatePlaced] = useState(new Date().toISOString().split('T')[0]);
  const [collectionDate, setCollectionDate] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [deposit, setDeposit] = useState('');

  const handleAddItem = () => setItems([...items, { type: '', qty: 1 }]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customerName || !totalAmount) return;

    const newOrder = {
      id: Date.now().toString(),
      customerName,
      customerPhone,
      items,
      datePlaced,
      collectionDate,
      totalAmount: parseFloat(totalAmount),
      status: 'Pending',
      payments: deposit ? [{ amount: parseFloat(deposit), date: datePlaced, type: 'Deposit' }] : []
    };

    // Save Order
    const savedOrders = JSON.parse(localStorage.getItem('lucy_tailoring_orders') || '[]');
    localStorage.setItem('lucy_tailoring_orders', JSON.stringify([newOrder, ...savedOrders]));

    // If there's a deposit, save it to payments for revenue tracking
    if (deposit && parseFloat(deposit) > 0) {
      const savedPayments = JSON.parse(localStorage.getItem('lucy_tailoring_payments') || '[]');
      const newPayment = { id: Date.now().toString() + '_p', orderId: newOrder.id, amount: parseFloat(deposit), date: datePlaced, type: 'Deposit' };
      localStorage.setItem('lucy_tailoring_payments', JSON.stringify([newPayment, ...savedPayments]));
    }

    // Save Customer if not exists (Simplified CRM logic)
    const savedCustomers = JSON.parse(localStorage.getItem('lucy_customers') || '[]');
    if (!savedCustomers.find(c => c.name.toLowerCase() === customerName.toLowerCase())) {
      localStorage.setItem('lucy_customers', JSON.stringify([...savedCustomers, { id: Date.now().toString(), name: customerName, phone: customerPhone }]));
    }

    navigate('/tailoring');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 pb-20">
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">New Order</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-500 mt-1">Tailoring Details</p>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Customer Details */}
          <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><User size={16} className="text-emerald-500" /> Customer Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Full Name</label>
                <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all" placeholder="e.g. Lucy Kepher" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Phone Number</label>
                <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none transition-all" placeholder="07XXXXXXXX" />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><Scissors size={16} className="text-emerald-500" /> Order Items</h2>
            
            <div className="space-y-3 mb-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-1">
                    <input type="text" value={item.type} onChange={e => handleItemChange(index, 'type', e.target.value)} placeholder="Type (e.g. Dress, Trouser)" required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm focus:border-emerald-400 outline-none" />
                  </div>
                  <div className="w-24">
                    <input type="number" value={item.qty} min="1" onChange={e => handleItemChange(index, 'qty', parseInt(e.target.value))} placeholder="Qty" required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm focus:border-emerald-400 outline-none" />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddItem} className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-2 rounded flex items-center gap-1 hover:bg-emerald-100 transition-colors">
              <Plus size={14} /> Add Another Item
            </button>
          </div>

          {/* Dates & Financials */}
          <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><CreditCard size={16} className="text-emerald-500" /> Payment & Dates</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Order Date</label>
                <input type="date" value={datePlaced} onChange={e => setDatePlaced(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-3 text-sm focus:border-emerald-400 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Collection Date</label>
                <input type="date" value={collectionDate} onChange={e => setCollectionDate(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-3 text-sm focus:border-emerald-400 outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Total Amount (Ksh)</label>
                <input type="number" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-3 text-sm focus:border-emerald-400 outline-none" placeholder="0" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Initial Deposit (Ksh)</label>
                <input type="number" value={deposit} onChange={e => setDeposit(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-3 text-sm focus:border-emerald-400 outline-none" placeholder="0" />
              </div>
            </div>

            {totalAmount && (
              <div className="mt-4 p-3 bg-emerald-50 rounded-sm border border-emerald-100 flex justify-between items-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Remaining Balance</span>
                <span className="font-black text-emerald-700">Ksh {Math.max(0, parseFloat(totalAmount || 0) - parseFloat(deposit || 0)).toLocaleString()}</span>
              </div>
            )}
          </div>

          <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black uppercase tracking-[0.2em] py-4 rounded-sm shadow-lg transition-all active:scale-[0.98]">
            Save Order
          </button>
        </form>
      </main>
    </div>
  );
};

export default TailoringOrderForm;
