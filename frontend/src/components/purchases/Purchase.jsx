import React, { useState, useEffect, useRef } from "react";
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
    additionalPrice: "",
    subtractingPrice: "",
    description: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [successMessage, setSuccessMessage] = useState("");
  const [debugData, setDebugData] = useState("");
  const printRef = useRef();

  useEffect(() => {
    getAllPurchases();
  }, [getAllPurchases]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value 
    });
  };

  const calculateTotal = () => {
    const quantity = parseInt(formData.quantity) || 0;
    const price = parseFloat(formData.price) || 0;
    const additionalPrice = parseFloat(formData.additionalPrice) || 0;
    const subtractingPrice = parseFloat(formData.subtractingPrice) || 0;
    return (quantity * price) + additionalPrice - subtractingPrice;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Calculate total exactly like backend does
    const quantity = parseInt(formData.quantity) || 1;
    const price = parseFloat(formData.price) || 0;
    const additionalPrice = formData.additionalPrice ? parseFloat(formData.additionalPrice) : 0;
    const subtractingPrice = formData.subtractingPrice ? parseFloat(formData.subtractingPrice) : 0;
    
    const calculatedTotal = (quantity * price) + additionalPrice - subtractingPrice;

    // Prepare data for backend
    const submitData = {
      productName: formData.productName.trim(),
      supplierName: formData.supplierName.trim(),
      quantity: quantity,
      price: price,
      additionalPrice: additionalPrice,
      substractingPrice: subtractingPrice, // Map to backend field
      description: formData.description.trim(),
      total: calculatedTotal, // Explicitly send the calculated total
    };

    console.log("Submitting data:", submitData);
    console.log("Calculation:", `${quantity} * ${price} + ${additionalPrice} - ${subtractingPrice} = ${calculatedTotal}`);
    setDebugData(`Submitting: ${JSON.stringify(submitData, null, 2)}\nCalculation: ${quantity} * ${price} + ${additionalPrice} - ${subtractingPrice} = ${calculatedTotal}`);

    try {
      if (editingId) {
        console.log("Updating purchase:", editingId, submitData);
        const result = await updatePurchase(editingId, submitData);
        console.log("Update result:", result);
        setSuccessMessage("✅ Iibka si guul leh ayaa loo cusboonaysiiyay!");
        setEditingId(null);
      } else {
        console.log("Adding new purchase:", submitData);
        const result = await addPurchase(submitData);
        console.log("Add result:", result);
        setSuccessMessage("✅ Iibka cusub si guul leh ayaa loo diwaan geliyay!");
      }

      // Refresh data
      await getAllPurchases();

      // Reset form
      setFormData({
        productName: "",
        supplierName: "",
        quantity: 1,
        price: "",
        additionalPrice: "",
        subtractingPrice: "",
        description: "",
      });

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Submit error:", err);
      setDebugData(`Error: ${err.message}`);
    }
  };

  const handleEdit = (purchase) => {
    console.log("Editing purchase:", purchase);
    setEditingId(purchase._id);
    setFormData({
      productName: purchase.productName || "",
      supplierName: purchase.supplierName || "",
      quantity: purchase.quantity || 1,
      price: purchase.price?.toString() || "",
      additionalPrice: purchase.additionalPrice?.toString() || "",
      subtractingPrice: purchase.substractingPrice?.toString() || "", // Map from backend field
      description: purchase.description || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Ma hubtaa inaad rabto inaad tirtirto iibkan?")) {
      await deletePurchase(id);
      await getAllPurchases();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      productName: "",
      supplierName: "",
      quantity: 1,
      price: "",
      additionalPrice: "",
      subtractingPrice: "",
      description: "",
    });
  };

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const originalContent = document.body.innerHTML;
    
    document.body.innerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Liiska Iibka - Casri Electronics</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
            .print-header h1 { margin: 0; color: #333; }
            .print-header p { margin: 5px 0; color: #666; }
            .print-stats { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin-bottom: 20px; }
            .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-value { font-size: 18px; font-weight: bold; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f5f5f5; font-weight: bold; }
            .text-right { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: bold; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Liiska Iibka - Casri Electronics</h1>
            <p>Taariikh: ${new Date().toLocaleDateString('so-SO')}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `;
    
    window.print();
    document.body.innerHTML = originalContent;
    window.location.reload();
  };

  const filteredPurchases = purchases.filter(purchase =>
    purchase.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    purchase.supplierName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedPurchases = [...filteredPurchases].sort((a, b) => {
    const totalA = (a.quantity * a.price) + (Number(a.additionalPrice) || 0) - (Number(a.substractingPrice) || 0);
    const totalB = (b.quantity * b.price) + (Number(b.additionalPrice) || 0) - (Number(b.substractingPrice) || 0);

    switch (sortBy) {
      case "name":
        return a.productName.localeCompare(b.productName);
      case "quantity":
        return b.quantity - a.quantity;
      case "price":
        return b.price - a.price;
      case "total":
        return totalB - totalA;
      case "newest":
      default:
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    }
  });

  const totalValue = filteredPurchases.reduce((sum, purchase) => {
    const baseTotal = purchase.quantity * purchase.price;
    const additional = Number(purchase.additionalPrice) || 0;
    const subtracting = Number(purchase.substractingPrice) || 0;
    return sum + baseTotal + additional - subtracting;
  }, 0);

  const totalQuantity = filteredPurchases.reduce((sum, purchase) => sum + (purchase.quantity || 0), 0);
  const totalAdditionalPrice = filteredPurchases.reduce((sum, purchase) => sum + (Number(purchase.additionalPrice) || 0), 0);
  const totalSubtractingPrice = filteredPurchases.reduce((sum, purchase) => sum + (Number(purchase.substractingPrice) || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Debug Info */}
        {debugData && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
            <details>
              <summary className="cursor-pointer font-bold">Debug Info</summary>
              <pre className="text-xs mt-2 whitespace-pre-wrap">{debugData}</pre>
            </details>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Maamulka Iibka Casri Electronics</h1>
          <p className="text-gray-600">Maamul alaabta Meheradu soo Daymaysatey iyo kaydka</p>
        </div>

        {/* Print Button */}
        <div className="flex justify-end mb-4 no-print">
          <button
            onClick={handlePrint}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition duration-200"
          >
            🖨️ Print Liiska Iibka
          </button>
        </div>

        {/* Stats Cards */}
        <div ref={printRef}>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Wadarta Iibka</p>
                  <p className="text-lg font-bold text-gray-900">{filteredPurchases.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-green-500">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Wadarta Qiimaha</p>
                  <p className="text-lg font-bold text-gray-900">${totalValue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Tirada Alaabta</p>
                  <p className="text-lg font-bold text-gray-900">{totalQuantity.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-orange-500">
              <div className="flex items-center">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Qiimo Gudaha</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${totalAdditionalPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-4 border-l-4 border-red-500">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg">
                  <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-xs font-medium text-gray-600">Qiimo Laga Jaray</p>
                  <p className="text-lg font-bold text-gray-900">
                    ${totalSubtractingPrice.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form & List Section */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Form */}
            <div className="bg-white rounded-xl shadow-lg p-6 no-print">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">
                  {editingId ? "🔄 Wax ka beddel Iibka" : "➕ Kudar Iib Cusub"}
                </h2>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="text-sm text-gray-500 hover:text-gray-700 bg-gray-100 px-3 py-1 rounded-lg transition duration-200"
                  >
                    ❌ Jooji waxka-bedelka
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Product & Supplier */}
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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
                      className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>
                </div>

                {/* Quantity, Price, Additional & Subtracting */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🔢 Tiro
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ➕ Qiimo ku Dar ($)
                    </label>
                    <input
                      type="number"
                      name="additionalPrice"
                      value={formData.additionalPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ➖ Qiimo ka Jar ($)
                    </label>
                    <input
                      type="number"
                      name="subtractingPrice"
                      value={formData.subtractingPrice}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition duration-200"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Faahfaahin
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Geli faahfaahinta iibka..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  />
                </div>

                {/* Total */}
                <div className="text-right font-semibold text-lg text-gray-800 bg-gray-50 p-3 rounded-lg">
                  Wadarta: ${calculateTotal().toLocaleString()}
                </div>

                {/* Submit */}
                <div>
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-bold text-white transition duration-200 ${
                      editingId ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                    }`}
                  >
                    {editingId ? "🔄 Cusbooneysii Iibka" : "➕ Kudar Iibka"}
                  </button>
                </div>

                {successMessage && (
                  <p className="text-green-600 mt-2 font-medium text-center">{successMessage}</p>
                )}
              </form>
            </div>

            {/* Purchases List */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Liiska Iibka</h2>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  >
                    <option value="newest">Ugu Cuslayn</option>
                    <option value="name">Magaca</option>
                    <option value="quantity">Tirada</option>
                    <option value="price">Qiimaha</option>
                    <option value="total">Wadarta</option>
                  </select>
                  <input
                    type="text"
                    placeholder="🔍 Raadi alaabta..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-3 border text-left font-semibold text-gray-700">Alaabta</th>
                      <th className="p-3 border text-left font-semibold text-gray-700">Iibsaday</th>
                      <th className="p-3 border text-center font-semibold text-gray-700">Tiro</th>
                      <th className="p-3 border text-right font-semibold text-gray-700">Qiimo</th>
                      <th className="p-3 border text-right font-semibold text-gray-700">qiimaha lagu daray</th>
                      <th className="p-3 border text-right font-semibold text-gray-700">Qiimo laga jaray</th>
                      <th className="p-3 border text-right font-semibold text-gray-700">Total</th>
                      <th className="p-3 border text-center font-semibold text-gray-700 no-print">Ficilada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedPurchases.map((purchase) => {
                      const total = (purchase.quantity * purchase.price) + 
                                   (Number(purchase.additionalPrice) || 0) - 
                                   (Number(purchase.substractingPrice) || 0);
                      return (
                        <tr key={purchase._id} className="hover:bg-gray-50 border-b">
                          <td className="p-3 border text-left align-top">{purchase.productName}</td>
                          <td className="p-3 border text-left align-top">{purchase.supplierName}</td>
                          <td className="p-3 border text-center align-top">{purchase.quantity}</td>
                          <td className="p-3 border text-right align-top">${purchase.price?.toLocaleString()}</td>
                          <td className="p-3 border text-right align-top">${(purchase.additionalPrice || 0)?.toLocaleString()}</td>
                          <td className="p-3 border text-right align-top">${(purchase.substractingPrice || 0)?.toLocaleString()}</td>
                          <td className="p-3 border text-right align-top font-semibold">${total.toLocaleString()}</td>
                          <td className="p-3 border text-center align-top no-print">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleEdit(purchase)}
                                className="text-blue-600 hover:text-blue-800 px-2 py-1 rounded transition duration-200"
                                title="Edit"
                              >
                                ✏️
                              </button>
                              <button
                                onClick={() => handleDelete(purchase._id)}
                                className="text-red-600 hover:text-red-800 px-2 py-1 rounded transition duration-200"
                                title="Delete"
                              >
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {sortedPurchases.length === 0 && (
                      <tr>
                        <td colSpan="8" className="p-4 text-center text-gray-500 border">
                          Lama helin iibka la raadinayo
                        </td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan="2" className="p-3 border text-right">Wadarta Guud:</td>
                      <td className="p-3 border text-center">{totalQuantity.toLocaleString()}</td>
                      <td className="p-3 border"></td>
                      <td className="p-3 border text-right">${totalAdditionalPrice.toLocaleString()}</td>
                      <td className="p-3 border text-right">${totalSubtractingPrice.toLocaleString()}</td>
                      <td className="p-3 border text-right">${totalValue.toLocaleString()}</td>
                      <td className="p-3 border no-print"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseManager;