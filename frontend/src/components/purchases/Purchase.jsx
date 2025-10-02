import React, { useState, useEffect } from "react";
import usePurchaseStore from "../../store/usepurchaseStore";

const PurchaseManager = () => {
  const {
    purchases,
    getAllPurchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
    loading,
    error,
  } = usePurchaseStore();

  const [formData, setFormData] = useState({
    productName: "",
    supplierName: "",
    quantity: 1,
    price: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    getAllPurchases();
  }, [getAllPurchases]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await updatePurchase(editingId, formData);
      setEditingId(null);
    } else {
      await addPurchase(formData);
    }
    setFormData({
      productName: "",
      supplierName: "",
      quantity: 1,
      price: "",
      description: "",
    });
  };

  const handleEdit = (purchase) => {
    setEditingId(purchase._id);
    setFormData({
      productName: purchase.productName,
      supplierName: purchase.supplierName,
      quantity: purchase.quantity,
      price: purchase.price,
      description: purchase.description,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ma hubtaa inaad rabto inaad tirtirto iibkan?")) {
      await deletePurchase(id);
    }
  };

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(purchase =>
    purchase.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort purchases
  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.productName.localeCompare(b.productName);
      case "quantity":
        return b.quantity - a.quantity;
      case "price":
        return b.price - a.price;
      case "total":
        return (b.quantity * b.price) - (a.quantity * a.price);
      case "newest":
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  // Calculate total value
  const totalValue = filteredPurchases.reduce((sum, purchase) => 
    sum + (purchase.quantity * purchase.price), 0
  );

  // Calculate total quantity
  const totalQuantity = filteredPurchases.reduce((sum, purchase) => 
    sum + purchase.quantity, 0
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Maamulka Iibka Casri Electronics</h1>
          <p className="text-gray-600">Maamul alaabta Meheradu soo Daymaysatey iyo kaydka</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="bg-blue-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wadarta Iibka</p>
                <p className="text-2xl font-bold text-gray-900">{filteredPurchases.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="bg-green-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Wadarta Qiimaha</p>
                <p className="text-2xl font-bold text-gray-900">${totalValue.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="bg-purple-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tirada Alaabta</p>
                <p className="text-2xl font-bold text-gray-900">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center">
              <div className="bg-orange-100 p-3 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Qiimaha Dhexdhexaadka</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${filteredPurchases.length > 0 ? (totalValue / totalQuantity).toFixed(2) : "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                {editingId ? "🔄 Wax ka beddel Iibka" : "➕ Kudar Iib Cusub"}
              </h2>
              {editingId && (
                <button
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      productName: "",
                      supplierName: "",
                      quantity: 1,
                      price: "",
                      description: "",
                    });
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded-lg transition duration-200"
                >
                  ❌ Jooji waxka-bedelka
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📦 Magaca Alaabta
                  </label>
                  <input
                    type="text"
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="Geli magaca alaabta"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏢 Magaca Laga Soo daymaystey
                  </label>
                  <input
                    type="text"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    placeholder="Geli magaca Laga Soo Iibsadey"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔢 Tiro (Quantity)
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💰 Qiimo ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📝 Sharaxaad
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Sharaxaad ku saabsan alaabta..."
                  rows="3"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editingId ? "La diiwaan gelineyno..." : "La diiwaan gelineyno..."}
                  </span>
                ) : editingId ? (
                  "💾 Update Iibka"
                ) : (
                  "💾 Keydso Iibka"
                )}
              </button>
            </form>
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* List Section */}
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-3 lg:space-y-0">
              <h2 className="text-xl font-bold text-gray-800">📋 Liiska Deymaha Meherada</h2>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="🔍 Raadi alaabta ama iibsaha..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                  <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-40 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                >
                  <option value="newest">🆕 Ugu Cusub</option>
                  <option value="name">🔤 Magaca</option>
                  <option value="quantity">📊 Tiro</option>
                  <option value="price">💰 Qiimo</option>
                  <option value="total">💵 Wadarta</option>
                </select>
              </div>
            </div>

            {sortedPurchases.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-gray-500 text-lg">Ma jiro Dayn la heli karo</p>
                {searchTerm && (
                  <p className="text-gray-400 text-sm mt-2">Isku day Magac kale</p>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {sortedPurchases.map((purchase, index) => (
                  <div 
                    key={purchase._id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            Magaca Alaabta : {purchase.productName}
                          </h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              🏷️ Tiro: {purchase.quantity}
                            </span>
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                              💰 Qiimo: ${purchase.price}
                            </span>
                            <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-medium">
                              💵 Wadarta: ${(purchase.quantity * purchase.price).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(purchase)}
                          className="bg-yellow-100 text-yellow-700 p-2 rounded-lg hover:bg-yellow-200 transition duration-200 transform hover:scale-110"
                          title="Wax ka beddel"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(purchase._id)}
                          className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200 transition duration-200 transform hover:scale-110"
                          title="Tirtir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8  text-sm text-gray-800">
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                          <span className="font-semibold text-gray-700">Magaca Cida Daynta Leh:</span>
                          <span className="ml-2 font-bold text-green-500">{purchase.supplierName}</span>
                        </div>
                      </div>
                      
                      
                    </div>

                    {purchase.description && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-600 mt-0.5">📝</span>
                          <div>
                            <span className="text-sm font-medium text-blue-800">Sharaxaad:</span>
                            <p className="text-sm text-blue-700 mt-1">{purchase.description}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManager;