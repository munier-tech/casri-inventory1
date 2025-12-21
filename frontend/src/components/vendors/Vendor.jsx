import React, { useState, useEffect } from 'react';
import useVendorPurchaseStore from '../../store/useVendorStore';
import { 
  Plus, 
  Trash2, 
  Users,
  ShoppingCart,
  DollarSign,
  CreditCard,
  X,
  Edit,
  Store,
  AlertCircle,
  RefreshCw,
  Search,
  Loader2,
  Filter,
  Calendar,
  FileText,
  ChevronDown,
  ChevronUp,
  Eye,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  CreditCard as Card,
  Wallet,
  Package,
  Save,
  Pencil,
  ExternalLink
} from 'lucide-react';

// ========== MODALS ==========

const CreateVendorModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    location: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onCreate(formData);
    if (result.success) {
      setFormData({ name: '', phoneNumber: '', location: '' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Create New Vendor</h3>
            <p className="text-sm text-gray-600 mt-1">Add a new vendor to your system</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+252 61 234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter location"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3.5 px-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/20"
            >
              Create Vendor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Edit Vendor Modal
const EditVendorModal = ({ isOpen, onClose, vendor, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    location: ''
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        name: vendor.name || '',
        phoneNumber: vendor.phoneNumber || '',
        location: vendor.location || ''
      });
    }
  }, [vendor]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await onUpdate(vendor._id, formData);
    if (result.success) {
      setFormData({ name: '', phoneNumber: '', location: '' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Vendor</h3>
            <p className="text-sm text-gray-600 mt-1">Update vendor information</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter vendor name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+252 61 234 5678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter location"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 px-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all font-medium shadow-lg shadow-green-500/20"
            >
              Update Vendor
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// View Vendor Details Modal
const ViewVendorModal = ({ isOpen, onClose, vendor }) => {
  if (!isOpen || !vendor) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Vendor Details</h3>
            <p className="text-sm text-gray-600 mt-1">View vendor information</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Name</label>
                <p className="text-gray-900 font-medium">{vendor.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                <p className="text-gray-900 font-medium">{vendor.phoneNumber}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Location</label>
              <p className="text-gray-900 font-medium">{vendor.location}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Total Purchases</label>
                <p className="text-blue-600 font-bold">{vendor.totalPurchases || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Total Spent</label>
                <p className="text-green-600 font-bold">${(vendor.totalAmount || 0).toFixed(2)}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Balance</label>
              <p className={`font-bold ${(vendor.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${(vendor.balance || 0).toFixed(2)}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                <p className="text-gray-700 text-sm">
                  {new Date(vendor.createdAt).toLocaleDateString()} at {new Date(vendor.createdAt).toLocaleTimeString()}
                </p>
              </div>
              {vendor.updatedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Last Updated</label>
                  <p className="text-gray-700 text-sm">
                    {new Date(vendor.updatedAt).toLocaleDateString()} at {new Date(vendor.updatedAt).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create Purchase Modal
const CreatePurchaseModal = ({ 
  isOpen, 
  onClose, 
  vendors,
  selectedVendor,
  onSelectVendor,
  onClearVendor,
  searchQuery,
  onSearchChange,
  productSearchResults,
  purchaseProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  onClearProducts,
  purchaseData = {},
  onUpdatePurchaseData,
  purchaseTotal,
  balance,
  onCreatePurchase,
  isLoading,
  onAddCustomProduct
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: '',
    price: '',
    quantity: '1'
  });

  const handleAddCustomProduct = (e) => {
    e.preventDefault();
    
    if (!customProduct.name.trim() || !customProduct.price) {
      alert('Please enter product name and price');
      return;
    }
    
    const price = parseFloat(customProduct.price);
    const quantity = parseInt(customProduct.quantity) || 1;
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    onAddCustomProduct(customProduct.name, price, quantity);
    setCustomProduct({ name: '', price: '', quantity: '1' });
    setShowCustomForm(false);
  };

  if (!isOpen) return null;

  // Safe access to purchaseData properties
  const amountDue = purchaseData?.amountDue || purchaseTotal || 0;
  const amountPaid = purchaseData?.amountPaid || 0;
  const paymentMethod = purchaseData?.paymentMethod || 'cash';
  const notes = purchaseData?.notes || '';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Create New Purchase</h3>
            <p className="text-sm text-gray-600 mt-1">Add products and process payment</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Vendor & Product Selection */}
            <div>
              {/* Vendor Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-gray-800 text-lg">Select Vendor</h4>
                  {selectedVendor && (
                    <button
                      onClick={onClearVendor}
                      className="text-sm text-red-600 hover:text-red-800 font-medium"
                    >
                      Change Vendor
                    </button>
                  )}
                </div>
                {selectedVendor ? (
                  <div className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-green-900 text-lg">{selectedVendor.name}</div>
                        <div className="text-sm text-green-700 mt-1">
                          📞 {selectedVendor.phoneNumber} • 📍 {selectedVendor.location}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            {selectedVendor.totalPurchases || 0} purchases
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            ${(selectedVendor.totalAmount || 0).toFixed(2)} spent
                          </span>
                        </div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto p-1">
                    {vendors.map((vendor) => (
                      <div
                        key={vendor._id}
                        className="p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all group"
                        onClick={() => onSelectVendor(vendor)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-gray-800 group-hover:text-blue-600">
                              {vendor.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">{vendor.location}</div>
                            <div className="text-xs text-gray-500 mt-1">📞 {vendor.phoneNumber}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-700">
                              ${(vendor.totalAmount || 0).toFixed(2)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {vendor.totalPurchases || 0} purchases
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Search */}
              {selectedVendor && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-800 text-lg mb-4">Add Products</h4>
                  <div className="relative mb-4">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={onSearchChange}
                      placeholder="Search products by name..."
                      className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  {productSearchResults.length > 0 && (
                    <div className="border-2 border-gray-200 rounded-xl max-h-72 overflow-y-auto shadow-inner">
                      {productSearchResults.map((product) => (
                        <div
                          key={product._id}
                          className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group"
                          onClick={() => onAddProduct(product)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-gray-800 group-hover:text-blue-700">
                                {product.name}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                ${product.price || product.cost || '0.00'} each
                                {product.stock && ` • ${product.stock} in stock`}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-green-600">
                                ${product.price || product.cost || '0.00'}
                              </span>
                              <Plus className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {searchQuery && productSearchResults.length === 0 && (
                    <button
                      onClick={() => setShowCustomForm(true)}
                      className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-all group"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                        <span className="font-medium">Add Custom Product</span>
                      </div>
                    </button>
                  )}
                  
                  {showCustomForm && (
                    <div className="mt-4 p-5 border-2 border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-white">
                      <div className="flex justify-between items-center mb-4">
                        <h5 className="font-bold text-gray-800">Custom Product</h5>
                        <button 
                          onClick={() => setShowCustomForm(false)} 
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <form onSubmit={handleAddCustomProduct} className="space-y-4">
                        <input
                          type="text"
                          value={customProduct.name || searchQuery}
                          onChange={(e) => setCustomProduct({...customProduct, name: e.target.value})}
                          placeholder="Product name"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Price</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              value={customProduct.price}
                              onChange={(e) => setCustomProduct({...customProduct, price: e.target.value})}
                              placeholder="0.00"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-2">Quantity</label>
                            <input
                              type="number"
                              min="1"
                              value={customProduct.quantity}
                              onChange={(e) => setCustomProduct({...customProduct, quantity: e.target.value})}
                              placeholder="1"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <button 
                          type="submit" 
                          className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/20"
                        >
                          Add Custom Product
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column - Cart & Payment */}
            <div>
              {/* Selected Products */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-800 text-lg">
                    Cart ({purchaseProducts.length})
                  </h4>
                  {purchaseProducts.length > 0 && (
                    <button
                      onClick={onClearProducts}
                      className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  )}
                </div>
                
                {purchaseProducts.length === 0 ? (
                  <div className="text-center py-12 border-3 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No products added</p>
                    <p className="text-sm text-gray-400 mt-1">Add products from the search results</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto p-1">
                    {purchaseProducts.map((product) => (
                      <div key={product._id} className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{product.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              ${product.price || product.cost || '0.00'} × {product.quantity}
                            </div>
                            {product.isCustom && (
                              <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                Custom Product
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                              <button
                                onClick={() => onUpdateQuantity(product._id, product.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-lg"
                                disabled={product.quantity <= 1}
                              >
                                <span className="text-lg">−</span>
                              </button>
                              <span className="w-10 text-center font-bold">{product.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(product._id, product.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-lg"
                              >
                                <span className="text-lg">+</span>
                              </button>
                            </div>
                            <div className="font-bold text-lg text-gray-800">
                              ${((product.price || product.cost || 0) * product.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => onRemoveProduct(product._id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {purchaseProducts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-700">Subtotal:</span>
                      <span className="text-2xl font-bold text-gray-900">${purchaseTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              {purchaseProducts.length > 0 && (
                <div className="space-y-6">
                  <h4 className="font-bold text-gray-800 text-lg">Payment Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Due
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={amountDue}
                          onChange={(e) => onUpdatePurchaseData({ amountDue: parseFloat(e.target.value) || purchaseTotal })}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Paid
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => onUpdatePurchaseData({ amountPaid: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { method: 'cash', label: 'Cash', icon: Wallet, color: 'from-green-500 to-green-600' },
                        { method: 'zaad', label: 'Zaad', icon: Card, color: 'from-blue-500 to-blue-600' },
                        { method: 'edahab', label: 'Edahab', icon: CreditCard, color: 'from-purple-500 to-purple-600' }
                      ].map(({ method, label, icon: Icon, color }) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => onUpdatePurchaseData({ paymentMethod: method })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === method
                              ? `bg-gradient-to-r ${color} border-transparent text-white shadow-lg`
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className={`w-6 h-6 ${paymentMethod === method ? 'text-white' : 'text-gray-400'}`} />
                            <span className={`font-medium ${paymentMethod === method ? 'text-white' : 'text-gray-700'}`}>
                              {label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-5 rounded-xl ${
                    balance > 0 
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200' 
                      : balance < 0 
                      ? 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200'
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-600">Balance</div>
                        <div className="text-sm text-gray-500">
                          {balance > 0 
                            ? 'Amount to pay' 
                            : balance < 0 
                            ? 'Overpaid amount'
                            : 'Fully paid'}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${
                        balance > 0 ? 'text-red-600' :
                        balance < 0 ? 'text-purple-600' :
                        'text-green-600'
                      }`}>
                        ${Math.abs(balance).toFixed(2)}
                        {balance > 0 && <TrendingUp className="inline-block w-5 h-5 ml-2" />}
                        {balance < 0 && <TrendingDown className="inline-block w-5 h-5 ml-2" />}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => onUpdatePurchaseData({ notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any notes about this purchase..."
                    />
                  </div>

                  <button
                    onClick={() => onCreatePurchase(purchaseData || {})}
                    disabled={isLoading || purchaseProducts.length === 0}
                    className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-xl shadow-green-500/20"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </div>
                    ) : 'Complete Purchase'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Edit Purchase Modal
const EditPurchaseModal = ({ 
  isOpen, 
  onClose, 
  vendors,
  selectedVendor,
  onSelectVendor,
  onClearVendor,
  searchQuery,
  onSearchChange,
  productSearchResults,
  purchaseProducts,
  onAddProduct,
  onRemoveProduct,
  onUpdateQuantity,
  onClearProducts,
  purchaseData = {},
  onUpdatePurchaseData,
  purchaseTotal,
  balance,
  onUpdatePurchase,
  isLoading,
  onAddCustomProduct,
  editingPurchase,
  onSaveEdit
}) => {
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customProduct, setCustomProduct] = useState({
    name: '',
    price: '',
    quantity: '1'
  });

  const handleAddCustomProduct = (e) => {
    e.preventDefault();
    
    if (!customProduct.name.trim() || !customProduct.price) {
      alert('Please enter product name and price');
      return;
    }
    
    const price = parseFloat(customProduct.price);
    const quantity = parseInt(customProduct.quantity) || 1;
    
    if (isNaN(price) || price <= 0) {
      alert('Please enter a valid price');
      return;
    }
    
    if (isNaN(quantity) || quantity <= 0) {
      alert('Please enter a valid quantity');
      return;
    }
    
    onAddCustomProduct(customProduct.name, price, quantity);
    setCustomProduct({ name: '', price: '', quantity: '1' });
    setShowCustomForm(false);
  };

  if (!isOpen || !editingPurchase) return null;

  // Safe access to purchaseData properties
  const amountDue = purchaseData?.amountDue || purchaseTotal || 0;
  const amountPaid = purchaseData?.amountPaid || 0;
  const paymentMethod = purchaseData?.paymentMethod || 'cash';
  const notes = purchaseData?.notes || '';

  const handleSave = async () => {
    if (!editingPurchase.vendorId) {
      alert('Vendor information is missing');
      return;
    }

    const updatedPurchaseData = {
      products: purchaseProducts.map(product => ({
        productId: product._id?.startsWith('product_') ? null : product._id,
        productName: product.name,
        quantity: product.quantity,
        unitPrice: product.price || product.cost || 0
      })),
      amountDue: amountDue,
      amountPaid: amountPaid,
      paymentMethod: paymentMethod,
      notes: notes,
      updateStock: true
    };

    const result = await onUpdatePurchase(editingPurchase.vendorId, editingPurchase._id, updatedPurchaseData);
    if (result.success) {
      onSaveEdit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Edit Purchase</h3>
            <p className="text-sm text-gray-600 mt-1">
              Update purchase details and products
            </p>
            <div className="text-xs text-gray-500 mt-1">
              Purchase ID: {editingPurchase._id}
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Product Management */}
            <div>
              {/* Vendor Information (Read-only in edit mode) */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-800 text-lg mb-4">Vendor Information</h4>
                <div className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-blue-900 text-lg">{editingPurchase.vendorName || 'Unknown Vendor'}</div>
                      <div className="text-sm text-blue-700 mt-1">
                        Vendor ID: {editingPurchase.vendorId}
                      </div>
                      <div className="text-xs text-blue-600 mt-2">
                        Note: Vendor cannot be changed for existing purchase
                      </div>
                    </div>
                    <CheckCircle className="w-6 h-6 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Product Management */}
              <div className="mb-8">
                <h4 className="font-bold text-gray-800 text-lg mb-4">Edit Products</h4>
                <div className="relative mb-4">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Search products to add..."
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                
                {productSearchResults.length > 0 && (
                  <div className="border-2 border-gray-200 rounded-xl max-h-72 overflow-y-auto shadow-inner">
                    {productSearchResults.map((product) => (
                      <div
                        key={product._id}
                        className="p-4 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group"
                        onClick={() => onAddProduct(product)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-gray-800 group-hover:text-blue-700">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              ${product.price || product.cost || '0.00'} each
                              {product.stock && ` • ${product.stock} in stock`}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-green-600">
                              ${product.price || product.cost || '0.00'}
                            </span>
                            <Plus className="w-4 h-4 text-green-500 group-hover:scale-110 transition-transform" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {searchQuery && productSearchResults.length === 0 && (
                  <button
                    onClick={() => setShowCustomForm(true)}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Plus className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
                      <span className="font-medium">Add Custom Product</span>
                    </div>
                  </button>
                )}
                
                {showCustomForm && (
                  <div className="mt-4 p-5 border-2 border-gray-200 rounded-2xl bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex justify-between items-center mb-4">
                      <h5 className="font-bold text-gray-800">Custom Product</h5>
                      <button 
                        onClick={() => setShowCustomForm(false)} 
                        className="p-1 hover:bg-gray-100 rounded-full"
                      >
                        <X className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                    <form onSubmit={handleAddCustomProduct} className="space-y-4">
                      <input
                        type="text"
                        value={customProduct.name || searchQuery}
                        onChange={(e) => setCustomProduct({...customProduct, name: e.target.value})}
                        placeholder="Product name"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={customProduct.price}
                            onChange={(e) => setCustomProduct({...customProduct, price: e.target.value})}
                            placeholder="0.00"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-gray-600 mb-2">Quantity</label>
                          <input
                            type="number"
                            min="1"
                            value={customProduct.quantity}
                            onChange={(e) => setCustomProduct({...customProduct, quantity: e.target.value})}
                            placeholder="1"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit" 
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/20"
                      >
                        Add Custom Product
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Cart & Payment */}
            <div>
              {/* Current Products */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-gray-800 text-lg">
                    Products ({purchaseProducts.length})
                  </h4>
                  {purchaseProducts.length > 0 && (
                    <button
                      onClick={onClearProducts}
                      className="text-sm text-red-600 hover:text-red-800 font-medium flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  )}
                </div>
                
                {purchaseProducts.length === 0 ? (
                  <div className="text-center py-12 border-3 border-dashed border-gray-300 rounded-2xl bg-gray-50">
                    <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">No products added</p>
                    <p className="text-sm text-gray-400 mt-1">Add products from the search results</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-72 overflow-y-auto p-1">
                    {purchaseProducts.map((product) => (
                      <div key={product._id} className="p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-800">{product.name}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              ${product.price || product.cost || '0.00'} × {product.quantity}
                            </div>
                            {product.isCustom && (
                              <span className="inline-block mt-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                Custom Product
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                              <button
                                onClick={() => onUpdateQuantity(product._id, product.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-l-lg"
                                disabled={product.quantity <= 1}
                              >
                                <span className="text-lg">−</span>
                              </button>
                              <span className="w-10 text-center font-bold">{product.quantity}</span>
                              <button
                                onClick={() => onUpdateQuantity(product._id, product.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-r-lg"
                              >
                                <span className="text-lg">+</span>
                              </button>
                            </div>
                            <div className="font-bold text-lg text-gray-800">
                              ${((product.price || product.cost || 0) * product.quantity).toFixed(2)}
                            </div>
                            <button
                              onClick={() => onRemoveProduct(product._id)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {purchaseProducts.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-700">Subtotal:</span>
                      <span className="text-2xl font-bold text-gray-900">${purchaseTotal.toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Details */}
              {purchaseProducts.length > 0 && (
                <div className="space-y-6">
                  <h4 className="font-bold text-gray-800 text-lg">Payment Details</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Due
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={amountDue}
                          onChange={(e) => onUpdatePurchaseData({ amountDue: parseFloat(e.target.value) || purchaseTotal })}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Amount Paid
                      </label>
                      <div className="relative">
                        <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={amountPaid}
                          onChange={(e) => onUpdatePurchaseData({ amountPaid: parseFloat(e.target.value) || 0 })}
                          className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Payment Method
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { method: 'cash', label: 'Cash', icon: Wallet, color: 'from-green-500 to-green-600' },
                        { method: 'zaad', label: 'Zaad', icon: Card, color: 'from-blue-500 to-blue-600' },
                        { method: 'edahab', label: 'Edahab', icon: CreditCard, color: 'from-purple-500 to-purple-600' }
                      ].map(({ method, label, icon: Icon, color }) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => onUpdatePurchaseData({ paymentMethod: method })}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            paymentMethod === method
                              ? `bg-gradient-to-r ${color} border-transparent text-white shadow-lg`
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className={`w-6 h-6 ${paymentMethod === method ? 'text-white' : 'text-gray-400'}`} />
                            <span className={`font-medium ${paymentMethod === method ? 'text-white' : 'text-gray-700'}`}>
                              {label}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`p-5 rounded-xl ${
                    balance > 0 
                      ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200' 
                      : balance < 0 
                      ? 'bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200'
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-600">Balance</div>
                        <div className="text-sm text-gray-500">
                          {balance > 0 
                            ? 'Amount to pay' 
                            : balance < 0 
                            ? 'Overpaid amount'
                            : 'Fully paid'}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${
                        balance > 0 ? 'text-red-600' :
                        balance < 0 ? 'text-purple-600' :
                        'text-green-600'
                      }`}>
                        ${Math.abs(balance).toFixed(2)}
                        {balance > 0 && <TrendingUp className="inline-block w-5 h-5 ml-2" />}
                        {balance < 0 && <TrendingDown className="inline-block w-5 h-5 ml-2" />}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => onUpdatePurchaseData({ notes: e.target.value })}
                      rows="3"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Add any notes about this purchase..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={handleSave}
                      disabled={isLoading || purchaseProducts.length === 0}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-xl shadow-blue-500/20"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2">
                          <Save className="w-5 h-5" />
                          Update Purchase
                        </div>
                      )}
                    </button>
                    <button
                      onClick={onClose}
                      className="w-full py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-bold text-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// View Purchase Details Modal
const ViewPurchaseModal = ({ isOpen, onClose, purchase }) => {
  if (!isOpen || !purchase) return null;

  const calculateTotal = (products) => {
    if (!products || !Array.isArray(products)) return 0;
    return products.reduce((sum, product) => {
      const total = product.total || (product.unitPrice || 0) * (product.quantity || 0);
      return sum + (total || 0);
    }, 0);
  };

  const calculateBalance = (purchase) => {
    const amountDue = purchase?.amountDue || 0;
    const amountPaid = purchase?.amountPaid || 0;
    return amountDue - amountPaid;
  };

  const totalAmount = calculateTotal(purchase.products);
  const balance = calculateBalance(purchase);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Purchase Details</h3>
            <p className="text-sm text-gray-600 mt-1">View purchase information</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3">Vendor Information</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Name</label>
                    <p className="font-medium text-gray-900">{purchase.vendorName || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Phone</label>
                    <p className="text-gray-700">{purchase.vendorPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Vendor ID</label>
                    <p className="text-xs text-gray-500">{purchase.vendorId || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3">Transaction Details</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium">{formatDate(purchase.purchaseDate || purchase.createdAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Method:</span>
                    <span className="font-medium capitalize">{purchase.paymentMethod || 'cash'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      balance > 0 ? 'text-red-600' : 
                      balance < 0 ? 'text-purple-600' : 
                      'text-green-600'
                    }`}>
                      {balance > 0 ? 'Pending' : balance < 0 ? 'Overpaid' : 'Paid'}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Purchase ID</label>
                    <p className="text-xs text-gray-500">{purchase._id}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl">
                <h4 className="font-bold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="font-bold text-gray-900">${totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Due:</span>
                    <span className="font-medium">${(purchase.amountDue || totalAmount).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium text-green-600">${(purchase.amountPaid || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className={`font-bold ${
                      balance > 0 ? 'text-red-600' : 
                      balance < 0 ? 'text-purple-600' : 
                      'text-green-600'
                    }`}>
                      ${Math.abs(balance).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div>
              <h4 className="font-bold text-gray-900 text-lg mb-4">Products Purchased ({purchase.products?.length || 0})</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Product Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Quantity</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchase.products?.map((product, index) => (
                      <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{product.productName || 'Unknown Product'}</div>
                          {product.productId && (
                            <div className="text-xs text-gray-500">ID: {product.productId}</div>
                          )}
                        </td>
                        <td className="py-3 px-4">{product.quantity || 1}</td>
                        <td className="py-3 px-4">${(product.unitPrice || 0).toFixed(2)}</td>
                        <td className="py-3 px-4 font-bold">${(product.total || 0).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="py-3 px-4 font-bold text-right">Total:</td>
                      <td className="py-3 px-4 font-bold text-lg text-gray-900">${totalAmount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes Section */}
            {purchase.notes && (
              <div>
                <h4 className="font-bold text-gray-900 text-lg mb-3">Notes</h4>
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-gray-700">{purchase.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Delete Confirmation Modal
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'vendor' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 mb-6">{message}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all font-medium"
            >
              Delete {type === 'vendor' ? 'Vendor' : 'Purchase'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 border-2 border-gray-200 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== TAB COMPONENTS ==========

const VendorsTab = ({ 
  vendors, 
  onCreateVendorClick, 
  onViewVendorClick,
  onEditVendorClick,
  onDeleteVendorClick 
}) => {
  const { fetchVendors, isLoading } = useVendorPurchaseStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  const handleDeleteClick = (vendor) => {
    setVendorToDelete(vendor);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (vendorToDelete) {
      const result = await onDeleteVendorClick(vendorToDelete._id);
      if (result.success) {
        alert('Vendor deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete vendor');
      }
    }
    setShowDeleteModal(false);
    setVendorToDelete(null);
  };

  const getVendorStats = () => {
    const totalVendors = vendors.length;
    const totalSpent = vendors.reduce((sum, vendor) => sum + (vendor.totalAmount || 0), 0);
    const totalBalance = vendors.reduce((sum, vendor) => sum + (vendor.balance || 0), 0);
    const totalPurchases = vendors.reduce((sum, vendor) => sum + (vendor.totalPurchases || 0), 0);

    return { totalVendors, totalSpent, totalBalance, totalPurchases };
  };

  const stats = getVendorStats();

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Vendors</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVendors}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalSpent.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-xl">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalBalance.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-xl">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Purchases</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPurchases}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-xl">
              <BarChart3 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Vendors List</h3>
              <p className="text-gray-600 mt-1">Manage your vendors and view their details</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={fetchVendors}
                disabled={isLoading}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={onCreateVendorClick}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-5 h-5" />
                Create Vendor
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {isLoading && vendors.length === 0 ? (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
              <p className="mt-3 text-gray-500">Loading vendors...</p>
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 mx-auto text-gray-400" />
              <h4 className="text-lg font-medium text-gray-700 mt-4">No vendors found</h4>
              <p className="text-gray-500 mt-1">Create your first vendor to get started</p>
              <button
                onClick={onCreateVendorClick}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                Create Your First Vendor
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Purchases</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Balance</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor._id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{vendor.name}</div>
                        <div className="text-xs text-gray-500">
                          ID: {vendor._id}
                        </div>
                      </td>
                      <td className="py-3 px-4">{vendor.phoneNumber}</td>
                      <td className="py-3 px-4">{vendor.location}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {vendor.totalPurchases || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-green-600">
                          ${(vendor.totalAmount || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${(vendor.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          ${(vendor.balance || 0).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onViewVendorClick(vendor)}
                            className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition-colors"
                            title="View vendor"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onEditVendorClick(vendor)}
                            className="p-2 hover:bg-green-50 rounded-lg text-green-600 hover:text-green-700 transition-colors"
                            title="Edit vendor"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(vendor)}
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                            title="Delete vendor"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Vendor"
        message={`Are you sure you want to delete "${vendorToDelete?.name}"? This action cannot be undone.`}
        type="vendor"
      />
    </>
  );
};

// Combined Purchases and Records Tab
const PurchasesTab = ({ 
  onCreatePurchaseClick, 
  purchases, 
  vendors, 
  isLoading, 
  onRefresh,
  filters,
  setFilters,
  onFilterChange,
  onViewPurchaseClick,
  onEditPurchaseClick,
  onDeletePurchaseClick
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);

  const handleDeleteClick = (purchase) => {
    setPurchaseToDelete(purchase);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (purchaseToDelete) {
      const result = await onDeletePurchaseClick(purchaseToDelete.vendorId, purchaseToDelete._id);
      if (result.success) {
        alert('Purchase deleted successfully!');
      } else {
        alert(result.error || 'Failed to delete purchase');
      }
    }
    setShowDeleteModal(false);
    setPurchaseToDelete(null);
  };

  const calculateTotal = (products) => {
    if (!products || !Array.isArray(products)) return 0;
    return products.reduce((sum, product) => {
      const total = product.total || (product.unitPrice || 0) * (product.quantity || 0);
      return sum + (total || 0);
    }, 0);
  };

  const calculateBalance = (purchase) => {
    const amountDue = purchase?.amountDue || 0;
    const amountPaid = purchase?.amountPaid || 0;
    return amountDue - amountPaid;
  };

  const getPurchaseStats = () => {
    const totalPurchases = purchases.length;
    const totalAmount = purchases.reduce((sum, purchase) => {
      return sum + calculateTotal(purchase.products);
    }, 0);
    const totalBalance = purchases.reduce((sum, purchase) => {
      return sum + calculateBalance(purchase);
    }, 0);
    const averagePurchase = totalPurchases > 0 ? totalAmount / totalPurchases : 0;

    return { totalPurchases, totalAmount, totalBalance, averagePurchase };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const stats = getPurchaseStats();

  return (
    <>
      {/* Stats and Create Button Row */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPurchases}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${stats.totalAmount.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg. Purchase</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">${stats.averagePurchase.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <button
            onClick={onCreatePurchaseClick}
            className="w-full h-full min-h-[90px] bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl hover:from-green-700 hover:to-green-800 font-bold text-lg flex flex-col items-center justify-center gap-2 transition-all shadow-xl shadow-green-500/20"
          >
            <ShoppingCart className="w-7 h-7" />
            New Purchase
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-gray-900">Filter Purchases</h4>
            <p className="text-sm text-gray-600 mt-1">Search and filter purchase records</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={filters.vendorId || ''}
                onChange={(e) => onFilterChange({ vendorId: e.target.value || null })}
                className="pl-10 pr-8 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ startDate: e.target.value || null })}
                className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onFilterChange({ endDate: e.target.value || null })}
                className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Purchase Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">Purchase Records</h3>
          <p className="text-gray-600 mt-1">View and manage all purchase transactions</p>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
              <p className="mt-3 text-gray-500">Loading purchase records...</p>
            </div>
          ) : purchases.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 mx-auto text-gray-400" />
              <h4 className="text-lg font-medium text-gray-700 mt-4">No purchase records found</h4>
              <p className="text-gray-500 mt-1">Create your first purchase to see records here</p>
              <button
                onClick={onCreatePurchaseClick}
                className="mt-6 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 font-medium transition-all shadow-lg shadow-green-500/20"
              >
                Create Your First Purchase
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Products</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount Due</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount Paid</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Balance</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Payment Method</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((purchase) => {
                    const totalAmount = calculateTotal(purchase.products);
                    const balance = calculateBalance(purchase);
                    
                    return (
                      <tr key={purchase._id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="text-gray-900">{formatDate(purchase.purchaseDate || purchase.createdAt)}</div>
                          <div className="text-xs text-gray-500">
                            ID: {purchase._id}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{purchase.vendorName || 'Unknown'}</div>
                          <div className="text-xs text-gray-500">{purchase.vendorPhone || 'N/A'}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-gray-700">{purchase.products?.length || 0} items</div>
                          <div className="text-xs text-gray-500">
                            {purchase.products?.slice(0, 2).map(p => p.productName).join(', ')}
                            {purchase.products?.length > 2 && '...'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-gray-900">
                            ${totalAmount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium">
                            ${(purchase.amountDue || totalAmount).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-green-600">
                            ${(purchase.amountPaid || 0).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${
                            balance > 0 ? 'text-red-600' : 
                            balance < 0 ? 'text-purple-600' : 
                            'text-green-600'
                          }`}>
                            ${Math.abs(balance).toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            purchase.paymentMethod === 'cash' ? 'bg-green-100 text-green-800' :
                            purchase.paymentMethod === 'zaad' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {purchase.paymentMethod || 'cash'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => onViewPurchaseClick(purchase)}
                              className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition-colors"
                              title="View purchase"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onEditPurchaseClick(purchase)}
                              className="p-2 hover:bg-green-50 rounded-lg text-green-600 hover:text-green-700 transition-colors"
                              title="Edit purchase"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(purchase)}
                              className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors"
                              title="Delete purchase"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Purchase"
        message={`Are you sure you want to delete this purchase? This action cannot be undone.`}
        type="purchase"
      />
    </>
  );
};

// ========== MAIN PAGE ==========

const Vendor = () => {
  const {
    // State
    vendors,
    selectedVendor,
    purchaseProducts,
    productSearchResults,
    purchaseRecords,
    purchaseData = {},
    isLoading,
    isLoadingPurchases,
    error,
    activeTab,
    showVendorModal,
    showPurchaseModal,
    showEditVendorModal,
    editingVendor,
    showViewVendorModal,
    viewingVendor,
    showViewPurchaseModal,
    viewingPurchase,
    showEditPurchaseModal,
    editingPurchase,
    
    // Actions
    fetchVendors,
    fetchAllProducts,
    fetchAllPurchases,
    createVendor,
    updateVendor,
    deleteVendor,
    selectVendor,
    clearSelectedVendor,
    searchProducts,
    addProductToPurchase,
    addCustomProductToPurchase,
    removeProductFromPurchase,
    updateProductQuantity,
    clearPurchaseProducts,
    updatePurchaseData,
    calculatePurchaseTotal,
    createPurchase,
    updatePurchase,
    deletePurchase,
    setActiveTab,
    setShowVendorModal,
    setShowPurchaseModal,
    setShowEditVendorModal,
    setEditingVendor,
    setShowEditPurchaseModal,
    setEditingPurchase,
    clearError,
    filterPurchaseRecords,
  } = useVendorPurchaseStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    vendorId: '',
    startDate: '',
    endDate: '',
    paymentMethod: ''
  });
  const [showViewVendor, setShowViewVendor] = useState(false);
  const [showViewPurchase, setShowViewPurchase] = useState(false);

  // Initial data fetch
  useEffect(() => {
    fetchVendors();
    fetchAllProducts();
    if (activeTab === 'purchases') {
      fetchAllPurchases();
    }
  }, [fetchVendors, fetchAllProducts, fetchAllPurchases, activeTab]);

  // Handle vendor creation
  const handleCreateVendor = async (vendorData) => {
    const result = await createVendor(vendorData);
    if (result.success) {
      alert('Vendor created successfully!');
    } else {
      alert(result.error || 'Failed to create vendor');
    }
    return result;
  };

  // Handle vendor update
  const handleUpdateVendor = async (vendorId, vendorData) => {
    const result = await updateVendor(vendorId, vendorData);
    if (result.success) {
      alert('Vendor updated successfully!');
    } else {
      alert(result.error || 'Failed to update vendor');
    }
    return result;
  };

  // Handle vendor delete
  const handleDeleteVendor = async (vendorId) => {
    const result = await deleteVendor(vendorId);
    if (result.success) {
      alert('Vendor deleted successfully!');
    } else {
      alert(result.error || 'Failed to delete vendor');
    }
    return result;
  };

  // Handle vendor view
  const handleViewVendor = (vendor) => {
    setEditingVendor(vendor);
    setShowViewVendor(true);
  };

  // Handle vendor edit
  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setShowEditVendorModal(true);
  };

  // Handle purchase creation
  const handleCreatePurchase = async (purchaseData) => {
    const result = await createPurchase(purchaseData);
    if (result.success) {
      alert('Purchase created successfully!');
    } else {
      alert(result.error || 'Failed to create purchase');
    }
    return result;
  };

  // Handle purchase update
  const handleUpdatePurchase = async (vendorId, purchaseId, purchaseData) => {
    const result = await updatePurchase(vendorId, purchaseId, purchaseData);
    if (result.success) {
      alert('Purchase updated successfully!');
    } else {
      alert(result.error || 'Failed to update purchase');
    }
    return result;
  };

  // Handle purchase delete
  const handleDeletePurchase = async (vendorId, purchaseId) => {
    const result = await deletePurchase(vendorId, purchaseId);
    if (result.success) {
      alert('Purchase deleted successfully!');
    } else {
      alert(result.error || 'Failed to delete purchase');
    }
    return result;
  };

  // Handle purchase view
  const handleViewPurchase = (purchase) => {
    setEditingVendor(purchase);
    setShowViewPurchase(true);
  };

  // Handle purchase edit
  const handleEditPurchase = (purchase) => {
    // Load the purchase data into the edit modal
    setEditingPurchase(purchase);
    setShowEditPurchaseModal(true);
  };

  // Handle search
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    filterPurchaseRecords(updatedFilters);
  };

  // Calculate totals with safe property access
  const purchaseTotal = calculatePurchaseTotal();
  const balance = (purchaseData?.amountDue || 0) - (purchaseData?.amountPaid || 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl">
                  <Store className="w-8 h-8 text-white" />
                </div>
                Vendor & Purchase Management
              </h1>
              <p className="text-gray-600 mt-2">Manage vendors, create purchases, and view records in one place</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => fetchVendors()}
                className="px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium flex items-center gap-2 transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh All
              </button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex justify-between items-center">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-3" />
              <span className="font-medium">{error}</span>
            </div>
            <button onClick={clearError} className="p-1 hover:bg-red-100 rounded-full">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-gray-200">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              {[
                { id: 'vendors', label: 'Vendors', icon: Users, color: 'blue' },
                { id: 'purchases', label: 'Purchases & Records', icon: ShoppingCart, color: 'green' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl transition-all ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r from-${tab.color}-600 to-${tab.color}-700 text-white shadow-lg shadow-${tab.color}-500/20`
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-semibold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'vendors' && (
          <VendorsTab
            vendors={vendors}
            onCreateVendorClick={() => setShowVendorModal(true)}
            onViewVendorClick={handleViewVendor}
            onEditVendorClick={handleEditVendor}
            onDeleteVendorClick={handleDeleteVendor}
          />
        )}

        {activeTab === 'purchases' && (
          <PurchasesTab
            onCreatePurchaseClick={() => setShowPurchaseModal(true)}
            purchases={purchaseRecords}
            vendors={vendors}
            isLoading={isLoadingPurchases}
            onRefresh={fetchAllPurchases}
            filters={filters}
            setFilters={setFilters}
            onFilterChange={handleFilterChange}
            onViewPurchaseClick={handleViewPurchase}
            onEditPurchaseClick={handleEditPurchase}
            onDeletePurchaseClick={handleDeletePurchase}
          />
        )}

        {/* Modals */}
        <CreateVendorModal
          isOpen={showVendorModal}
          onClose={() => setShowVendorModal(false)}
          onCreate={handleCreateVendor}
        />

        <EditVendorModal
          isOpen={showEditVendorModal}
          onClose={() => {
            setShowEditVendorModal(false);
            setEditingVendor(null);
          }}
          vendor={editingVendor}
          onUpdate={handleUpdateVendor}
        />

        <ViewVendorModal
          isOpen={showViewVendor}
          onClose={() => {
            setShowViewVendor(false);
            setEditingVendor(null);
          }}
          vendor={editingVendor}
        />

        <CreatePurchaseModal
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          vendors={vendors}
          selectedVendor={selectedVendor}
          onSelectVendor={selectVendor}
          onClearVendor={clearSelectedVendor}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          productSearchResults={productSearchResults}
          purchaseProducts={purchaseProducts}
          onAddProduct={addProductToPurchase}
          onRemoveProduct={removeProductFromPurchase}
          onUpdateQuantity={updateProductQuantity}
          onClearProducts={clearPurchaseProducts}
          purchaseData={purchaseData}
          onUpdatePurchaseData={updatePurchaseData}
          purchaseTotal={purchaseTotal}
          balance={balance}
          onCreatePurchase={handleCreatePurchase}
          isLoading={isLoading}
          onAddCustomProduct={addCustomProductToPurchase}
        />

        <EditPurchaseModal
          isOpen={showEditPurchaseModal}
          onClose={() => {
            setShowEditPurchaseModal(false);
            setEditingPurchase(null);
            setPurchaseProducts([]);
          }}
          vendors={vendors}
          selectedVendor={editingPurchase ? vendors.find(v => v._id === editingPurchase.vendorId) : null}
          onSelectVendor={selectVendor}
          onClearVendor={clearSelectedVendor}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          productSearchResults={productSearchResults}
          purchaseProducts={purchaseProducts}
          onAddProduct={addProductToPurchase}
          onRemoveProduct={removeProductFromPurchase}
          onUpdateQuantity={updateProductQuantity}
          onClearProducts={clearPurchaseProducts}
          purchaseData={purchaseData}
          onUpdatePurchaseData={updatePurchaseData}
          purchaseTotal={purchaseTotal}
          balance={balance}
          onUpdatePurchase={handleUpdatePurchase}
          isLoading={isLoading}
          onAddCustomProduct={addCustomProductToPurchase}
          editingPurchase={editingPurchase}
          onSaveEdit={() => {
            setShowEditPurchaseModal(false);
            setEditingPurchase(null);
            setPurchaseProducts([]);
            alert('Purchase updated successfully!');
          }}
        />

        <ViewPurchaseModal
          isOpen={showViewPurchase}
          onClose={() => {
            setShowViewPurchase(false);
            setEditingVendor(null);
          }}
          purchase={editingVendor}
        />
      </div>
    </div>
  );
};

export default Vendor;