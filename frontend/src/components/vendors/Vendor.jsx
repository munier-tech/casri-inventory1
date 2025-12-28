import { useState, useEffect } from 'react';
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
  Loader2, Calendar,
  FileText,
  Eye, BarChart3,
  CreditCard as Card,
  Wallet, ChevronLeft,
  ChevronRight,
  Smartphone,
  User,
  Lock,
  Download, Coins,
  Smartphone as PhoneIcon,
  CreditCard as CardIcon
} from 'lucide-react';

// ========== MODALS ==========

// Create Vendor Modal
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

// ========== PAYMENT METHOD STATS DASHBOARD ==========

const PaymentMethodDashboard = ({ purchaseRecords }) => {
  // Calculate payment method statistics
  const calculatePaymentStats = (purchases) => {
    const stats = {
      cash: { 
        total: 0, 
        count: 0, 
        label: 'Cash', 
        icon: Coins, 
        color: 'from-green-500 to-green-600',
        bgColor: 'bg-green-50',
        textColor: 'text-green-700',
        borderColor: 'border-green-200'
      },
      zaad: { 
        total: 0, 
        count: 0, 
        label: 'Zaad', 
        icon: PhoneIcon, 
        color: 'from-blue-500 to-blue-600',
        bgColor: 'bg-blue-50',
        textColor: 'text-blue-700',
        borderColor: 'border-blue-200'
      },
      edahab: { 
        total: 0, 
        count: 0, 
        label: 'Edahab', 
        icon: CardIcon, 
        color: 'from-purple-500 to-purple-600',
        bgColor: 'bg-purple-50',
        textColor: 'text-purple-700',
        borderColor: 'border-purple-200'
      }
    };
    
    purchases.forEach(purchase => {
      const method = purchase.paymentMethod || 'cash';
      const amountPaid = purchase.amountPaid || 0;
      
      if (stats[method]) {
        stats[method].total += amountPaid;
        stats[method].count += 1;
      }
    });
    
    return stats;
  };

  const paymentStats = calculatePaymentStats(purchaseRecords);
  const totalPaid = purchaseRecords.reduce((sum, purchase) => sum + (purchase.amountPaid || 0), 0);
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Calculate percentages
  const cashPercentage = totalPaid > 0 ? (paymentStats.cash.total / totalPaid * 100).toFixed(1) : 0;
  const zaadPercentage = totalPaid > 0 ? (paymentStats.zaad.total / totalPaid * 100).toFixed(1) : 0;
  const edahabPercentage = totalPaid > 0 ? (paymentStats.edahab.total / totalPaid * 100).toFixed(1) : 0;

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Payment Methods Dashboard</h3>
          <p className="text-gray-600 mt-2">Total Amount Paid: <span className="font-bold text-green-600 text-xl">{formatCurrency(totalPaid)}</span></p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-900">{purchaseRecords.length}</p>
        </div>
      </div>
      
      {/* Payment Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {Object.entries(paymentStats).map(([method, data]) => {
          const Icon = data.icon;
          const percentage = totalPaid > 0 ? (data.total / totalPaid * 100).toFixed(1) : 0;
          
          return (
            <div 
              key={method}
              className={`p-6 rounded-xl border-2 hover:shadow-xl transition-all duration-300 ${data.borderColor} ${data.bgColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${data.color} shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-600">Transactions</div>
                  <div className="text-2xl font-bold text-gray-900">{data.count}</div>
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-gray-900 mb-1">{data.label}</h4>
              <div className="text-3xl font-bold mb-3">{formatCurrency(data.total)}</div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Percentage:</span>
                  <span className={`font-bold ${data.textColor}`}>
                    {percentage}%
                  </span>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-3 rounded-full bg-gray-200 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 bg-gradient-to-r ${data.color}`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h4 className="text-lg font-bold text-gray-900 mb-4">Payment Summary</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Cash Transactions</div>
            <div className="text-2xl font-bold text-green-600">{paymentStats.cash.count}</div>
            <div className="text-sm text-gray-500">{formatCurrency(paymentStats.cash.total)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Zaad Transactions</div>
            <div className="text-2xl font-bold text-blue-600">{paymentStats.zaad.count}</div>
            <div className="text-sm text-gray-500">{formatCurrency(paymentStats.zaad.total)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Edahab Transactions</div>
            <div className="text-2xl font-bold text-purple-600">{paymentStats.edahab.count}</div>
            <div className="text-sm text-gray-500">{formatCurrency(paymentStats.edahab.total)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-1">Average Payment</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(totalPaid / purchaseRecords.length || 0)}
            </div>
            <div className="text-sm text-gray-500">per transaction</div>
          </div>
        </div>
      </div>

      {/* Pie Chart Visualization */}
      <div className="mt-6">
        <div className="flex items-center justify-center space-x-6">
          {totalPaid > 0 && (
            <>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-green-500 to-green-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Cash: {cashPercentage}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Zaad: {zaadPercentage}%</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full mr-2"></div>
                <span className="text-sm text-gray-600">Edahab: {edahabPercentage}%</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== PAY VENDOR MODAL ==========

const PayVendorModal = ({ purchase, onClose, onSuccess }) => {
  const { updatePurchase } = useVendorPurchaseStore();
  const [formData, setFormData] = useState({
    amountPaidToday: '',
    paymentMethod: 'cash',
    currency: 'USD',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate amount owed
  const calculateAmountOwed = (purchase) => {
    if (!purchase) return 0;
    const amountDue = purchase.amountDue || 0;
    const amountPaid = purchase.amountPaid || 0;
    return Math.max(0, amountDue - amountPaid);
  };

  const amountOwed = calculateAmountOwed(purchase);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amountPaidToday || parseFloat(formData.amountPaidToday) <= 0) {
      alert('Please enter a valid amount to pay');
      return;
    }

    if (parseFloat(formData.amountPaidToday) > amountOwed) {
      alert(`Payment amount cannot exceed the balance due of ${formatCurrency(amountOwed)}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Calculate new totals
      const newAmountPaid = (purchase.amountPaid || 0) + parseFloat(formData.amountPaidToday);
      
      // Create updated purchase data
      const updatedPurchaseData = {
        ...purchase,
        amountPaid: newAmountPaid,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes || purchase.notes || ''
      };

      // Call the update purchase API
      const result = await updatePurchase(purchase.vendorId, purchase._id, updatedPurchaseData);
      
      if (result.success) {
        // Call the success callback with payment data
        const paymentData = {
          purchaseId: purchase._id,
          vendorId: purchase.vendorId,
          amountPaidToday: parseFloat(formData.amountPaidToday),
          paymentMethod: formData.paymentMethod,
          currency: formData.currency,
          notes: formData.notes,
          previousAmountPaid: purchase.amountPaid || 0,
          totalAmountDue: purchase.amountDue || 0,
          newBalance: amountOwed - parseFloat(formData.amountPaidToday)
        };
        
        onSuccess(paymentData);
        alert('Payment submitted successfully!');
        onClose();
      } else {
        alert(result.error || 'Failed to submit payment');
      }
    } catch (error) {
      console.error('Payment error:', error);
      alert('Failed to submit payment. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  if (!purchase) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Make Payment</h3>
            <p className="text-sm text-gray-600 mt-1">Pay vendor for purchase #{purchase._id?.slice(-8) || purchase._id}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Vendor Information - Locked */}
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 flex items-center">
                    <Lock className="w-4 h-4 mr-2 text-gray-500" />
                    Vendor Information (Locked)
                  </h4>
                </div>
                
                {/* Vendor Name */}
                <div className="mb-3 p-3 bg-white rounded-lg border border-gray-300">
                  <label className="block text-xs font-medium text-gray-500 mb-1">HILAAC</label>
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-400 mr-2" />
                    <span className="font-semibold text-gray-900">{purchase.vendorName || 'Unknown Vendor'}</span>
                  </div>
                </div>

                {/* Vendor Phone */}
                <div className="p-3 bg-white rounded-lg border border-gray-300">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Vendor Phone</label>
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="font-semibold text-gray-900">+252</div>
                      <div className="text-gray-600">|</div>
                      <div className="font-semibold text-gray-900">{purchase.vendorPhone || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount Owed - Locked */}
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <label className="block text-sm font-medium text-blue-700 mb-2">Amount Owed (Locked)</label>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-5 h-5 text-blue-600 mr-2" />
                    <span className="text-lg font-bold text-blue-900">{formatCurrency(amountOwed)}</span>
                  </div>
                  <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                    Balance Due
                  </div>
                </div>
                <div className="mt-2 text-sm text-blue-600">
                  Total Due: {formatCurrency(purchase.amountDue || 0)} | 
                  Already Paid: {formatCurrency(purchase.amountPaid || 0)}
                </div>
              </div>

              {/* Amount Paid Today - Editable */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid Today *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    name="amountPaidToday"
                    value={formData.amountPaidToday}
                    onChange={handleChange}
                    required
                    min="0.01"
                    max={amountOwed}
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum payment: {formatCurrency(amountOwed)}
                </p>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Payment Method *
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
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.paymentMethod === method
                          ? `bg-gradient-to-r ${color} border-transparent text-white shadow-lg`
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Icon className={`w-5 h-5 ${formData.paymentMethod === method ? 'text-white' : 'text-gray-400'}`} />
                        <span className={`text-sm font-medium ${formData.paymentMethod === method ? 'text-white' : 'text-gray-700'}`}>
                          {label}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="SOS">SOS - Somali Shilling</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add any notes about this payment..."
                />
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Previous Balance:</span>
                    <span className="font-medium">{formatCurrency(amountOwed)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Today:</span>
                    <span className="font-bold text-green-600">
                      {formData.amountPaidToday ? formatCurrency(parseFloat(formData.amountPaidToday)) : '$0.00'}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-gray-300">
                    <div className="flex justify-between">
                      <span className="font-semibold text-gray-900">New Balance:</span>
                      <span className={`font-bold ${
                        (amountOwed - (parseFloat(formData.amountPaidToday) || 0)) > 0 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        {formatCurrency(amountOwed - (parseFloat(formData.amountPaidToday) || 0))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !formData.amountPaidToday}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  Submit Payment
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ========== VIEW PURCHASE MODAL ==========

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Purchase Details</h3>
            <p className="text-sm text-gray-600 mt-1">View complete purchase information</p>
            <div className="text-xs text-gray-500 mt-1">ID: {purchase._id?.slice(-8) || purchase._id}</div>
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
            {/* Header Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Vendor Card */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Vendor Information</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Name</label>
                    <p className="font-medium text-gray-900">{purchase.vendorName || 'Unknown'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Phone</label>
                    <p className="font-medium text-gray-900">{purchase.vendorPhone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">ID</label>
                    <p className="text-xs text-gray-500 font-mono">{purchase.vendorId || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Transaction Card */}
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-5 rounded-xl border border-green-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Calendar className="w-5 h-5 text-green-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Transaction Details</h4>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm text-gray-600">Date</label>
                    <p className="font-medium text-gray-900">{formatDate(purchase.purchaseDate || purchase.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Method</label>
                    <p className="font-medium capitalize">{purchase.paymentMethod || 'cash'}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Status</label>
                    <p className={`font-medium ${
                      balance > 0 ? 'text-red-600' : 
                      balance < 0 ? 'text-purple-600' : 
                      'text-green-600'
                    }`}>
                      {balance > 0 ? 'Pending' : balance < 0 ? 'Overpaid' : 'Paid'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Payment Card */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="font-bold text-gray-900">Payment Summary</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total:</span>
                    <span className="font-bold">{formatCurrency(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due:</span>
                    <span className="font-medium">{formatCurrency(purchase.amountDue || totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Paid:</span>
                    <span className="font-medium text-green-600">{formatCurrency(purchase.amountPaid || 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-purple-300">
                    <div className="flex justify-between">
                      <span className="font-semibold">Balance:</span>
                      <span className={`font-bold ${
                        balance > 0 ? 'text-red-600' : 
                        balance < 0 ? 'text-purple-600' : 
                        'text-green-600'
                      }`}>
                        {formatCurrency(Math.abs(balance))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-200">
                <h4 className="font-bold text-gray-900 text-lg">Products Purchased ({purchase.products?.length || 0})</h4>
              </div>
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
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {product.quantity || 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">{formatCurrency(product.unitPrice || 0)}</td>
                        <td className="py-3 px-4 font-bold">{formatCurrency(product.total || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="py-3 px-4 font-bold text-right">Total:</td>
                      <td className="py-3 px-4 font-bold text-lg text-gray-900">{formatCurrency(totalAmount)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Notes Section */}
            {purchase.notes && (
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <h4 className="font-bold text-gray-900 text-lg mb-3">Notes</h4>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-gray-700 whitespace-pre-wrap">{purchase.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ========== DELETE CONFIRMATION MODAL ==========

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

// ========== VENDORS TAB ==========

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalSpent)}</p>
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
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalBalance)}</p>
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
                          {formatCurrency(vendor.totalAmount || 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${(vendor.balance || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {formatCurrency(vendor.balance || 0)}
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

// ========== PURCHASES TAB ==========

const PurchasesTab = ({ 
  onCreatePurchaseClick, 
  purchases, 
  vendors, 
  isLoading, 
  onRefresh,
  filters,
  setFilters,
  onFilterChange,
  onPayPurchase,
  onViewPurchaseClick,
  onEditPurchaseClick,
  onDeletePurchaseClick
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [purchaseToDelete, setPurchaseToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const itemsPerPage = 10;

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  // Filter purchases based on search term
  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.vendorPhone?.includes(searchTerm) ||
      purchase._id?.toLowerCase().includes(searchTerm.toLowerCase());

    // Apply other filters
    if (filters.vendorId && purchase.vendorId !== filters.vendorId) return false;
    
    if (filters.startDate) {
      const purchaseDate = new Date(purchase.purchaseDate || purchase.createdAt);
      const startDate = new Date(filters.startDate);
      if (purchaseDate < startDate) return false;
    }
    
    if (filters.endDate) {
      const purchaseDate = new Date(purchase.purchaseDate || purchase.createdAt);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      if (purchaseDate > endDate) return false;
    }

    // Add payment method filter
    if (selectedPaymentMethod !== 'all' && selectedPaymentMethod !== purchase.paymentMethod) {
      return false;
    }

    return matchesSearch;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPurchases = filteredPurchases.slice(startIndex, startIndex + itemsPerPage);

  const stats = getPurchaseStats();

  // Calculate payment method distribution for filter dropdown
  const paymentMethodDistribution = purchases.reduce((acc, purchase) => {
    const method = purchase.paymentMethod || 'cash';
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      {/* Payment Method Dashboard */}
      <PaymentMethodDashboard purchaseRecords={purchases} />

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
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalAmount)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Balance</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalBalance)}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertCircle className="w-6 h-6 text-red-600" />
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

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-5 mb-6 border border-gray-200 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Purchases</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by vendor name, phone, or purchase ID..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Vendor</label>
              <select
                value={filters.vendorId || ''}
                onChange={(e) => onFilterChange({ vendorId: e.target.value || null })}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Vendors</option>
                {vendors.map(vendor => (
                  <option key={vendor._id} value={vendor._id}>
                    {vendor.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onFilterChange({ startDate: e.target.value || null })}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Methods</option>
                <option value="cash">
                  Cash ({paymentMethodDistribution.cash || 0})
                </option>
                <option value="zaad">
                  Zaad ({paymentMethodDistribution.zaad || 0})
                </option>
                <option value="edahab">
                  Edahab ({paymentMethodDistribution.edahab || 0})
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Purchase Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Purchase Records</h3>
              <p className="text-gray-600 mt-1">Showing {paginatedPurchases.length} of {filteredPurchases.length} purchases</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onRefresh}
                disabled={isLoading}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={() => {
                  const csvData = [
                    ['Date', 'Vendor', 'Products', 'Total', 'Amount Due', 'Amount Paid', 'Balance', 'Payment Method'],
                    ...filteredPurchases.map(purchase => {
                      const total = calculateTotal(purchase.products);
                      const balance = calculateBalance(purchase);
                      return [
                        formatDate(purchase.purchaseDate || purchase.createdAt),
                        purchase.vendorName || 'Unknown',
                        purchase.products?.length || 0,
                        formatCurrency(total),
                        formatCurrency(purchase.amountDue || total),
                        formatCurrency(purchase.amountPaid || 0),
                        formatCurrency(Math.abs(balance)),
                        purchase.paymentMethod || 'cash'
                      ];
                    })
                  ];
                  
                  const csvContent = csvData.map(row => row.join(',')).join('\n');
                  const blob = new Blob([csvContent], { type: 'text/csv' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `purchases-${new Date().toISOString().split('T')[0]}.csv`;
                  a.click();
                }}
                className="px-4 py-2.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-xl font-medium flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        <div className="p-5">
          {isLoading ? (
            <div className="text-center py-16">
              <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-500" />
              <p className="mt-3 text-gray-500">Loading purchase records...</p>
            </div>
          ) : paginatedPurchases.length === 0 ? (
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
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Vendor</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Products</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Total</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Amount Due</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Paid</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Balance</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPurchases.map((purchase) => {
                      const totalAmount = calculateTotal(purchase.products);
                      const balance = calculateBalance(purchase);
                      
                      return (
                        <tr key={purchase._id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="text-gray-900">{formatDate(purchase.purchaseDate || purchase.createdAt)}</div>
                            <div className="text-xs text-gray-500">
                              ID: {purchase._id?.slice(-8) || purchase._id}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-gray-900">{purchase.vendorName || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{purchase.vendorPhone || 'N/A'}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="text-gray-700">{purchase.products?.length || 0} items</div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-gray-900">
                              {formatCurrency(totalAmount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium">
                              {formatCurrency(purchase.amountDue || totalAmount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-medium text-green-600">
                              {formatCurrency(purchase.amountPaid || 0)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-bold ${
                              balance > 0 ? 'text-red-600' : 
                              balance < 0 ? 'text-purple-600' : 
                              'text-green-600'
                            }`}>
                              {formatCurrency(Math.abs(balance))}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                balance > 0 ? 'bg-red-100 text-red-800' :
                                balance < 0 ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {balance > 0 ? 'Pending' : balance < 0 ? 'Overpaid' : 'Paid'}
                              </span>
                              <span className={`p-1 rounded-full ${
                                purchase.paymentMethod === 'cash' ? 'bg-green-100' :
                                purchase.paymentMethod === 'zaad' ? 'bg-blue-100' :
                                'bg-purple-100'
                              }`}>
                                {purchase.paymentMethod === 'cash' ? (
                                  <Wallet className="w-3 h-3 text-green-600" />
                                ) : purchase.paymentMethod === 'zaad' ? (
                                  <Smartphone className="w-3 h-3 text-blue-600" />
                                ) : (
                                  <CreditCard className="w-3 h-3 text-purple-600" />
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              {/* Pay Button (only if balance > 0) */}
                              {balance > 0 && (
                                <button
                                  onClick={() => onPayPurchase(purchase)}
                                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                  title="Make Payment"
                                >
                                  <DollarSign className="w-4 h-4 mr-1" />
                                  Pay
                                </button>
                              )}
                              {/* View Button */}
                              <button
                                onClick={() => onViewPurchaseClick(purchase)}
                                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                                title="View Details"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </button>
                              {/* Edit Button */}
                              <button
                                onClick={() => onEditPurchaseClick(purchase)}
                                className="p-2 hover:bg-green-50 rounded-lg text-green-600 hover:text-green-700 transition-colors"
                                title="Edit purchase"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              {/* Delete Button */}
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPurchases.length)} of{' '}
                    {filteredPurchases.length} purchases
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg ${
                            currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
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

// ========== MAIN COMPONENT ==========

const Vendor = () => {
  const {
    // State
    vendors,
    purchaseRecords,
    isLoading,
    isLoadingPurchases,
    error,
    activeTab,
    showVendorModal,
    showPurchaseModal,
    showEditVendorModal,
    editingVendor,
    showEditPurchaseModal,
    editingPurchase,
    
    // Actions
    fetchVendors,
    fetchAllProducts,
    fetchAllPurchases,
    createVendor,
    updateVendor,
    deleteVendor,
    setPurchaseForEditing,
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
    createPurchase,
  } = useVendorPurchaseStore();

  const [filters, setFilters] = useState({
    vendorId: '',
    startDate: '',
    endDate: '',
    paymentMethod: ''
  });

  // New states for modals
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);

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
    alert(`Viewing vendor:\nName: ${vendor.name}\nPhone: ${vendor.phoneNumber}\nLocation: ${vendor.location}\nTotal Purchases: ${vendor.totalPurchases || 0}\nTotal Amount: $${(vendor.totalAmount || 0).toFixed(2)}\nBalance: $${(vendor.balance || 0).toFixed(2)}`);
  };

  // Handle vendor edit
  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setShowEditVendorModal(true);
  };

  // Handle purchase creation
  const handleCreatePurchase = () => {
    setShowPurchaseModal(true);
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
    setSelectedPurchase(purchase);
    setShowViewModal(true);
  };

  // Handle purchase edit
  const handleEditPurchase = (purchase) => {
    setPurchaseForEditing(purchase);
    setShowEditPurchaseModal(true);
  };

  // Handle payment
  const handlePayPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setShowPayModal(true);
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentData) => {
    console.log('Payment successful:', paymentData);
    alert(`Payment of $${paymentData.amountPaidToday} submitted successfully!\nPayment Method: ${paymentData.paymentMethod}\nNew Balance: $${paymentData.newBalance.toFixed(2)}`);
    // Refresh purchases
    fetchAllPurchases();
  };

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    filterPurchaseRecords(updatedFilters);
  };

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
              <p className="text-gray-600 mt-2">Manage vendors, create purchases, and track payment methods</p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  fetchVendors();
                  fetchAllPurchases();
                }}
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
            onCreatePurchaseClick={handleCreatePurchase}
            purchases={purchaseRecords}
            vendors={vendors}
            isLoading={isLoadingPurchases}
            onRefresh={fetchAllPurchases}
            filters={filters}
            setFilters={setFilters}
            onFilterChange={handleFilterChange}
            onPayPurchase={handlePayPurchase}
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

        {/* Payment Modal */}
        {showPayModal && selectedPurchase && (
          <PayVendorModal
            purchase={selectedPurchase}
            onClose={() => {
              setShowPayModal(false);
              setSelectedPurchase(null);
            }}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {/* View Purchase Modal */}
        {showViewModal && selectedPurchase && (
          <ViewPurchaseModal
            isOpen={showViewModal}
            onClose={() => {
              setShowViewModal(false);
              setSelectedPurchase(null);
            }}
            purchase={selectedPurchase}
          />
        )}
      </div>
    </div>
  );
};

export default Vendor;