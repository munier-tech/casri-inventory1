import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import useReportStore from '../../store/useMonthlyReport';

const GetMonthlyReport = () => {
  const {
    monthlyReport,
    loading,
    error,
    selectedYear,
    selectedMonth,
    fetchMonthlyReport,
    setSelectedDate,
    clearError
  } = useReportStore();

  const [localYear, setLocalYear] = useState(selectedYear);
  const [localMonth, setLocalMonth] = useState(selectedMonth);

  useEffect(() => {
    fetchMonthlyReport(selectedYear, selectedMonth);
  }, []);

  // Calculate profit for a single sale
  const calculateSaleProfit = (sale) => {
    const productCost = sale.product?.cost || 0;
    const sellingPrice = sale.sellingCost || sale.sellingPrice || 0;
    const quantity = sale.quantity || 0;
    
    const profitPerUnit = sellingPrice - productCost;
    const totalProfit = profitPerUnit * quantity;
    
    return {
      profitPerUnit,
      totalProfit,
      profitMargin: sellingPrice > 0 ? (profitPerUnit / sellingPrice) * 100 : 0
    };
  };

  // Calculate total profit for all sales
  const calculateTotalProfit = (sales) => {
    if (!sales || !Array.isArray(sales)) return 0;
    
    return sales.reduce((total, sale) => {
      const profitData = calculateSaleProfit(sale);
      return total + profitData.totalProfit;
    }, 0);
  };

  // Calculate total revenue from sales
  const calculateTotalRevenue = (sales) => {
    if (!sales || !Array.isArray(sales)) return 0;
    
    return sales.reduce((total, sale) => {
      return total + (sale.totalAmount || sale.total || 0);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setSelectedDate(localYear, localMonth);
    await fetchMonthlyReport(localYear, localMonth);
  };

  const handleCurrentMonth = () => {
    const currentYear = dayjs().year();
    const currentMonth = dayjs().month() + 1;
    setLocalYear(currentYear);
    setLocalMonth(currentMonth);
    setSelectedDate(currentYear, currentMonth);
    fetchMonthlyReport(currentYear, currentMonth);
  };

  const handlePreviousMonth = () => {
    const newDate = dayjs(`${localYear}-${localMonth}-01`).subtract(1, 'month');
    setLocalYear(newDate.year());
    setLocalMonth(newDate.month() + 1);
    setSelectedDate(newDate.year(), newDate.month() + 1);
    fetchMonthlyReport(newDate.year(), newDate.month() + 1);
  };

  const handleNextMonth = () => {
    const newDate = dayjs(`${localYear}-${localMonth}-01`).add(1, 'month');
    setLocalYear(newDate.year());
    setLocalMonth(newDate.month() + 1);
    setSelectedDate(newDate.year(), newDate.month() + 1);
    fetchMonthlyReport(newDate.year(), newDate.month() + 1);
  };

  const years = Array.from({ length: 7 }, (_, i) => dayjs().year() - 5 + i);
  const months = [
    { value: 1, name: 'Janaayo' }, { value: 2, name: 'Febraayo' }, { value: 3, name: 'Maarso' },
    { value: 4, name: 'Abriil' }, { value: 5, name: 'Maayo' }, { value: 6, name: 'Juun' },
    { value: 7, name: 'Luuliyo' }, { value: 8, name: 'Agosto' }, { value: 9, name: 'Sebtembar' },
    { value: 10, name: 'Oktoobar' }, { value: 11, name: 'Nofembar' }, { value: 12, name: 'Desembar' }
  ];

  const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-64">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center space-y-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
        />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 font-medium"
        >
          Warbixinta banaanka loo wada...
        </motion.p>
      </motion.div>
    </div>
  );

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
  const cardVariants = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

  if (loading) return <LoadingSpinner />;

  const renderTable = (data, columns, title, colorEmoji) => {
    if (!data || data.length === 0) return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
        <span className="text-6xl mb-4">{colorEmoji}</span>
        <p className="text-gray-500 text-lg">Ma jirto wax rikoodh ah bishan.</p>
      </motion.div>
    );

    return (
      <div className="overflow-x-auto rounded-2xl border border-gray-200 mb-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">{colorEmoji} {title}</h3>
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
              {columns.map(col => <th key={col.key} className="py-4 px-6 text-left font-semibold text-gray-700 border-b">{col.label}</th>)}
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => (
              <motion.tr
                key={row._id || idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
              >
                {columns.map(col => (
                  <td key={col.key} className="py-4 px-6 font-medium text-gray-700">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Calculate profit-related totals
  const totalRevenue = monthlyReport ? calculateTotalRevenue(monthlyReport.sales) : 0;
  const totalProfit = monthlyReport ? calculateTotalProfit(monthlyReport.sales) : 0;
  const totalProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return (
    <motion.div className="container mx-auto p-4 max-w-7xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Warbixinta Bisha
        </h1>
        <p className="text-gray-600">Hel warbixinta dhammaan macaamilada bishan</p>
      </motion.div>

      {/* Date Selection */}
      <motion.div variants={cardVariants} initial="hidden" animate="visible" className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8">
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-6 items-end">
          <motion.div variants={itemVariants} className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Sanadka</label>
            <select value={localYear} onChange={e => setLocalYear(parseInt(e.target.value))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </motion.div>
          <motion.div variants={itemVariants} className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Bisha</label>
            <select value={localMonth} onChange={e => setLocalMonth(parseInt(e.target.value))} className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200">
              {months.map(m => <option key={m.value} value={m.value}>{m.name}</option>)}
            </select>
          </motion.div>
          <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
            <button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200">📊 Soo Xulasho</button>
            <button type="button" onClick={handlePreviousMonth} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200">⬅️ Hore</button>
            <button type="button" onClick={handleCurrentMonth} className="bg-green-100 text-green-700 px-4 py-3 rounded-xl font-medium hover:bg-green-200 transition-all duration-200 border border-green-200">🎯 Hadda</button>
            <button type="button" onClick={handleNextMonth} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200">➡️ Xiga</button>
          </motion.div>
        </form>
      </motion.div>

      {/* Error */}
      <AnimatePresence>{error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm">
          <div className="flex items-center">
            <span className="text-lg mr-2">⚠️</span>
            <span className="font-medium">{error}</span>
          </div>
        </motion.div>
      )}</AnimatePresence>

      {/* Totals */}
      {monthlyReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-blue-50 p-6 rounded-2xl border border-blue-200 shadow-sm"
          >
            <h3 className="font-semibold text-blue-800 mb-2">Wadarta Dakhliga</h3>
            <p className="text-3xl font-bold text-blue-600">${monthlyReport.totals.totalIncome?.toLocaleString()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-red-50 p-6 rounded-2xl border border-red-200 shadow-sm"
          >
            <h3 className="font-semibold text-red-800 mb-2">Wadarta Kharashka</h3>
            <p className="text-3xl font-bold text-red-600">${monthlyReport.totals.totalExpenses?.toLocaleString()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-green-50 p-6 rounded-2xl border border-green-200 shadow-sm"
          >
            <h3 className="font-semibold text-green-800 mb-2">Balance</h3>
            <p className="text-3xl font-bold text-green-600">${monthlyReport.totals.balance?.toLocaleString()}</p>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-amber-50 p-6 rounded-2xl border border-amber-200 shadow-sm"
          >
            <h3 className="font-semibold text-amber-800 mb-2">Wadarta Faaiidada</h3>
            <p className="text-3xl font-bold text-amber-600">${totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p className="text-sm text-amber-700 mt-1">
              {totalProfitMargin.toFixed(1)}% Faaiido
            </p>
          </motion.div>
        </div>
      )}

      {/* Tables for each type */}
      {monthlyReport && (
        <>
          {renderTable(monthlyReport.sales, [
            { key: 'createdAt', label: 'Taariikhda', render: row => dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') },
            { key: 'product', label: 'Magaca Alaabta', render: row => row.product?.name || 'N/A' },
            { key: 'quantity', label: 'Tirada' },
            { key: 'cost', label: 'Qiimaha Alaabta', render: row => `$${(row.product?.cost || 0).toFixed(2)}` },
            { key: 'sellingPrice', label: 'Qiimaha Iibka', render: row => `$${(row.sellingCost || row.sellingPrice || 0).toFixed(2)}` },
            { key: 'profit', label: 'Faaiidada', render: row => {
              const profitData = calculateSaleProfit(row);
              return (
                <div className={`font-semibold ${profitData.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${profitData.totalProfit.toFixed(2)}
                  <div className="text-xs text-gray-500">
                    {profitData.profitMargin.toFixed(1)}%
                  </div>
                </div>
              );
            }},
            { key: 'totalAmount', label: 'Wadarta', render: row => `$${row.totalAmount?.toLocaleString()}` },
            { key: 'user', label: 'Iibiyaha', render: row => row.user?.username || 'N/A' }
          ], 'Sales', '💰')}

          {renderTable(monthlyReport.loans, [
            { key: 'createdAt', label: 'Taariikhda', render: row => dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') },
            { key: 'personName', label: 'Qofka ama Shirkadda ama Alaabta' },
            { key: 'quantity', label: 'Tirada' },
            { key: 'amount', label: 'Lacagta', render: row => `$${row.amount?.toLocaleString()}` },
            { key: 'user', label: 'Ka sameeyay', render: row => row.user?.username || 'N/A' }
          ], 'Loans', '💸')}

          {renderTable(monthlyReport.financialIncomes, [
            { key: 'createdAt', label: 'Taariikhda', render: row => dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') },
            { key: 'source', label: 'Ilaha' },
            { key: 'amount', label: 'Lacagta', render: row => `$${row.amount?.toLocaleString()}` },
            { key: 'user', label: 'Ka sameeyay', render: row => row.user?.username || 'N/A' }
          ], 'Financial Incomes', '💵')}

          {renderTable(monthlyReport.expenses, [
            { key: 'createdAt', label: 'Taariikhda', render: row => dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') },
            { key: 'name', label: 'Magaca' },
            { key: 'amount', label: 'Qiimaha', render: row => `$${row.amount?.toLocaleString()}` },
            { key: 'user', label: 'Ka sameeyay', render: row => row.user?.username || 'N/A' }
          ], 'Expenses', '🛒')}

          {renderTable(monthlyReport.purchases, [
            { key: 'createdAt', label: 'Taariikhda', render: row => dayjs(row.createdAt).format('DD/MM/YYYY HH:mm') },
            { key: 'product', label: 'Magaca Alaabta', render: row => row.product?.name || 'N/A' },
            { key: 'quantity', label: 'Tirada' },
            { key: 'totalAmount', label: 'Qiimaha', render: row => `$${row.totalAmount?.toLocaleString()}` },
            { key: 'supplier', label: 'Iibiyaha', render: row => row.supplier?.username || 'N/A' }
          ], 'Purchases', '📦')}
        </>
      )}
    </motion.div>
  );
};

export default GetMonthlyReport;