import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, CreditCard, Banknote } from 'lucide-react';

const TailoringOrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  useEffect(() => {
    const savedOrders = JSON.parse(localStorage.getItem('lucy_tailoring_orders') || '[]');
    const foundOrder = savedOrders.find(o => o.id === id);
    if (foundOrder) {
      setOrder(foundOrder);
    } else {
      navigate('/tailoring'); // if not found, go back
    }
  }, [id, navigate]);

  if (!order) return <div className="p-10 text-center">Loading...</div>;

  const totalPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = Math.max(0, order.totalAmount - totalPaid);

  const handleAddPayment = (e) => {
    e.preventDefault();
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return;
    
    const amountNum = parseFloat(paymentAmount);
    const newPayment = {
      amount: amountNum,
      date: new Date().toISOString().split('T')[0],
      type: 'Installment'
    };

    // Update Order
    const updatedOrder = {
      ...order,
      payments: [...order.payments, newPayment]
    };
    
    // Save updated order
    const savedOrders = JSON.parse(localStorage.getItem('lucy_tailoring_orders') || '[]');
    const updatedOrders = savedOrders.map(o => o.id === id ? updatedOrder : o);
    localStorage.setItem('lucy_tailoring_orders', JSON.stringify(updatedOrders));

    // Add to global tailoring payments (for revenue calculation)
    const savedPayments = JSON.parse(localStorage.getItem('lucy_tailoring_payments') || '[]');
    const newGlobalPayment = { id: Date.now().toString() + '_p', orderId: order.id, amount: amountNum, date: newPayment.date, type: 'Installment' };
    localStorage.setItem('lucy_tailoring_payments', JSON.stringify([newGlobalPayment, ...savedPayments]));

    setOrder(updatedOrder);
    setPaymentAmount('');
  };

  const handleMarkCompleted = () => {
    const updatedOrder = { ...order, status: 'Completed' };
    const savedOrders = JSON.parse(localStorage.getItem('lucy_tailoring_orders') || '[]');
    const updatedOrders = savedOrders.map(o => o.id === id ? updatedOrder : o);
    localStorage.setItem('lucy_tailoring_orders', JSON.stringify(updatedOrders));
    setOrder(updatedOrder);
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 pb-20">
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Order Details</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-500 mt-1">{order.customerName}</p>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        
        {/* Status Card */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1">Status</h3>
            <span className={`text-sm font-black uppercase tracking-wider px-3 py-1 rounded-sm ${order.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {order.status}
            </span>
          </div>
          {order.status !== 'Completed' && (
            <button 
              onClick={handleMarkCompleted}
              className="flex items-center gap-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-bold uppercase text-[10px] tracking-widest px-4 py-2 rounded-sm transition-colors"
            >
              <CheckCircle size={16} /> Mark Collected
            </button>
          )}
        </div>

        {/* Financials & Add Payment */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100">
          <div className="flex justify-between items-end border-b border-slate-100 pb-4 mb-4">
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1">Total Due</h3>
              <p className="text-2xl font-black text-slate-800">Ksh {order.totalAmount.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 mb-1">Balance</h3>
              <p className="text-lg font-black text-rose-500">Ksh {balance.toLocaleString()}</p>
            </div>
          </div>

          {balance > 0 && (
            <form onSubmit={handleAddPayment} className="flex items-end gap-3 bg-slate-50 p-4 rounded-sm border border-slate-200">
              <div className="flex-1">
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Add Payment (Ksh)</label>
                <input 
                  type="number" 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)} 
                  required 
                  className="w-full bg-white border border-slate-300 rounded-sm px-3 py-2 text-sm focus:border-emerald-400 outline-none" 
                  placeholder="Enter amount"
                />
              </div>
              <button type="submit" className="bg-black hover:bg-gray-800 text-white font-bold uppercase tracking-widest px-6 py-2.5 rounded-sm transition-all text-xs flex items-center gap-2 h-[38px]">
                <Banknote size={14}/> Pay
              </button>
            </form>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white p-6 rounded-sm shadow-sm border border-slate-100">
          <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard size={16} className="text-emerald-500" /> Payment History
          </h2>
          {order.payments.length === 0 ? (
            <p className="text-sm text-slate-500">No payments made yet.</p>
          ) : (
            <div className="space-y-3">
              {order.payments.map((p, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 p-3 rounded-sm border border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-xs">{i+1}</span>
                    <div>
                      <p className="text-xs font-bold text-slate-700 uppercase">{p.type}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{p.date}</p>
                    </div>
                  </div>
                  <span className="font-black text-emerald-600">Ksh {p.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default TailoringOrderDetails;
