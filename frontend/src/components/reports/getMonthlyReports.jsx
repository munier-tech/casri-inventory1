import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { motion, AnimatePresence } from 'framer-motion';
import useSalesReportStore from '../../store/useMonthlyReport';

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
  } = useSalesReportStore();

  const [localYear, setLocalYear] = useState(selectedYear);
  const [localMonth, setLocalMonth] = useState(selectedMonth);

  // Initialize with current month's data
  useEffect(() => {
    fetchMonthlyReport(selectedYear, selectedMonth);
  }, []);

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
    const prevYear = newDate.year();
    const prevMonth = newDate.month() + 1;
    setLocalYear(prevYear);
    setLocalMonth(prevMonth);
    setSelectedDate(prevYear, prevMonth);
    fetchMonthlyReport(prevYear, prevMonth);
  };

  const handleNextMonth = () => {
    const newDate = dayjs(`${localYear}-${localMonth}-01`).add(1, 'month');
    const nextYear = newDate.year();
    const nextMonth = newDate.month() + 1;
    setLocalYear(nextYear);
    setLocalMonth(nextMonth);
    setSelectedDate(nextYear, nextMonth);
    fetchMonthlyReport(nextYear, nextMonth);
  };

  // Generate years (last 5 years + next 1 year)
  const years = Array.from({ length: 7 }, (_, i) => dayjs().year() - 5 + i);
  
  const months = [
    { value: 1, name: 'Janaayo' },
    { value: 2, name: 'Febraayo' },
    { value: 3, name: 'Maarso' },
    { value: 4, name: 'Abriil' },
    { value: 5, name: 'Maayo' },
    { value: 6, name: 'Juun' },
    { value: 7, name: 'Luuliyo' },
    { value: 8, name: 'Agosto' },
    { value: 9, name: 'Sebtembar' },
    { value: 10, name: 'Oktoobar' },
    { value: 11, name: 'Nofembar' },
    { value: 12, name: 'Desembar' }
  ];

  // Loading spinner component
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4 max-w-7xl"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Warbixinta Bisha
        </h1>
        <p className="text-gray-600">Hel warbixinta iibka bisha aad dooratay</p>
      </motion.div>

      {/* Date Selection Form */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8"
      >
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-6 items-end">
          <motion.div variants={itemVariants} className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Sanadka</label>
            <select
              value={localYear}
              onChange={(e) => setLocalYear(parseInt(e.target.value))}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants} className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold text-gray-700 mb-3">Bisha</label>
            <select
              value={localMonth}
              onChange={(e) => setLocalMonth(parseInt(e.target.value))}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-lg font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              {months.map(month => (
                <option key={month.value} value={month.value}>
                  {month.name}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants} className="flex gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              disabled={loading}
            >
              📊 Soo Xulasho
            </motion.button>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handlePreviousMonth}
                className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200"
              >
                ⬅️ Bishii Hore
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleCurrentMonth}
                className="bg-green-100 text-green-700 px-4 py-3 rounded-xl font-medium hover:bg-green-200 transition-all duration-200 border border-green-200"
              >
                🎯 Bisha Hadda
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={handleNextMonth}
                className="bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 border border-gray-200"
              >
                ➡️ Bisha Xigta
              </motion.button>
            </div>
          </motion.div>
        </form>
      </motion.div>

      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 shadow-sm"
          >
            <div className="flex items-center">
              <span className="text-lg mr-2">⚠️</span>
              <span className="font-medium">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Display */}
      <AnimatePresence mode="wait">
        {monthlyReport ? (
          <motion.div
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center mb-8"
            >
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Warbixinta Bisha {months.find(m => m.value === localMonth)?.name} {localYear}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
            </motion.div>
            
            {/* Summary Cards */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
            >
              <motion.div
                variants={cardVariants}
                className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border border-blue-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-blue-800">Wadarta Iibka</h3>
                  <span className="text-2xl">💰</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">
                  ${monthlyReport.totalSales?.toLocaleString()}
                </p>
                <div className="mt-2 h-1 bg-blue-200 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-blue-500 rounded-full"
                  />
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border border-green-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-green-800">Tirada Iibka</h3>
                  <span className="text-2xl">📈</span>
                </div>
                <p className="text-3xl font-bold text-green-600">
                  {monthlyReport.count}
                </p>
                <div className="mt-2 h-1 bg-green-200 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.7 }}
                    className="h-full bg-green-500 rounded-full"
                  />
                </div>
              </motion.div>
              
              <motion.div
                variants={cardVariants}
                className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border border-purple-200 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-purple-800">Celceliska Iibka</h3>
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  ${monthlyReport.count > 0 ? (monthlyReport.totalSales / monthlyReport.count).toFixed(2) : 0}
                </p>
                <div className="mt-2 h-1 bg-purple-200 rounded-full">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, delay: 0.9 }}
                    className="h-full bg-purple-500 rounded-full"
                  />
                </div>
              </motion.div>
            </motion.div>

            {/* Sales List */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <span className="mr-2">📋</span>
                Liiska Iibka
              </h3>
              
              {monthlyReport.sales?.length > 0 ? (
                <div className="overflow-x-auto rounded-2xl border border-gray-200">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                        <th className="py-4 px-6 text-left font-semibold text-gray-700 border-b">Taariikhda</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700 border-b">Magaca Alaabta</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700 border-b">Tirada</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700 border-b">Qiimaha</th>
                        <th className="py-4 px-6 text-left font-semibold text-gray-700 border-b">Iibiyaha</th>
                      </tr>
                    </thead>
                    <tbody>
                      {monthlyReport.sales.map((sale, index) => (
                        <motion.tr
                          key={sale._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <td className="py-4 px-6 font-medium text-gray-600">
                            {dayjs(sale.createdAt).format('DD/MM/YYYY HH:mm')}
                          </td>
                          <td className="py-4 px-6 font-medium text-gray-800">
                            {sale.product?.name || 'N/A'}
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              {sale.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-semibold text-green-600">
                            ${sale.totalAmount?.toLocaleString()}
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                              {sale.user?.username || 'N/A'}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <span className="text-6xl mb-4">📭</span>
                  <p className="text-gray-500 text-lg">Wax iib ah lama helin bishan.</p>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-8 py-6 rounded-2xl text-center"
            >
              <span className="text-4xl mb-3">📅</span>
              <p className="text-lg font-medium">
                Dooro sanad iyo bisha aad rabto inaad warbixinta ka hesho.
              </p>
            </motion.div>
          )
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GetMonthlyReport;