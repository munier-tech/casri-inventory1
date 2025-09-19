import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FiCalendar, FiDollarSign, FiPackage, FiRefreshCw, FiUser, FiSearch, FiTrash2, FiEdit, FiCheck, FiX } from "react-icons/fi";
import { toast } from "react-hot-toast";
import dayjs from "dayjs";
import useSalesStore from "../../store/UseSalesStore";

const DailySales = () => {
  const { dailySales, fetchDailySales, deleteSale, updateSale, loading, error } = useSalesStore();
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSales, setFilteredSales] = useState([]);
  const [editingSale, setEditingSale] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    quantity: 0,
    sellingCost: 0
  });

  useEffect(() => {
    fetchDailySales();
  }, [fetchDailySales]);

  useEffect(() => {
    if (dailySales && dailySales.sales) {
      let filtered = dailySales.sales;
      
      if (searchTerm) {
        filtered = filtered.filter(sale =>
          sale.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (sale.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) || "Qof")
        );
      }
      
      setFilteredSales(filtered);
    }
  }, [dailySales, searchTerm]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleRefresh = () => {
    fetchDailySales();
    toast.success("Iibka maanta si guul leh ayaa loo cusboonaysiiyay");
  };

  const handleDeleteSale = async (saleId) => {
    if (window.confirm("Ma hubtaa inaad rabto inaad tirtirto iibkan?")) {
      try {
        await deleteSale(saleId);
        toast.success("Iibka si guul leh ayaa loo tirtiray");
      } catch (error) {
        toast.error("Khalad ayaa dhacay marka la tirtirayo iibka");
      }
    }
  };

  const handleEditSale = (sale) => {
    setEditingSale(sale._id);
    setUpdatedData({
      quantity: sale.quantity,
      sellingCost: sale.sellingCost || sale.sellingPrice || 0
    });
  };

  const handleUpdateSale = async (saleId) => {
    try {
      await updateSale(saleId, updatedData);
      toast.success("Iibka si guul leh ayaa loo cusboonaysiiyay");
      setEditingSale(null);
    } catch (error) {
      toast.error("Khalad ayaa dhacay marka la cusboonaysiinayo iibka");
    }
  };

  const handleCancelEdit = () => {
    setEditingSale(null);
    setUpdatedData({ quantity: 0, sellingCost: 0 });
  };

  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || sale.total || 0), 0);
  const totalQuantity = filteredSales.reduce((sum, sale) => sum + sale.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-3 rounded-xl">
              <FiDollarSign className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Iibka Maanta
              </h1>
              <p className="text-gray-400">Diiwaanka iibka maanta</p>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Date Selector */}
           

            {/* Search Input */}
           
            <motion.button
              onClick={handleRefresh}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-xl text-white font-medium"
            >
              <FiRefreshCw className="w-5 h-5 mr-2" />
              Cusboonaysii
            </motion.button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-200 text-sm">Wadarta Iibka</p>
                <p className="text-2xl font-bold text-white">${totalSales.toFixed(2)}</p>
              </div>
              <FiDollarSign className="h-8 w-8 text-blue-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-200 text-sm">Tirada Alaabta</p>
                <p className="text-2xl font-bold text-white">{totalQuantity}</p>
              </div>
              <FiPackage className="h-8 w-8 text-green-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-200 text-sm">Tirada Iibka</p>
                <p className="text-2xl font-bold text-white">{filteredSales.length}</p>
              </div>
              <FiUser className="h-8 w-8 text-purple-200" />
            </div>
          </motion.div>
        </div>

        {/* Sales Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700"
        >
          <h2 className="text-xl font-bold text-white mb-6">Liiska Iibka Maanta</h2>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">iibka Maanta ...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-red-900/20 rounded-xl">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredSales.length === 0 ? (
            <div className="text-center py-12 bg-gray-700 rounded-xl">
              <FiDollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {searchTerm ? 
                  `Wax iib ah lagama helin "${searchTerm}"` : 
                  "Ma jiro iibka maanta."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="px-4 py-3 text-blue-300 font-semibold">Alaabta</th>
                    <th className="px-4 py-3 text-green-300 font-semibold">Tirada</th>
                    <th className="px-4 py-3 text-purple-300 font-semibold">Qiimaha</th>
                    <th className="px-4 py-3 text-yellow-300 font-semibold">Wadarta</th>
                    <th className="px-4 py-3 text-gray-300 font-semibold">Wakhti</th>
                    <th className="px-4 py-3 text-red-300 font-semibold">Ficilada</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale, index) => (
                    <motion.tr
                      key={sale._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-700 hover:bg-gray-750 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                            <FiPackage className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{sale.product?.name || "Alaab la'aan"}</p>
                            <p className="text-sm text-gray-400">ID: {sale.product?._id?.substring(0, 6)}...</p>
                          </div>
                        </div>
                      </td>
                      
                      {/* Quantity */}
                      <td className="px-4 py-3">
                        {editingSale === sale._id ? (
                          <input
                            type="number"
                            min="1"
                            value={updatedData.quantity}
                            onChange={(e) => setUpdatedData({
                              ...updatedData,
                              quantity: parseInt(e.target.value) || 0
                            })}
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        ) : (
                          <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded-lg text-sm">
                            {sale.quantity}
                          </span>
                        )}
                      </td>
                      
                      {/* Selling Cost */}
                      <td className="px-4 py-3">
                        {editingSale === sale._id ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={updatedData.sellingCost}
                            onChange={(e) => setUpdatedData({
                              ...updatedData,
                              sellingCost: parseFloat(e.target.value) || 0
                            })}
                            className="w-20 px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        ) : (
                          <span className="text-blue-300 font-medium">
                            ${sale.sellingCost?.toFixed(2) || sale.sellingPrice?.toFixed(2)}
                          </span>
                        )}
                      </td>
                      
                      {/* Total Amount */}
                      <td className="px-4 py-3 text-emerald-300 font-bold">
                        ${(editingSale === sale._id 
                          ? (updatedData.quantity * updatedData.sellingCost).toFixed(2)
                          : (sale.totalAmount || sale.total || 0).toFixed(2)
                        )}
                      </td>
                      
                     
                      
                      <td className="px-4 py-3 text-gray-400 text-sm">
                        {dayjs(sale.createdAt).format("HH:mm")}
                      </td>
                      
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {editingSale === sale._id ? (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdateSale(sale._id)}
                                className="p-2 bg-green-700 hover:bg-green-600 rounded-lg text-white"
                                title="Kaydi"
                              >
                                <FiCheck className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCancelEdit}
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                                title="Jooji"
                              >
                                <FiX className="h-4 w-4" />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEditSale(sale)}
                                className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-white"
                                title="Wax ka beddel iibka"
                              >
                                <FiEdit className="h-4 w-4" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDeleteSale(sale._id)}
                                className="p-2 bg-red-700 hover:bg-red-600 rounded-lg text-white"
                                title="Tirtir iibka"
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Summary */}
          {filteredSales.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-6 p-4 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl border border-gray-600"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Wadarta Iibka</p>
                  <p className="text-xl font-bold text-emerald-400">${totalSales.toFixed(2)}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Tirada Alaabta</p>
                  <p className="text-xl font-bold text-blue-400">{totalQuantity}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Tirada Iibka</p>
                  <p className="text-xl font-bold text-purple-400">{filteredSales.length}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Qiimaha Dhexe</p>
                  <p className="text-xl font-bold text-yellow-400">
                    ${(totalSales / totalQuantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DailySales;