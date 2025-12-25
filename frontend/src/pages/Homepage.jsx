import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  FiSearch,
  FiPlus,
  FiMinus,
  FiX,
  FiTrash2,
  FiShoppingCart,
  FiDollarSign,
  FiCalendar,
  FiPackage,
  FiPrinter,
  FiPercent,
  FiSmartphone,
  FiUser,
  FiPhone
} from "react-icons/fi";
import {
  BsCashCoin
} from "react-icons/bs";
import useProductsStore from "../store/useProductsStore";
import useSalesStore from "../store/UseSalesStore";
import { DollarSign, CreditCard } from "lucide-react";

const CreateSaleNew = () => {
  const { fetchProducts } = useProductsStore();
  const {
    searchProducts,
    searchResults,
    addProductToSale,
    selectedProducts,
    updateProductQuantity,
    updateProductPrice,
    updateProductDiscount,
    removeProductFromSale,
    clearSelectedProducts,
    getSaleCalculations,
    createSale,
    createSaleByDate,
    loading,
    fetchDailySales,
    salesByDate
  } = useSalesStore();

  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [saleType, setSaleType] = useState("today"); // "today" or "date"
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Payment fields - reorganized as requested
  const [paymentMethod, setPaymentMethod] = useState("");
  const [amountDue, setAmountDue] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  
  // Customer information
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  
  // Other fields
  const [notes, setNotes] = useState("");
  const [discountType, setDiscountType] = useState("percentage"); // "percentage" or "amount"
  const [discountValue, setDiscountValue] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Refs
  const searchInputRef = useRef(null);
  const amountPaidInputRef = useRef(null);
  const searchResultsRef = useRef(null);

  // Calculations
  const calculations = getSaleCalculations();
  
  // Calculate grand total with discount
  const discountAmount = discountType === "percentage" 
    ? (parseFloat(discountValue) || 0) / 100 * calculations.subtotal
    : parseFloat(discountValue) || 0;
  const grandTotal = calculations.subtotal - discountAmount;
  
  // Calculate remaining balance and change
  const paidAmount = parseFloat(amountPaid) || 0;
  const dueAmount = parseFloat(amountDue) || grandTotal;
  const remainingBalance = Math.max(0, dueAmount - paidAmount);
  const changeAmount = paidAmount > dueAmount ? paidAmount - dueAmount : 0;

  // Fetch initial data
  useEffect(() => {
    fetchProducts();
    fetchDailySales();
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [fetchProducts, fetchDailySales]);

  // Set amount due automatically when grand total changes
  useEffect(() => {
    if (grandTotal > 0 && !amountDue) {
      setAmountDue(grandTotal.toFixed(2));
    }
  }, [grandTotal, amountDue]);

  // Search products
  useEffect(() => {
    if (searchTerm.trim()) {
      const debounceTimer = setTimeout(() => {
        searchProducts(searchTerm);
        setShowSearchResults(true);
      }, 300);
      return () => clearTimeout(debounceTimer);
    } else {
      setShowSearchResults(false);
    }
  }, [searchTerm, searchProducts]);

  // Click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle product selection
  const handleProductSelect = (product) => {
    if (product.stock <= 0) {
      toast.error(`${product.name} is out of stock`);
      return;
    }
    
    addProductToSale(product, 1, product.price || product.cost);
    setSearchTerm("");
    setShowSearchResults(false);
    toast.success(`${product.name} added to sale`);
    
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  // Handle quantity changes
  const handleQuantityChange = (productId, quantity) => {
    if (quantity >= 1) {
      updateProductQuantity(productId, quantity);
    }
  };

  const handlePriceChange = (productId, price) => {
    if (price >= 0) {
      updateProductPrice(productId, parseFloat(price));
    }
  };

  const handleDiscountChange = (productId, discount) => {
    if (discount >= 0 && discount <= 100) {
      updateProductDiscount(productId, parseFloat(discount));
    }
  };

  // Calculate expected money for all products
  const calculateExpected = (product) => {
    const discountAmount = (product.sellingPrice * product.discount) / 100;
    const priceAfterDiscount = product.sellingPrice - discountAmount;
    return priceAfterDiscount * product.quantity;
  };

  const totalExpected = selectedProducts.reduce((sum, product) => {
    return sum + calculateExpected(product);
  }, 0);

  // Complete sale
  const handleCompleteSale = async () => {
    if (selectedProducts.length === 0) {
      toast.error("Please add at least one product");
      return;
    }

    if (!paymentMethod) {
      toast.error("Please select a payment method");
      return;
    }

    if (!amountDue || parseFloat(amountDue) <= 0) {
      toast.error("Amount due is required");
      return;
    }

    if (!amountPaid || parseFloat(amountPaid) < 0) {
      toast.error("Amount paid is required");
      return;
    }

    if (parseFloat(amountPaid) > parseFloat(amountDue)) {
      toast.error("Amount paid cannot exceed amount due");
      return;
    }

    const saleData = {
      products: selectedProducts.map(product => ({
        productId: product._id,
        quantity: product.quantity,
        sellingPrice: product.sellingPrice,
        discount: product.discount
      })),
      discountPercentage: discountType === "percentage" ? parseFloat(discountValue) || 0 : 0,
      discountAmount: discountType === "amount" ? parseFloat(discountValue) || 0 : 0,
      paymentMethod,
      amountDue: parseFloat(amountDue),
      amountPaid: parseFloat(amountPaid),
      grandTotal: grandTotal,
      ...(saleType === "date" && { saleDate }),
      ...(customerName && { customerName }),
      ...(customerPhone && { customerPhone }),
      ...(notes && { notes })
    };

    try {
      if (saleType === "date") {
        await createSaleByDate(saleData);
        toast.success(`Sale recorded for ${new Date(saleDate).toLocaleDateString()}`);
      } else {
        await createSale(saleData);
        
        if (parseFloat(amountPaid) >= parseFloat(amountDue)) {
          toast.success("Sale completed successfully!");
        } else {
          toast.success("Sale recorded with partial payment!");
        }
      }

      // Clear form
      clearSelectedProducts();
      setAmountDue("");
      setAmountPaid("");
      setPaymentMethod("");
      setCustomerName("");
      setCustomerPhone("");
      setNotes("");
      setDiscountValue("");
      setSearchTerm("");

      // Fetch updated sales
      fetchDailySales();

      // Focus back to search
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || "Failed to complete sale");
    }
  };

  // Print receipt
  const handlePrintReceipt = () => {
    if (selectedProducts.length === 0) {
      toast.error("No products to print receipt");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Sale Receipt</title>
        <style>
          body { font-family: 'Courier New', monospace; margin: 20px; }
          .receipt { width: 280px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
          .header h2 { margin: 0; font-size: 18px; }
          .header p { margin: 3px 0; font-size: 12px; }
          .item-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 12px; }
          .item-row .name { flex: 2; }
          .item-row .qty { text-align: center; flex: 0.5; }
          .item-row .price { text-align: right; flex: 1; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .total-row { font-weight: bold; font-size: 14px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; font-size: 10px; }
          .bold { font-weight: bold; }
          .status { padding: 2px 8px; border-radius: 4px; font-size: 10px; }
          .paid { background: #d1fae5; color: #065f46; }
          .partial { background: #fef3c7; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h2>INVENTORY SYSTEM</h2>
            <p>${saleType === "date" ? new Date(saleDate).toLocaleDateString() : new Date().toLocaleDateString()}</p>
            <p>${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          <div class="item-row bold">
            <div class="name">PRODUCT</div>
            <div class="qty">QTY</div>
            <div class="price">AMOUNT</div>
          </div>
          <div class="divider"></div>
          ${selectedProducts.map(item => `
            <div class="item-row">
              <div class="name">${item.name}</div>
              <div class="qty">${item.quantity}</div>
              <div class="price">$${(item.sellingPrice * item.quantity).toFixed(2)}</div>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="item-row">
            <div>Subtotal:</div>
            <div>$${calculations.subtotal.toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Discount:</div>
            <div>-$${discountAmount.toFixed(2)}</div>
          </div>
          <div class="item-row total-row">
            <div>AMOUNT DUE:</div>
            <div>$${parseFloat(amountDue || grandTotal).toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Amount Paid:</div>
            <div>$${parseFloat(amountPaid || 0).toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Remaining Balance:</div>
            <div>$${remainingBalance.toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Change:</div>
            <div>$${changeAmount.toFixed(2)}</div>
          </div>
          <div class="item-row">
            <div>Payment Method:</div>
            <div>${paymentMethod ? paymentMethod.toUpperCase() : 'CASH'}</div>
          </div>
          ${customerName ? `<div class="item-row"><div>Customer:</div><div>${customerName}</div></div>` : ''}
          <div class="item-row">
            <div>Status:</div>
            <div class="status ${paidAmount >= dueAmount ? 'paid' : 'partial'}">
              ${paidAmount >= dueAmount ? 'FULLY PAID' : 'PARTIALLY PAID'}
            </div>
          </div>
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>Receipt #: ${Date.now().toString().slice(-6)}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Payment methods - reordered as requested
  const paymentMethods = [
    { value: "zaad", label: "Zaad", icon: <FiSmartphone className="h-5 w-5" />, color: "bg-blue-50 border-blue-200 text-blue-600" },
    { value: "edahab", label: "Edahab", icon: <DollarSign className="h-5 w-5" />, color: "bg-purple-50 border-purple-200 text-purple-600" },
    { value: "cash", label: "Cash", icon: <BsCashCoin className="h-5 w-5" />, color: "bg-green-50 border-green-200 text-green-600" }
  ];

  // Get stock status color
  const getStockStatusColor = (stock, threshold = 5) => {
    if (stock === 0) return "bg-red-100 text-red-800";
    if (stock <= threshold) return "bg-amber-100 text-amber-800";
    return "bg-green-100 text-green-800";
  };

  // Get payment method icon
  const getPaymentIcon = (method) => {
    switch (method) {
      case 'cash': return <BsCashCoin className="h-5 w-5" />;
      case 'zaad': return <FiSmartphone className="h-5 w-5" />;
      case 'edahab': return <DollarSign className="h-5 w-5" />;
      default: return <BsCashCoin className="h-5 w-5" />;
    }
  };

  // Get payment status color
  const getPaymentStatusColor = () => {
    if (paidAmount >= dueAmount) return "bg-green-100 text-green-800";
    if (paidAmount > 0) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  // Get payment status text
  const getPaymentStatus = () => {
    if (paidAmount >= dueAmount) return "Fully Paid";
    if (paidAmount > 0) return "Partially Paid";
    return "Pending";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>
              <p className="text-gray-600">Create and manage sales transactions</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrintReceipt}
                disabled={selectedProducts.length === 0}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FiPrinter className="mr-2" />
                Print Receipt
              </button>
              
              <button
                onClick={handleCompleteSale}
                disabled={loading || selectedProducts.length === 0 || !paymentMethod || !amountDue || !amountPaid}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiShoppingCart className="mr-2" />
                    Complete Sale
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sale Type Tabs */}
          <div className="flex mb-6 bg-white rounded-xl p-1 border border-gray-200 shadow-sm max-w-md">
            <button
              onClick={() => setSaleType("today")}
              className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all ${
                saleType === "today"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Today's Sale
            </button>
            <button
              onClick={() => setSaleType("date")}
              className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all ${
                saleType === "date"
                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              Sale by Date
            </button>
          </div>

          {/* Date Selector for Date Tab */}
          {saleType === "date" && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-white p-4 rounded-xl border border-blue-200 shadow-sm max-w-md"
            >
              <label className="block text-gray-700 mb-2 font-medium flex items-center">
                <FiCalendar className="inline mr-2 text-blue-500" />
                Select Sale Date
              </label>
              <input
                type="date"
                value={saleDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={(e) => setSaleDate(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </motion.div>
          )}
        </div>

        {/* Main Content - Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Panel - Product Search & Selection (2/3 width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Product Search */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="relative" ref={searchResultsRef}>
                <div className="flex items-center mb-4">
                  <FiSearch className="text-gray-400 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Search Products</h2>
                </div>
                
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search product by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <FiSearch className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setShowSearchResults(false);
                      }}
                      className="absolute right-3 top-3.5"
                    >
                      <FiX className="h-5 w-5 text-gray-500 hover:text-gray-700" />
                    </button>
                  )}
                </div>

                {/* Search Results */}
                <AnimatePresence>
                  {showSearchResults && searchResults.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto"
                    >
                      {searchResults.map((product) => (
                        <div
                          key={product._id}
                          onClick={() => handleProductSelect(product)}
                          className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FiPackage className="h-4 w-4 text-gray-400 mr-2" />
                              <div>
                                <p className="font-medium text-gray-800">{product.name}</p>
                                <p className="text-sm text-gray-500">Price: ${product.price || product.cost}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${getStockStatusColor(product.stock, product.lowStockThreshold)}`}>
                                Stock: {product.stock}
                              </span>
                              <FiPlus className="h-4 w-4 text-blue-500" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Search Tips */}
              <div className="mt-4 text-sm text-gray-500">
                <p>Type to search products. Click on a product to add it to the sale.</p>
              </div>
            </div>

            {/* Selected Products Table */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                    <FiShoppingCart className="mr-2" />
                    Selected Products ({selectedProducts.length})
                  </h2>
                  {selectedProducts.length > 0 && (
                    <button
                      onClick={clearSelectedProducts}
                      className="text-sm text-red-600 hover:text-red-700 flex items-center"
                    >
                      <FiTrash2 className="mr-1 h-4 w-4" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount %</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedProducts.length > 0 ? (
                      selectedProducts.map((product) => {
                        const expected = calculateExpected(product);
                        return (
                          <tr key={product._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <FiPackage className="h-5 w-5 text-gray-400 mr-2" />
                                <div>
                                  <p className="font-medium text-gray-900">{product.name}</p>
                                  <p className="text-sm text-gray-500">Cost: ${product.cost?.toFixed(2) || '0.00'}</p>
                                </div>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleQuantityChange(product._id, product.quantity - 1)}
                                  className="p-1 rounded hover:bg-gray-200"
                                  disabled={product.quantity <= 1}
                                >
                                  <FiMinus className="h-4 w-4" />
                                </button>
                                <input
                                  type="number"
                                  value={product.quantity}
                                  onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value) || 1)}
                                  className="w-16 p-1 text-center border border-gray-300 rounded"
                                  min="1"
                                />
                                <button
                                  onClick={() => handleQuantityChange(product._id, product.quantity + 1)}
                                  className="p-1 rounded hover:bg-gray-200"
                                >
                                  <FiPlus className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                value={product.sellingPrice}
                                onChange={(e) => handlePriceChange(product._id, parseFloat(e.target.value) || 0)}
                                className="w-24 p-2 border border-gray-300 rounded"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            
                            <td className="px-6 py-4 font-medium text-gray-900">
                              ${(product.sellingPrice * product.quantity).toFixed(2)}
                            </td>
                            
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  value={product.discount || 0}
                                  onChange={(e) => handleDiscountChange(product._id, parseFloat(e.target.value) || 0)}
                                  className="w-20 p-2 border border-gray-300 rounded"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                                <span className="ml-1 text-gray-500">%</span>
                              </div>
                            </td>
                            
                            <td className="px-6 py-4 font-medium text-green-600">
                              ${expected.toFixed(2)}
                            </td>
                            
                            <td className="px-6 py-4">
                              <button
                                onClick={() => removeProductFromSale(product._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              >
                                <FiTrash2 className="h-5 w-5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                          <FiPackage className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No products selected. Search and add products above.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Panel - Sale Summary & Payment (1/3 width) */}
          <div className="space-y-6">
            
            {/* Sale Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Sale Summary</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">${calculations.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Items:</span>
                  <span className="font-medium">{calculations.itemCount}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Quantity:</span>
                  <span className="font-medium">{calculations.totalQuantity}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Expected:</span>
                  <span className="font-medium text-green-600">${totalExpected.toFixed(2)}</span>
                </div>
                
                {/* Discount Input */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Discount:</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setDiscountType("percentage")}
                        className={`px-2 py-1 text-sm rounded ${discountType === "percentage" ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                      >
                        %
                      </button>
                      <button
                        onClick={() => setDiscountType("amount")}
                        className={`px-2 py-1 text-sm rounded ${discountType === "amount" ? 'bg-blue-100 text-blue-600' : 'text-gray-500'}`}
                      >
                        $
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    {discountType === "percentage" ? (
                      <FiPercent className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    ) : (
                      <FiDollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    )}
                    <input
                      type="number"
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                      placeholder={discountType === "percentage" ? "Discount %" : "Discount Amount"}
                      min="0"
                      max={discountType === "percentage" ? "100" : calculations.subtotal}
                      step={discountType === "percentage" ? "0.1" : "0.01"}
                    />
                  </div>
                  {discountType === "percentage" && discountValue > 0 && (
                    <p className="text-sm text-gray-500 mt-1">
                      Amount: ${((parseFloat(discountValue) || 0) / 100 * calculations.subtotal).toFixed(2)}
                    </p>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount Amount:</span>
                  <span className="font-medium text-red-600">-${discountAmount.toFixed(2)}</span>
                </div>
                
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-800">Grand Total:</span>
                    <span className="text-2xl font-bold text-blue-600">${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Section - REORGANIZED AS REQUESTED */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h2>
              
              <div className="space-y-4">
                {/* 1. Payment Method (Zaad, Edahab, Cash) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {paymentMethods.map((method) => (
                      <button
                        key={method.value}
                        onClick={() => setPaymentMethod(method.value)}
                        className={`p-3 rounded-lg border flex flex-col items-center justify-center transition-all ${
                          paymentMethod === method.value
                            ? `${method.color.split(' ')[0]} border-2 ${method.color.split(' ')[1]} ${method.color.split(' ')[2]}`
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <div className="mb-1">
                          {method.icon}
                        </div>
                        <span className="text-sm font-medium">{method.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Selected Payment Method Display */}
                {paymentMethod && (
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <div className="flex items-center">
                      {getPaymentIcon(paymentMethod)}
                      <span className="ml-2 font-medium capitalize">{paymentMethod}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      Selected
                    </div>
                  </div>
                )}
                
                {/* 2. Amount Due */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Due</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      value={amountDue}
                      onChange={(e) => setAmountDue(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount due"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">Calculated: ${grandTotal.toFixed(2)}</span>
                    <button
                      onClick={() => setAmountDue(grandTotal.toFixed(2))}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Use calculated
                    </button>
                  </div>
                </div>
                
                {/* 3. Amount Paid */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount Paid</label>
                  <div className="relative">
                    <FiDollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      ref={amountPaidInputRef}
                      type="number"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter amount paid"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-sm text-gray-500">Due: ${dueAmount.toFixed(2)}</span>
                    <button
                      onClick={() => setAmountPaid(dueAmount.toFixed(2))}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Pay full amount
                    </button>
                  </div>
                </div>
                
                {/* Payment Status */}
                <div className="p-3 rounded-lg flex items-center justify-between" style={{ backgroundColor: getPaymentStatusColor().split(' ')[0], color: getPaymentStatusColor().split(' ')[2] }}>
                  <div className="flex items-center">
                    <FiDollarSign className="mr-2" />
                    <span className="font-medium">{getPaymentStatus()}</span>
                  </div>
                  <div className="font-bold">
                    {remainingBalance > 0 ? `$${remainingBalance.toFixed(2)} Due` : 'Paid in Full'}
                  </div>
                </div>
                
                {/* Change */}
                {changeAmount > 0 && (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-green-600">Change to Return:</span>
                      <span className="font-bold text-green-700">
                        ${changeAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Customer Information */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Customer Information (Optional)</h3>
                  <div className="space-y-3">
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Customer Name"
                      />
                    </div>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                        placeholder="Phone Number"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="Additional notes..."
                    rows="3"
                  />
                </div>
                
                {/* Complete Sale Button */}
                <button
                  onClick={handleCompleteSale}
                  disabled={loading || selectedProducts.length === 0 || !paymentMethod || !amountDue || !amountPaid}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold text-lg shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiShoppingCart className="mr-2 h-5 w-5" />
                      {paidAmount >= dueAmount ? 'COMPLETE SALE' : 'RECORD PARTIAL PAYMENT'}
                    </>
                  )}
                </button>
              </div>
            </div>
            
            {/* Today's Sales Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {saleType === "today" ? "Today's Sales" : `Sales on ${saleDate}`}
              </h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Sales:</span>
                  <span className="font-medium">{salesByDate.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-medium text-green-600">
                    ${salesByDate.reduce((sum, sale) => sum + sale.grandTotal, 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">
                    {salesByDate.reduce((sum, sale) => sum + sale.totalQuantity, 0)}
                  </span>
                </div>
              </div>
              
              {salesByDate.length > 0 && (
                <button
                  onClick={() => {
                    // You can add functionality to view sales details
                    toast.success(`${salesByDate.length} sales recorded`);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  View Sales Details
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSaleNew;