import { useEffect, useState, useRef } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiPackage, FiDollarSign, FiSearch, FiTag, FiPrinter } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import useProductsStore from "../../store/useProductsStore";
import useCategoryStore from "../../store/useCategoryStore";

const GetProducts = () => {
  const { products, fetchProducts, deleteProduct, updateProduct } = useProductsStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [editingProduct, setEditingProduct] = useState(null);
  const [updatedData, setUpdatedData] = useState({
    name: "",
    cost: "",
    stock: "",
    lowStockThreshold: "",
    category: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const printRef = useRef();

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate totals based on ALL products (not filtered)
  const totalInventoryValue = products.reduce((total, product) => {
    return total + (parseFloat(product.cost) || 0) * (parseInt(product.stock) || 0);
  }, 0);

  const totalProducts = products.length;
  const lowStockItems = products.filter(product => 
    product.stock < (product.lowStockThreshold || 5)
  ).length;

  const getStockStatus = (stock, threshold = 5) => {
    if (stock === 0) return { status: "out", color: "text-red-600 bg-red-50 border-red-200", text: "Dhamaatay" };
    if (stock <= threshold) return { status: "low", color: "text-amber-600 bg-amber-50 border-amber-200", text: `Yar ${stock}` };
    return { status: "high", color: "text-green-600 bg-green-50 border-green-200", text: `Kaydka: ${stock}` };
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ma hubtaa inaad rabto inaad tirtirto alaabtan?")) {
      try {
        await deleteProduct(id);
        toast.success("Alaabta waa la tirtiray");
      } catch {
        toast.error("Khalad ayaa dhacay marka la tirtiray alaabta");
      }
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product._id);
    setUpdatedData({
      name: product.name,
      cost: product.cost,
      stock: product.stock,
      lowStockThreshold: product.lowStockThreshold,
      category: product.category?._id || "",
    });
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("name", updatedData.name);
      formData.append("cost", updatedData.cost);
      formData.append("stock", updatedData.stock);
      formData.append("lowStockThreshold", updatedData.lowStockThreshold);
      formData.append("category", updatedData.category);

      await updateProduct(id, formData);
      toast.success("Alaabta si guul leh ayaa loo cusboonaysiiyay");
      setEditingProduct(null);
    } catch {
      toast.error("Khalad ayaa dhacay marka la cusboonaysiinayo alaabta");
    }
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setUpdatedData({
      name: "",
      cost: "",
      stock: "",
      lowStockThreshold: "",
      category: "",
    });
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Liiska Alaabta - Casri Electronics</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #000;
          }
          .print-header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .print-header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
          }
          .print-stats {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
            margin-bottom: 20px;
          }
          .stat-card {
            border: 1px solid #ddd;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
            font-size: 12px;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .text-right { text-align: right; }
          .text-center { text-align: center; }
          .out-of-stock { color: #dc2626; font-weight: bold; }
          .low-stock { color: #d97706; font-weight: bold; }
          .in-stock { color: #059669; font-weight: bold; }
          .total-row { background-color: #f9f9f9; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="print-header">
          <h1>Liiska Alaabta - Casri Electronics</h1>
          <p>Taariikh: ${new Date().toLocaleDateString('so-SO')}</p>
        </div>
        
        <div class="print-stats">
          <div class="stat-card">
            <p><strong>Qiimaha Wadarta</strong></p>
            <p>$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div class="stat-card">
            <p><strong>Wadarta Alaabta</strong></p>
            <p>${totalProducts}</p>
          </div>
          <div class="stat-card">
            <p><strong>Alaabta Yar</strong></p>
            <p>${lowStockItems}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Magaca Alaabta</th>
              <th>Qiimaha</th>
              <th>Kaydka</th>
              <th>Xaalada</th>
              <th>Qaybta</th>
            </tr>
          </thead>
          <tbody>
            ${products.map((product, index) => {
              const getStockStatusForPrint = (stock, threshold = 5) => {
                if (stock === 0) return { status: "out", text: "Dhamaatay" };
                if (stock <= threshold) return { status: "low", text: `Yar ${stock}` };
                return { status: "high", text: `Kaydka: ${stock}` };
              };
              
              const stockInfo = getStockStatusForPrint(product.stock, product.lowStockThreshold);
              const statusClass = stockInfo.status === 'out' ? 'out-of-stock' : 
                                stockInfo.status === 'low' ? 'low-stock' : 'in-stock';
              
              return `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td>${product.name}</td>
                  <td class="text-right">$${parseFloat(product.cost || 0).toFixed(2)}</td>
                  <td class="text-center">${product.stock || 0}</td>
                  <td class="${statusClass}">${stockInfo.text}</td>
                  <td>${product.category?.name || "Qayb la'aan"}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
          <tfoot>
            <tr class="total-row">
              <td colspan="2" class="text-right"><strong>Wadarta Guud:</strong></td>
              <td class="text-right"><strong>$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              <td class="text-center"><strong>${products.reduce((sum, product) => sum + parseInt(product.stock || 0), 0)}</strong></td>
              <td colspan="2"></td>
            </tr>
          </tfoot>
        </table>

        <div style="margin-top: 30px; font-size: 11px; color: #666; text-align: center;">
          <p>Liiskan waxaa soo saaray Casri Electronics System - ${new Date().toLocaleString('so-SO')}</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Wait a bit for the content to render
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Don't close immediately to allow print dialog to show
      }, 250);
    } else {
      alert('Please allow popups for printing');
    }
  };

  const content = {
    title: "Liiska Alaabta",
    tableHeaders: ["Alaabta", "Magac", "Qiimaha", "Kaydka", "Qaybta", "Ficilada"],
    noProducts: "Lama helin alaabo",
    edit: "Wax ka beddel",
    delete: "Tirtir",
    save: "Kaydi",
    cancel: "Jooji",
    addProduct: "Ku dar Alaab",
    totalValue: "Qiimaha Wadarta",
    totalProducts: "Wadarta Alaabta",
    lowStock: "Alaabta Yar",
    searchPlaceholder: "Raadi Alaabtad Rabto magaceeda...",
    searchResults: "alaabood oo la helay",
    showingResults: "Waxa la muujinayaa",
    of: "oo ka mid ah",
    clearSearch: "Nadiifinta raadinta",
    print: "Print",
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-xl mr-4 backdrop-blur-sm">
                  <FiPackage className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{content.title}</h2>
                  <p className="text-blue-100">Maamulka alaabta</p>
                </div>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(59,130,246,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrint}
                  className="flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-xl font-semibold shadow-lg backdrop-blur-sm"
                >
                  <FiPrinter className="w-5 h-5 mr-2" />
                  {content.print}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(255,255,255,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-6 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-xl font-semibold shadow-lg"
                  onClick={() => (window.location.href = "/createProduct")}
                >
                  <FiPlus className="w-5 h-5 mr-2" />
                  {content.addProduct}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Inventory Value */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-blue-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{content.totalValue}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">
                      ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <FiDollarSign className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </motion.div>

              {/* Total Products */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-blue-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{content.totalProducts}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{totalProducts}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FiPackage className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </motion.div>

              {/* Low Stock Items */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl p-6 shadow-lg border border-blue-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-600">{content.lowStock}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{lowStockItems}</p>
                    <p className="text-xs text-red-500 mt-1">Alaabta u dhow inay Dhamaato</p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-lg">
                    <FiTag className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Search Section */}
          <div className="p-6 bg-white border-b border-gray-200">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Raadi Alaabta</h3>
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative flex-1 max-w-lg">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiSearch className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder={content.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:shadow-lg transition-all duration-200 text-lg"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-100 rounded-full p-1"
                      title={content.clearSearch}
                    >
                      <FiX className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>
                
                {/* Search Results Info */}
                {searchTerm && (
                  <div className="flex items-center gap-2 text-sm bg-blue-50 px-4 py-2 rounded-lg border border-blue-200">
                    <span className="font-medium text-blue-700">{content.showingResults}</span>
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {filteredProducts.length}
                    </span>
                    <span className="text-blue-600">{content.of}</span>
                    <span className="font-medium text-blue-700">{products.length}</span>
                    <span className="text-blue-600">{content.searchResults}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="p-6 overflow-x-auto">
            <table className="w-full min-w-[800px] rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-gradient-to-r from-blue-50 to-indigo-50">
                  {content.tableHeaders.map((header, index) => (
                    <th 
                      key={index} 
                      className="px-6 py-4 text-blue-700 font-semibold text-left border-b border-blue-100"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProducts && filteredProducts.length > 0 ? (
                  filteredProducts.map((product, index) => {
                    const stockInfo = getStockStatus(product.stock, product.lowStockThreshold);
                    
                    return (
                      <motion.tr
                        key={product._id}
                        className={`border-b border-gray-100 hover:bg-blue-50 transition-colors duration-200 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.005 }}
                      >
                        {/* Product Icon and Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                              <FiPackage className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-800">{product.name}</span>
                              <span className={`text-xs px-2 py-1 rounded-full border ${stockInfo.color} mt-1`}>
                                {stockInfo.text}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Name */}
                        <td className="px-6 py-4">
                          {editingProduct === product._id ? (
                            <input
                              type="text"
                              value={updatedData.name}
                              onChange={(e) => setUpdatedData({ ...updatedData, name: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800">{product.name}</span>
                              {searchTerm && (
                                <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded border border-yellow-200">
                                  La helay
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Cost */}
                        <td className="px-6 py-4">
                          {editingProduct === product._id ? (
                            <input
                              type="number"
                              value={updatedData.cost}
                              onChange={(e) => setUpdatedData({ ...updatedData, cost: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <span className="font-semibold text-green-600 flex items-center">
                              <FiDollarSign className="w-4 h-4 mr-1" />
                              {product.cost}
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-4">
                          {editingProduct === product._id ? (
                            <input
                              type="number"
                              value={updatedData.stock}
                              onChange={(e) => setUpdatedData({ ...updatedData, stock: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className={`font-medium ${stockInfo.color.split(' ')[0]}`}>
                                {product.stock}
                              </span>
                              {product.stock > 0 && (
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div 
                                    className={`h-1.5 rounded-full ${
                                      product.stock > 10 ? 'bg-green-500' : 
                                      product.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                    style={{ 
                                      width: `${Math.min(100, (product.stock / Math.max(product.stock, 20)) * 100)}%` 
                                    }}
                                  ></div>
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Category */}
                        <td className="px-6 py-4">
                          {editingProduct === product._id ? (
                            <select
                              value={updatedData.category}
                              onChange={(e) => setUpdatedData({ ...updatedData, category: e.target.value })}
                              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="">-- Xulo Qaybta --</option>
                              {categories &&
                                categories.map((cat) => (
                                  <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                  </option>
                                ))}
                            </select>
                          ) : (
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                              {product.category?.name || "Qayb la'aan"}
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            {editingProduct === product._id ? (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1, boxShadow: "0 5px 15px -5px rgba(34,197,94,0.5)" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleUpdate(product._id)}
                                  className="p-2.5 bg-green-500 hover:bg-green-600 rounded-xl text-white shadow-md"
                                  title={content.save}
                                >
                                  <FiCheck className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1, boxShadow: "0 5px 15px -5px rgba(156,163,175,0.5)" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={handleCancel}
                                  className="p-2.5 bg-gray-500 hover:bg-gray-600 rounded-xl text-white shadow-md"
                                  title={content.cancel}
                                >
                                  <FiX className="w-4 h-4" />
                                </motion.button>
                              </>
                            ) : (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1, boxShadow: "0 5px 15px -5px rgba(59,130,246,0.5)" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEdit(product)}
                                  className="p-2.5 bg-blue-500 hover:bg-blue-600 rounded-xl text-white shadow-md"
                                  title={content.edit}
                                >
                                  <FiEdit2 className="w-4 h-4" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1, boxShadow: "0 5px 15px -5px rgba(239,68,68,0.5)" }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete(product._id)}
                                  className="p-2.5 bg-red-500 hover:bg-red-600 rounded-xl text-white shadow-md"
                                  title={content.delete}
                                >
                                  <FiTrash2 className="w-4 h-4" />
                                </motion.button>
                              </>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={content.tableHeaders.length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        {searchTerm ? (
                          <>
                            <FiSearch className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">Lama helin alaab la raadiyay</p>
                            <p className="text-sm text-gray-400 mt-1">
                              Ma jiraan alaabo magac ku jira "${searchTerm}"
                            </p>
                            <button
                              onClick={() => setSearchTerm("")}
                              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                            >
                              Daawo dhammaan alaabta
                            </button>
                          </>
                        ) : (
                          <>
                            <FiPackage className="w-16 h-16 mb-4 text-gray-300" />
                            <p className="text-lg font-medium">{content.noProducts}</p>
                            <p className="text-sm text-gray-400 mt-1">Ku dar alaab cusub si aad u bilowdo</p>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default GetProducts;