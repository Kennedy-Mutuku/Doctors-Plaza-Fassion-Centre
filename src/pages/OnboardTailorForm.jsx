import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Phone } from 'lucide-react';

const OnboardTailorForm = () => {
  const navigate = useNavigate();

  const [tailorName, setTailorName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!tailorName) return;

    const newTailor = {
      id: Date.now().toString(),
      name: tailorName,
      phone: phone || 'Unknown',
      notes: notes || ''
    };

    const savedTailors = JSON.parse(localStorage.getItem('lucy_tailors') || '[]');
    localStorage.setItem('lucy_tailors', JSON.stringify([...savedTailors, newTailor]));

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
            <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight">Onboard Tailor</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-slate-500 mt-1">Add New Staff</p>
          </div>
          <div className="w-10"></div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white p-5 rounded-sm shadow-sm border border-slate-100">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-800 mb-4 flex items-center gap-2"><User size={16} className="text-slate-500" /> Tailor Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Tailor Name *</label>
                <input type="text" value={tailorName} onChange={e => setTailorName(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 outline-none" placeholder="e.g. Lucy Kepher" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2 flex items-center gap-1"><Phone size={12}/> Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 outline-none" placeholder="07XXXXXXXX" />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.1em] font-bold text-slate-500 mb-2">Initial Notes</label>
                <textarea value={notes} onChange={e => setNotes(e.target.value)} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-sm focus:border-slate-400 outline-none resize-none" placeholder="Specialties, availability, etc." />
              </div>
            </div>
          </div>

          <button type="submit" className="w-full bg-black hover:bg-gray-900 text-white font-black uppercase tracking-[0.2em] py-4 rounded-sm shadow-lg transition-all active:scale-[0.98]">
            Save Tailor
          </button>
        </form>
      </main>
    </div>
  );
};

export default OnboardTailorForm;
