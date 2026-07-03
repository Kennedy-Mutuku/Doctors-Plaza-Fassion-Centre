import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Wallet, Calendar, Clock, CreditCard } from 'lucide-react';

const TailorExpenseForm = () => {
  const navigate = useNavigate();

  const [tailorName, setTailorName] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(''); // Mandatory dropdown
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-US', { hour12: false }).substring(0, 5));
  const [notes, setNotes] = useState('');
  const [tailorsList, setTailorsList] = useState([]);

  useEffect(() => {
    const savedTailors = JSON.parse(localStorage.getItem('lucy_tailors') || '[]');
    setTailorsList(savedTailors);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tailorName || !amount || !method) return;

    const newExpense = {
      id: Date.now().toString(),
      tailorName,
      amount: parseFloat(amount),
      method,
      date,
      time,
      notes
    };

    // Save Expense
    const savedExpenses = JSON.parse(localStorage.getItem('lucy_tailor_expenses') || '[]');
    localStorage.setItem('lucy_tailor_expenses', JSON.stringify([newExpense, ...savedExpenses]));

    // Save Tailor if not exists (Simplified CRM logic)
    const savedTailors = JSON.parse(localStorage.getItem('lucy_tailors') || '[]');
    if (!savedTailors.find(t => t.name.toLowerCase() === tailorName.toLowerCase())) {
      localStorage.setItem('lucy_tailors', JSON.stringify([...savedTailors, { id: Date.now().toString(), name: tailorName, phone: 'Unknown' }]));
    }

    navigate('/tailoring');
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 pb-20">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-50 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center">
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Pay Tailor</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mt-1">Record Expense</p>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><User size={16} className="text-slate-500" /> Tailor Info</h2>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Select Tailor</label>
              <select value={tailorName} onChange={e => setTailorName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 outline-none cursor-pointer text-slate-700">
                <option value="" disabled>Choose a tailor...</option>
                {tailorsList.map(t => (
                  <option key={t.id} value={t.name}>{t.name}</option>
                ))}
              </select>
              {tailorsList.length === 0 && <p className="text-[10px] text-rose-500 mt-1">No tailors found. Please onboard a tailor first.</p>}
            </div>
          </div>

          <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><Wallet size={16} className="text-slate-500" /> Payment Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Amount Paid (Ksh)</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 outline-none" placeholder="0" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Payment Method</label>
                <select 
                  value={method} 
                  onChange={e => setMethod(e.target.value)} 
                  required 
                  className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 outline-none cursor-pointer text-slate-700"
                >
                  <option value="" disabled>Select Payment Method...</option>
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa">M-Pesa</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-3 text-sm focus:border-slate-400 outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Time</label>
                  <input type="time" value={time} onChange={e => setTime(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-3 text-sm focus:border-slate-400 outline-none" />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Payment Notes (Optional)</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 outline-none resize-none" placeholder="e.g. Advance payment for 3 suits" />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-black hover:bg-gray-900 text-white font-black uppercase tracking-[0.2em] py-4 rounded-sm shadow-lg transition-all active:scale-[0.98]">
            Record Expense
          </button>
        </form>
      </main>
    </div>
  );
};

export default TailorExpenseForm;
