import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone, Banknote, Calendar, Clock, Plus, Wallet, FileText } from 'lucide-react';

const TailorDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tailor, setTailor] = useState(null);
  const [payments, setPayments] = useState([]);
  
  // New Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash'); // Cash or M-Pesa
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const savedTailors = JSON.parse(localStorage.getItem('lucy_tailors') || '[]');
    const foundTailor = savedTailors.find(t => t.id === id);
    if (!foundTailor) {
      navigate('/tailoring');
      return;
    }
    setTailor(foundTailor);

    const savedExpenses = JSON.parse(localStorage.getItem('lucy_tailor_expenses') || '[]');
    setPayments(savedExpenses.filter(e => e.tailorName === foundTailor.name));
  }, [id, navigate]);

  const handleRecordPayment = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    const now = new Date();
    const date = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);

    const newPayment = {
      id: Date.now().toString(),
      tailorName: tailor.name,
      amount: parseFloat(amount),
      method,
      date,
      time,
      notes
    };

    const saved = JSON.parse(localStorage.getItem('lucy_tailor_expenses') || '[]');
    saved.unshift(newPayment);
    localStorage.setItem('lucy_tailor_expenses', JSON.stringify(saved));
    
    setPayments([newPayment, ...payments]);
    
    // Reset form
    setAmount('');
    setMethod('Cash');
    setNotes('');
    setShowPaymentForm(false);
  };

  if (!tailor) return null;

  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/tailoring')} className="p-2 -ml-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">{tailor.name}</h1>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-400 mt-1">Tailor Profile</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tailor Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-2xl flex-shrink-0">
              {tailor.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{tailor.name}</h2>
              <div className="flex items-center gap-2 text-slate-500 mt-1">
                <Phone size={14} />
                <span className="font-medium text-sm">{tailor.phone || 'No phone number provided'}</span>
              </div>
            </div>
          </div>
          {tailor.notes && (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-1">
                <FileText size={12} /> Notes
              </h4>
              <p className="text-sm text-slate-700 italic">{tailor.notes}</p>
            </div>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 gap-4 mb-8">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Total Paid to Tailor</p>
              <p className="text-3xl font-black text-emerald-700">Ksh {totalPaid.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-500">
              <Banknote size={24} />
            </div>
          </div>
        </div>

        {/* Payment History & Actions */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg text-slate-900 uppercase tracking-tight">Payment Records</h3>
          <button
            onClick={() => setShowPaymentForm(!showPaymentForm)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold uppercase text-xs tracking-widest px-4 py-2 rounded-lg transition-colors"
          >
            {showPaymentForm ? 'Cancel' : <><Plus size={14} /> New Payment</>}
          </button>
        </div>

        {showPaymentForm && (
          <form onSubmit={handleRecordPayment} className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm mb-6 animate-fade-in">
            <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Wallet size={18} className="text-emerald-500" /> Record Payment
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Amount (Ksh) *</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-emerald-400 outline-none font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Payment Method *</label>
                <select
                  value={method}
                  onChange={e => setMethod(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-emerald-400 outline-none font-bold"
                >
                  <option value="Cash">Cash</option>
                  <option value="M-Pesa">M-Pesa</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-[10px] uppercase tracking-widest font-bold text-slate-500 mb-2">Reference / Notes</label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Payment for 3 shirts, Mpesa Ref: QWE123RTY"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-emerald-400 outline-none"
              />
            </div>

            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest py-3 rounded-lg shadow-md transition-all active:scale-[0.98]">
              Record Payment
            </button>
          </form>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <Banknote size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm text-slate-500 font-medium">No payments recorded for this tailor yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {payments.map(payment => (
                <div key={payment.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${payment.method === 'M-Pesa' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {payment.method || 'Cash'}
                      </span>
                      <p className="text-xs font-bold text-slate-500 flex items-center gap-1">
                        <Calendar size={12} /> {payment.date} <Clock size={12} className="ml-1" /> {payment.time}
                      </p>
                    </div>
                    <span className="font-black text-slate-900">Ksh {payment.amount?.toLocaleString()}</span>
                  </div>
                  {payment.notes && (
                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 inline-block px-3 py-1.5 rounded-md border border-slate-100">
                      {payment.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default TailorDetailsPage;
