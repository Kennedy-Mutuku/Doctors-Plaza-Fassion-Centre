import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Scissors, Users, Banknote, Plus, Calendar,
  ChevronDown, ChevronUp, Search, X, Pencil, CreditCard,
  FileText, CheckCircle, Save
} from 'lucide-react';

const TailoringDashboard = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [activeTab, setActiveTab] = useState('orders');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  // Per-order inline state
  const [paymentInputs, setPaymentInputs] = useState({});
  const [noteInputs, setNoteInputs] = useState({});
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Tailor notes and payments
  const [editingTailorId, setEditingTailorId] = useState(null);
  const [tailorNoteInput, setTailorNoteInput] = useState('');
  const [tailorExpenses, setTailorExpenses] = useState([]);

  const loadData = () => {
    const savedOrders = JSON.parse(localStorage.getItem('lucy_tailoring_orders') || '[]');
    setOrders(savedOrders);
    const savedTailors = JSON.parse(localStorage.getItem('lucy_tailors') || '[]');
    setTailors(savedTailors);
    const savedExpenses = JSON.parse(localStorage.getItem('lucy_tailor_expenses') || '[]');
    setTailorExpenses(savedExpenses);
  };

  useEffect(() => { loadData(); }, []);

  const filteredOrders = orders.filter(o => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(q) ||
      o.customerPhone?.toLowerCase().includes(q) ||
      o.items?.some(i => i.type?.toLowerCase().includes(q))
    );
  });

  const filteredTailors = tailors.filter(t => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return t.name?.toLowerCase().includes(q) || t.phone?.toLowerCase().includes(q);
  });

  const handleAddPayment = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    const totalPaid = (order.payments || []).reduce((s, p) => s + p.amount, 0);
    const balance = Math.max(0, (order.totalAmount || 0) - totalPaid);

    let amount = parseFloat(paymentInputs[orderId] || 0);
    if (!amount || amount <= 0) return;
    // Clamp to balance — never allow overpayment
    if (amount > balance) amount = balance;

    const today = new Date().toISOString().split('T')[0];
    const newPayment = { amount, date: today, type: 'Installment' };

    const updatedOrders = orders.map(o => {
      if (o.id !== orderId) return o;
      return { ...o, payments: [...(o.payments || []), newPayment] };
    });

    localStorage.setItem('lucy_tailoring_orders', JSON.stringify(updatedOrders));

    // Also record in global payments for revenue tracking
    const saved = JSON.parse(localStorage.getItem('lucy_tailoring_payments') || '[]');
    saved.unshift({ id: Date.now().toString(), orderId, amount, date: today, type: 'Installment' });
    localStorage.setItem('lucy_tailoring_payments', JSON.stringify(saved));

    setOrders(updatedOrders);
    setPaymentInputs(prev => ({ ...prev, [orderId]: '' }));
  };

  const handleMarkCompleted = (orderId) => {
    const updatedOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: 'Completed' } : o
    );
    localStorage.setItem('lucy_tailoring_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
  };

  const handleSaveNote = (orderId) => {
    const updatedOrders = orders.map(o =>
      o.id === orderId ? { ...o, notes: noteInputs[orderId] || '' } : o
    );
    localStorage.setItem('lucy_tailoring_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    setEditingNoteId(null);
  };

  const saveTailorNote = (tailorId) => {
    const updatedTailors = tailors.map(t =>
      t.id === tailorId ? { ...t, notes: tailorNoteInput } : t
    );
    setTailors(updatedTailors);
    localStorage.setItem('lucy_tailors', JSON.stringify(updatedTailors));
    setEditingTailorId(null);
  };

  const renderTailorCard = (tailor, index) => {
    const tailorHistory = tailorExpenses.filter(e => e.tailorName === tailor.name);
    const totalPaid = tailorHistory.reduce((s, e) => s + (e.amount || 0), 0);

    return (
      <div key={tailor.id} className="bg-white rounded-sm shadow-sm border border-slate-100 p-4 hover:border-emerald-200 transition-all cursor-pointer" onClick={() => navigate('/tailoring/tailor/' + tailor.id)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center">
              {index}
            </span>
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-black text-lg flex-shrink-0">
              {tailor.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-900">{tailor.name}</h4>
              <p className="text-xs font-medium text-slate-500">{tailor.phone || 'No phone'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-black text-slate-800 text-base block">Ksh {totalPaid.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Paid</span>
          </div>
        </div>
      </div>
    );
  };

  const renderOrderCard = (order, index) => {
    const isExpanded = expandedOrderId === order.id;
    const totalPaid = (order.payments || []).reduce((s, p) => s + p.amount, 0);
    const balance = Math.max(0, (order.totalAmount || 0) - totalPaid);
    const isCompleted = order.status === 'Completed';
    const isEditingNote = editingNoteId === order.id;

    return (
      <div className={`bg-white rounded-sm shadow-sm border overflow-hidden transition-all ${isExpanded ? 'border-emerald-200' : 'border-slate-100'}`}>

        {/* Main Row */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 p-4">
          {/* Number Badge + Info */}
          <div className="flex items-start gap-3 flex-1">
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white font-black text-xs flex items-center justify-center mt-0.5">
              {index}
            </span>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">{order.customerName}</h4>
              {order.customerPhone && <p className="text-[11px] text-slate-400">{order.customerPhone}</p>}
              <p className="text-xs text-slate-500 mt-0.5">{order.items?.map(i => `${i.qty}x ${i.type}`).join(', ')}</p>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${isCompleted ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                  {order.status}
                </span>
                <span className="text-[10px] flex items-center gap-1 text-slate-400 font-bold uppercase">
                  <Calendar size={11} /> Due: {order.collectionDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 flex-shrink-0">
            <div className="text-right">
              <span className="font-black text-slate-800 text-base block">Ksh {order.totalAmount?.toLocaleString()}</span>
              <span className="text-xs font-bold text-emerald-500">Paid: Ksh {totalPaid.toLocaleString()}</span>
            </div>
            <button
              onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
              className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-sm transition-colors"
            >
              <Pencil size={11} /> Edit {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          </div>
        </div>

        {/* Expanded Panel */}
        {isExpanded && (
          <div className="border-t border-slate-100 bg-slate-50 px-4 py-5 space-y-5">

            {/* Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-3 rounded-sm border border-slate-100">
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Order Date</p>
                <p className="text-xs font-bold text-slate-700">{order.datePlaced || '—'}</p>
              </div>
              <div className="bg-white p-3 rounded-sm border border-slate-100">
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Collection</p>
                <p className="text-xs font-bold text-slate-700">{order.collectionDate || '—'}</p>
              </div>
              <div className="bg-white p-3 rounded-sm border border-slate-100">
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Total Due</p>
                <p className="text-xs font-bold text-slate-700">Ksh {order.totalAmount?.toLocaleString()}</p>
              </div>
              <div className={`p-3 rounded-sm border ${balance === 0 ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
                <p className="text-[9px] uppercase tracking-widest font-bold text-slate-400 mb-1">Balance</p>
                <p className={`text-xs font-bold ${balance === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {balance === 0 ? 'Cleared ✓' : `Ksh ${balance.toLocaleString()}`}
                </p>
              </div>
            </div>

            {/* Payment History */}
            <div>
              <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2 flex items-center gap-1">
                <CreditCard size={12} /> Payment History
              </p>
              {(!order.payments || order.payments.length === 0) ? (
                <p className="text-xs text-slate-400 italic px-1">No payments recorded yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {order.payments.map((p, i) => (
                    <div key={i} className="flex justify-between items-center bg-white px-3 py-2 rounded-sm border border-slate-100 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-[10px] flex-shrink-0">{i + 1}</span>
                        <span className="font-bold text-slate-600 uppercase">{p.type}</span>
                        <span className="text-slate-400">— {p.date}</span>
                      </div>
                      <span className="font-black text-emerald-600">+Ksh {p.amount?.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add Payment (only if not cleared) */}
            {balance > 0 && (
              <div className="bg-white border border-slate-200 rounded-sm p-3">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-2">Add New Payment</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="1"
                    value={paymentInputs[order.id] || ''}
                    onChange={e => setPaymentInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                    placeholder={`Outstanding: Ksh ${balance.toLocaleString()}`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm focus:border-emerald-400 outline-none"
                  />
                  <button
                    onClick={() => handleAddPayment(order.id)}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold uppercase text-[10px] tracking-wider px-4 py-2 rounded-sm transition-colors flex items-center gap-1"
                  >
                    <Plus size={14} /> Record
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5">Max allowed: Ksh {balance.toLocaleString()} — cannot exceed outstanding balance.</p>
              </div>
            )}

            {/* Mark as Completed */}
            {!isCompleted && (
              balance > 0 ? (
                // Locked — balance not cleared
                <div className="w-full flex flex-col items-center gap-1.5 bg-slate-50 border border-dashed border-slate-300 text-slate-400 font-bold uppercase text-xs tracking-widest py-3 rounded-sm cursor-not-allowed select-none">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={15} className="opacity-40" /> Mark as Collected / Completed
                  </div>
                  <span className="text-[10px] font-medium normal-case tracking-normal text-slate-400">⚠️ Clear the balance of Ksh {balance.toLocaleString()} first before marking as completed.</span>
                </div>
              ) : (
                <button
                  onClick={() => handleMarkCompleted(order.id)}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 font-bold uppercase text-xs tracking-widest py-2.5 rounded-sm transition-colors"
                >
                  <CheckCircle size={15} /> Mark as Collected / Completed
                </button>
              )
            )}
            {isCompleted && (
              <div className="flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 font-bold uppercase text-xs tracking-widest py-2.5 rounded-sm">
                <CheckCircle size={15} /> Collected &amp; Completed ✓
              </div>
            )}

            {/* Customer Notes */}
            <div className="bg-white border border-slate-200 rounded-sm p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400 flex items-center gap-1">
                  <FileText size={12} /> Customer Notes
                </p>
                {!isEditingNote && (
                  <button
                    onClick={() => {
                      setEditingNoteId(order.id);
                      setNoteInputs(prev => ({ ...prev, [order.id]: order.notes || '' }));
                    }}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
                  >
                    <Pencil size={11} /> {order.notes ? 'Edit' : 'Add Note'}
                  </button>
                )}
              </div>
              {isEditingNote ? (
                <div>
                  <textarea
                    value={noteInputs[order.id] || ''}
                    onChange={e => setNoteInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                    rows={3}
                    placeholder="e.g. Prefers slim cut. Size 40. Allergic to certain fabric. Call before delivery."
                    className="w-full bg-slate-50 border border-slate-200 rounded-sm px-3 py-2 text-sm focus:border-emerald-400 outline-none resize-none"
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSaveNote(order.id)}
                      className="bg-black text-white font-bold uppercase text-[10px] tracking-widest px-4 py-2 rounded-sm hover:bg-gray-800 transition-colors flex items-center gap-1"
                    >
                      <Save size={12} /> Save
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] tracking-widest px-4 py-2 rounded-sm hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">
                  {order.notes || 'No notes yet. Tap "Add Note" to record customer preferences, measurements, etc.'}
                </p>
              )}
            </div>

          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigate('/')} className="p-2 -ml-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-colors">
              <ArrowLeft size={24} />
            </button>
            <div className="text-center">
              <div className="flex items-center gap-2 justify-center">
                <Scissors size={20} className="text-emerald-500" />
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Tailoring CRM</h1>
              </div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-emerald-500 mt-1">Orders & Expenses</p>
            </div>
            <div className="w-10"></div>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, phone, item type..."
              className="w-full bg-slate-50 border border-emerald-200 rounded-xl pl-11 pr-10 py-3 text-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-400/10 outline-none shadow-sm transition-all font-medium text-slate-800"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-5">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-3 text-sm font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'orders' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Orders
          </button>
          <button
            onClick={() => setActiveTab('tailors')}
            className={`flex-1 py-3 text-sm font-black uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'tailors' ? 'border-emerald-500 text-emerald-600 bg-emerald-50/50' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
            Tailors Directory
          </button>
        </div>

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-3 mt-4">
            <button
              onClick={() => navigate('/tailoring/new')}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-widest py-4 rounded-sm shadow-md transition-all active:scale-[0.98] mb-4"
            >
              <Plus size={18} /> Add New Order
            </button>
            {searchQuery && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {filteredOrders.length} result{filteredOrders.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-sm border border-dashed border-slate-200">
                <Scissors size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  {searchQuery ? 'No orders match your search.' : 'No tailoring orders found.'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order, i) => <div key={order.id}>{renderOrderCard(order, i + 1)}</div>)
            )}
          </div>
        )}

        {/* TAILORS TAB */}
        {activeTab === 'tailors' && (
          <div className="space-y-3 mt-4">
            <button
              onClick={() => navigate('/tailoring/onboard')}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white border border-slate-800 font-black uppercase tracking-widest py-3 rounded-sm shadow-sm transition-all active:scale-[0.98] mb-4"
            >
              <Plus size={18} /> Add a Tailor
            </button>
            {searchQuery && (
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {filteredTailors.length} result{filteredTailors.length !== 1 ? 's' : ''} for "{searchQuery}"
              </p>
            )}
            {filteredTailors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-sm border border-dashed border-slate-200">
                <Users size={32} className="mx-auto text-slate-300 mb-3" />
                <p className="text-sm text-slate-500 font-medium">
                  {searchQuery ? 'No tailors match your search.' : 'No tailors registered yet.'}
                </p>
              </div>
            ) : (
              filteredTailors.map((tailor, i) => renderTailorCard(tailor, i + 1))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default TailoringDashboard;
