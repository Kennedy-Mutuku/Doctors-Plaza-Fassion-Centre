import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Users, DollarSign, ShoppingBag, Scissors, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import Header from '../components/Header';

const AdminDashboard = () => {
  const navigate = useNavigate();

  // State for data
  const [stock, setStock] = useState([]);
  const [sales, setSales] = useState([]);
  const [tailorPayments, setTailorPayments] = useState([]);
  const [tailorExpenses, setTailorExpenses] = useState([]);
  const [tailors, setTailors] = useState([]);
  const [tailoringOrders, setTailoringOrders] = useState([]);

  // State for dates
  const today = new Date().toISOString().split('T')[0];
  const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
  
  const [fromDate, setFromDate] = useState(firstDayOfMonth);
  const [toDate, setToDate] = useState(today);

  // Load data on mount
  useEffect(() => {
    const savedStock = localStorage.getItem('lucy_stock');
    if (savedStock) setStock(JSON.parse(savedStock));
    
    const savedSales = localStorage.getItem('lucy_sales');
    if (savedSales) setSales(JSON.parse(savedSales));
    
    const savedTailorPayments = localStorage.getItem('lucy_tailoring_payments');
    if (savedTailorPayments) setTailorPayments(JSON.parse(savedTailorPayments));
    
    const savedTailorExpenses = localStorage.getItem('lucy_tailor_expenses');
    if (savedTailorExpenses) setTailorExpenses(JSON.parse(savedTailorExpenses));

    const savedTailors = localStorage.getItem('lucy_tailors');
    if (savedTailors) setTailors(JSON.parse(savedTailors));

    const savedOrders = localStorage.getItem('lucy_tailoring_orders');
    if (savedOrders) setTailoringOrders(JSON.parse(savedOrders));
  }, []);

  // Filter Logic
  const filteredStock = stock.filter(item => item.date >= fromDate && item.date <= toDate);
  const filteredSales = sales.filter(sale => sale.date >= fromDate && sale.date <= toDate);
  const filteredTailorPayments = tailorPayments.filter(payment => payment.date >= fromDate && payment.date <= toDate);
  const filteredTailorExpenses = tailorExpenses.filter(expense => expense.date >= fromDate && expense.date <= toDate);

  // --- Calculations ---

  // Boutique
  const stockInValue = filteredStock.reduce((sum, item) => sum + (item.quantity * (item.buyingPrice || 0)), 0);
  const stockOutRevenue = filteredSales.reduce((sum, sale) => sum + (sale.soldPrice || 0), 0);
  const boutiqueProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0);
  const itemsSold = filteredSales.length;
  const itemsStocked = filteredStock.reduce((sum, item) => sum + (item.quantity || 0), 0);

  // Tailoring
  const tailoringRevenue = filteredTailorPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const tailoringExpenses = filteredTailorExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
  const tailoringProfit = tailoringRevenue - tailoringExpenses;
  const totalTailors = tailors.length;

  // Overall
  const totalRevenue = stockOutRevenue + tailoringRevenue;
  const totalExpenses = stockInValue + tailoringExpenses; // Treating stock in as an expense/investment for the period
  const netProfit = boutiqueProfit + tailoringProfit;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-pink-500 selection:text-white pb-20">
      <Header />
      
      <main className="pt-[120px] px-4 md:px-8 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <button 
              onClick={() => navigate('/')}
              className="flex items-center text-white/50 hover:text-white transition-colors text-sm font-medium mb-2"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </button>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
              Rev Kepher Omondi Dashboard
            </h1>
            <p className="text-white/40 text-sm mt-1 flex items-center">
              <Activity size={14} className="mr-2" /> Remote Business Tracking
            </p>
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-2 bg-white/5 p-2 rounded-lg border border-white/10 backdrop-blur-md">
            <Calendar size={16} className="text-white/40 ml-2" />
            <div className="flex items-center px-2">
              <span className="text-[10px] uppercase font-bold text-white/40 mr-2 tracking-widest">From</span>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent text-white text-sm font-medium focus:outline-none [color-scheme:dark]"
              />
            </div>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center px-2">
              <span className="text-[10px] uppercase font-bold text-white/40 mr-2 tracking-widest">To</span>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent text-white text-sm font-medium focus:outline-none [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        {/* Top Level Metrics (The big picture) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md hover:bg-white/[0.07] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">Total Revenue</p>
                <h2 className="text-3xl font-black text-white">Ksh {totalRevenue.toLocaleString()}</h2>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400">
                <span className="font-black text-xl">KSh</span>
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md hover:bg-white/[0.07] transition-all duration-300">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-pink-500"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">Total Expenses/Stock</p>
                <h2 className="text-3xl font-black text-white">Ksh {totalExpenses.toLocaleString()}</h2>
              </div>
              <div className="p-3 bg-rose-500/10 rounded-lg text-rose-400">
                <TrendingDown size={24} />
              </div>
            </div>
          </div>

          <div className="relative group overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-6 backdrop-blur-md hover:bg-white/[0.07] transition-all duration-300">
            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${netProfit >= 0 ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-rose-500'}`}></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-widest text-white/50 font-bold mb-1">Net Profit</p>
                <h2 className={`text-3xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {netProfit >= 0 ? '+' : '-'}Ksh {Math.abs(netProfit).toLocaleString()}
                </h2>
              </div>
              <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                <TrendingUp size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Boutique Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-violet-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="p-2 bg-violet-500/20 text-violet-400 rounded-lg">
                <ShoppingBag size={20} />
              </div>
              <h3 className="text-lg font-bold">Boutique Performance</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Stock Value In</span>
                <span className="font-bold">Ksh {stockInValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Sales Revenue</span>
                <span className="font-bold">Ksh {stockOutRevenue.toLocaleString()}</span>
              </div>
              <div className="w-full h-px bg-white/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Boutique Profit</span>
                <span className={`font-black ${boutiqueProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {boutiqueProfit >= 0 ? '+' : '-'}Ksh {Math.abs(boutiqueProfit).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Items Sold</p>
                  <p className="text-xl font-bold">{itemsSold}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Items Stocked</p>
                  <p className="text-xl font-bold">{itemsStocked}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Tailoring Breakdown */}
          <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Scissors size={20} />
              </div>
              <h3 className="text-lg font-bold">Tailoring Performance</h3>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-white/60">Tailoring Revenue</span>
                <span className="font-bold">Ksh {tailoringRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Tailoring Expenses</span>
                <span className="font-bold">Ksh {tailoringExpenses.toLocaleString()}</span>
              </div>
              <div className="w-full h-px bg-white/10"></div>
              <div className="flex justify-between items-center">
                <span className="text-white/60">Tailoring Profit</span>
                <span className={`font-black ${tailoringProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tailoringProfit >= 0 ? '+' : '-'}Ksh {Math.abs(tailoringProfit).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Total Orders</p>
                  <p className="text-xl font-bold">{filteredTailorPayments.length}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4 border border-white/5 flex flex-col justify-between">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Active Tailors</p>
                  <div className="flex items-center justify-between">
                    <p className="text-xl font-bold">{totalTailors}</p>
                    <Users size={16} className="text-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Activity Logs */}
        <div className="mt-8 space-y-8">
          
          {/* Boutique Sales Log */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <ShoppingBag size={18} className="text-violet-400" /> Recent Boutique Sales
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Customer Info</th>
                    <th className="pb-3 pr-4">Product</th>
                    <th className="pb-3 text-right">Amount (Ksh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredSales.length > 0 ? filteredSales.map((sale, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-sm text-white/70">{sale.date}</td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-white">{sale.customerName || 'Walk-in'}</span>
                          <span className="text-[10px] text-white/50">{sale.customerPhone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-sm text-white/70">{sale.itemName || sale.name || 'N/A'}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{sale.soldPrice?.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-sm text-white/40">No recent sales found in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tailoring Orders / Payments Log */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Scissors size={18} className="text-emerald-400" /> Recent Tailoring Payments (Installments & Deposits)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Customer Info</th>
                    <th className="pb-3 pr-4">Product(s)</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 text-right">Amount Paid (Ksh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTailorPayments.length > 0 ? filteredTailorPayments.map((payment, i) => {
                    const order = tailoringOrders.find(o => o.id === payment.orderId);
                    const customerName = order?.customerName || payment.customerName || 'N/A';
                    const customerPhone = order?.customerPhone || 'N/A';
                    const itemsDesc = order?.items?.map(item => `${item.qty}x ${item.type}`).join(', ') || 'Tailoring Service';
                    const paymentType = payment.type || 'Payment';

                    return (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 pr-4 text-sm text-white/70">{payment.date}</td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white">{customerName}</span>
                            <span className="text-[10px] text-white/50">{customerPhone}</span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-sm text-white/70">{itemsDesc}</td>
                        <td className="py-3 pr-4">
                          <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                            {paymentType}
                          </span>
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-400">{payment.amount?.toLocaleString()}</td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan="5" className="py-6 text-center text-sm text-white/40">No payments found in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tailor Expenses Log */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Users size={18} className="text-rose-400" /> Tailor Payouts (Who Was Paid)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs uppercase tracking-widest text-white/40">
                    <th className="pb-3 pr-4">Date</th>
                    <th className="pb-3 pr-4">Tailor Name</th>
                    <th className="pb-3 pr-4">Reason</th>
                    <th className="pb-3 text-right">Amount (Ksh)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTailorExpenses.length > 0 ? filteredTailorExpenses.map((expense, i) => (
                    <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4 text-sm text-white/70">{expense.date}</td>
                      <td className="py-3 pr-4 text-sm font-medium">{expense.tailorName || 'N/A'}</td>
                      <td className="py-3 pr-4 text-sm text-white/70">{expense.reason || expense.description || 'N/A'}</td>
                      <td className="py-3 text-right font-bold text-rose-400">{expense.amount?.toLocaleString()}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="py-6 text-center text-sm text-white/40">No tailor payouts found in this period.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
