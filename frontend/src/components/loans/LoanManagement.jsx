import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  User, 
  Package, 
  Calendar, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  Briefcase,
  Star
} from "lucide-react";
import useLoanStore from "../../store/useLoanStore";

const LoanManagement = ({ language = "so" }) => {
  const {
    loans,
    stats,
    loading,
    error,
    fetchLoans,
    createLoan,
    updateLoan,
    deleteLoan,
    markLoanAsPaid,
    fetchLoanStats,
    clearError
  } = useLoanStore();

  const [activeTab, setActiveTab] = useState("family");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  
  const [formData, setFormData] = useState({
    personName: "",
    productName: "",
    amount: "",
    description: "",
    quantity: 1,
    loanType: "family"
  });
  
  const [editFormData, setEditFormData] = useState({
    personName: "",
    productName: "",
    amount: "",
    description: "",
    quantity: 1,
    loanType: "family"
  });

  const [filters, setFilters] = useState({
    isPaid: "",
    personName: "",
    startDate: "",
    endDate: ""
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchLoans();
    fetchLoanStats();
  }, [fetchLoans, fetchLoanStats]);

  useEffect(() => {
    if (error) {
      setTimeout(() => clearError(), 5000);
    }
  }, [error, clearError]);

  // Fixed: Handle legacy loans without loanType field
  const filteredLoans = loans.filter(loan => {
    // If loan doesn't have loanType, treat it based on active tab
    if (!loan.loanType) {
      // For legacy loans, you might want to assign them to a specific tab
      // Here we'll show them in family loans tab by default, or you can adjust
      return activeTab === "family"; // Show legacy loans in family tab
    }
    
    // For new loans with loanType field
    if (activeTab === "family") return loan.loanType === "family";
    if (activeTab === "clients") return loan.loanType === "clients";
    if (activeTab === "special") return loan.loanType === "special";
    return true;
  });

  // Calculate stats for each tab
  const calculateTabStats = () => {
    const tabLoans = filteredLoans;
    const totalAmount = tabLoans.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);
    const unpaidLoans = tabLoans.filter(loan => !loan.isPaid);
    const unpaidAmount = unpaidLoans.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);
    const paidLoans = tabLoans.filter(loan => loan.isPaid);
    const paidAmount = paidLoans.reduce((sum, loan) => sum + parseFloat(loan.amount || 0), 0);

    return {
      totalLoans: tabLoans.length,
      totalAmount,
      unpaidLoans: unpaidLoans.length,
      unpaidAmount,
      paidLoans: paidLoans.length,
      paidAmount
    };
  };

  const tabStats = calculateTabStats();

  const getCreatorDisplayName = (createdBy) => {
    if (!createdBy) return "Unknown";
    if (createdBy.username) return createdBy.username;
    if (createdBy.userName) return createdBy.userName;
    if (createdBy.user && createdBy.user.username) return createdBy.user.username;
    if (createdBy.displayName) return createdBy.displayName;
    if (createdBy.name) return createdBy.name;
    if (createdBy.firstName && createdBy.lastName) return `${createdBy.firstName} ${createdBy.lastName}`;
    if (createdBy.firstName) return createdBy.firstName;
    if (createdBy.email) return createdBy.email.split('@')[0];
    return "Unknown";
  };

  const getUsernameFromEmail = (email) => {
    if (!email) return "Unknown";
    return email.split('@')[0];
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const filterParams = { ...filters };
    // Don't filter by loanType in backend to get all loans
    fetchLoans(filterParams);
  };

  const clearFilters = () => {
    setFilters({
      isPaid: "",
      personName: "",
      startDate: "",
      endDate: ""
    });
    fetchLoans();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.personName || !formData.productName || !formData.amount) {
      return;
    }
    
    // Fixed: Ensure loanType is included in the submission
    const submitData = {
      personName: formData.personName,
      productName: formData.productName,
      amount: parseFloat(formData.amount),
      description: formData.description,
      quantity: parseInt(formData.quantity) || 1,
      loanType: formData.loanType // Make sure this is included
    };
    
    console.log("Submitting loan:", submitData); // Debug log
    
    await createLoan(submitData);
    if (!error) {
      setFormData({
        personName: "",
        productName: "",
        amount: "",
        description: "",
        quantity: 1,
        loanType: activeTab // Reset to current active tab
      });
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const updateData = {
      personName: editFormData.personName,
      productName: editFormData.productName,
      amount: parseFloat(editFormData.amount),
      description: editFormData.description,
      quantity: parseInt(editFormData.quantity) || 1,
      loanType: editFormData.loanType
    };
    
    await updateLoan(editingId, updateData);
    if (!error) {
      setEditingId(null);
      setEditFormData({
        personName: "",
        productName: "",
        amount: "",
        description: "",
        quantity: 1,
        loanType: "family"
      });
    }
  };

  const startEditing = (loan) => {
    setEditingId(loan._id);
    setEditFormData({
      personName: loan.personName,
      productName: loan.productName,
      amount: loan.amount.toString(),
      description: loan.description || "",
      quantity: loan.quantity || 1,
      loanType: loan.loanType || "family" // Handle legacy loans
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({
      personName: "",
      productName: "",
      amount: "",
      description: "",
      quantity: 1,
      loanType: "family"
    });
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        language === "so"
          ? "Ma hubtaa inaad rabto inaad tirtirto deyntan?"
          : "Are you sure you want to delete this loan?"
      )
    ) {
      await deleteLoan(id);
    }
  };

  const handleMarkAsPaid = async (id) => {
    if (
      window.confirm(
        language === "so"
          ? "Ma hubtaa in deynta la bixiyay?"
          : "Are you sure this loan has been paid?"
      )
    ) {
      await markLoanAsPaid(id);
    }
  };

  const formatCurrency = (amount) => `$${parseFloat(amount || 0).toFixed(2)}`;
  const formatDate = (date) => date ? new Date(date).toLocaleDateString() : 'N/A';

  const content = {
    so: {
      title: "Maamulka Deynta",
      subtitle: "Maamul deynta dadka iyo alaabta la siiyay",
      createButton: "Abuur Deyn Cusub",
      createTitle: "Abuur Deyn Cusub",
      editTitle: "Wax Ka Beddel Deynta",
      viewTitle: "Fiiri Deynta",
      personNameLabel: "Magaca Qofka",
      productNameLabel: "Magaca Alaabta",
      amountLabel: "Qiimaha ($)",
      descriptionLabel: "Sharaxaad",
      quantityLabel: "Tirada",
      filterButton: "Shaandhey",
      clearFilters: "Ka Saar Shaandheynta",
      statusFilter: "Xaalada",
      dateFromFilter: "Taariikhda Bilowga",
      dateToFilter: "Taariikhda Dhamaadka",
      searchPerson: "Raadi magaca qofka...",
      allStatus: "Dhammaan",
      paid: "La Bixiyay",
      unpaid: "Lama Bixin",
      cancel: "Jooji",
      save: "Kaydi",
      delete: "Tirtir",
      edit: "Wax Ka Beddel",
      view: "Fiiri",
      markAsPaid: "Ku Calaamadee La Bixiyay",
      noLoans: "Deyn lama helin",
      loading: "...",
      error: "Khalad ayaa dhacay",
      totalLoans: "Wadarta Deynta",
      totalAmount: "Wadarta Lacagta",
      unpaidLoans: "Deynta aan la Bixin",
      unpaidAmount: "Lacagta aan la Bixin",
      paidLoans: "Deynta la Bixiyay",
      paidAmount: "Lacagta la Bixiyay",
      loanDate: "Taariikhda Deynta",
      paidDate: "Taariikhda Bixinta",
      createdBy: "Ku Abuuray",
      status: "Xaalada",
      familyLoans: "Deynta Qoyska",
      clientsLoans: "Deynta Macaamiisha",
      specialLoans: "Deynta Gaarka Ah",
      familyTabDesc: "Deynta qoyska iyo ehelada",
      clientsTabDesc: "Deynta macaamiisha ganacsiga",
      specialTabDesc: "Deynta gaarka ah iyo maalgelin dheeraad ah",
      loanTypeLabel: "Nooca Deynta",
      legacyLoan: "Deyn Hore"
    },
    en: {
      title: "Loan Management",
      subtitle: "Manage loans given to people and products",
      createButton: "Create New Loan",
      createTitle: "Create New Loan",
      editTitle: "Edit Loan",
      viewTitle: "View Loan",
      personNameLabel: "Person Name",
      productNameLabel: "Product Name",
      amountLabel: "Amount ($)",
      descriptionLabel: "Description",
      quantityLabel: "Quantity",
      filterButton: "Filter",
      clearFilters: "Clear Filters",
      statusFilter: "Status",
      dateFromFilter: "From Date",
      dateToFilter: "To Date",
      searchPerson: "Search person name...",
      allStatus: "All",
      paid: "Paid",
      unpaid: "Unpaid",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      view: "View",
      markAsPaid: "Mark as Paid",
      noLoans: "No loans found",
      loading: "Loading loans...",
      error: "An error occurred",
      totalLoans: "Total Loans",
      totalAmount: "Total Amount",
      unpaidLoans: "Unpaid Loans",
      unpaidAmount: "Unpaid Amount",
      paidLoans: "Paid Loans",
      paidAmount: "Paid Amount",
      loanDate: "Loan Date",
      paidDate: "Paid Date",
      createdBy: "Created By",
      status: "Status",
      familyLoans: "Family Loans",
      clientsLoans: "Clients Loans",
      specialLoans: "Special Loans",
      familyTabDesc: "Loans for family members and relatives",
      clientsTabDesc: "Business loans for clients and customers",
      specialTabDesc: "Special loans and extended financing",
      loanTypeLabel: "Loan Type",
      legacyLoan: "Legacy Loan"
    },
  };

  const tabConfig = {
    family: {
      icon: Users,
      label: content[language].familyLoans,
      description: content[language].familyTabDesc,
      color: "blue"
    },
    clients: {
      icon: Briefcase,
      label: content[language].clientsLoans,
      description: content[language].clientsTabDesc,
      color: "emerald"
    },
    special: {
      icon: Star,
      label: content[language].specialLoans,
      description: content[language].specialTabDesc,
      color: "purple"
    }
  };

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-emerald-100 p-3 rounded-lg mr-4">
                <DollarSign className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{content[language].title}</h2>
                <p className="text-gray-600">{content[language].subtitle}</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium"
              >
                <Filter className="w-5 h-5 mr-2" />
                {content[language].filterButton}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCreating(true)}
                className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                {content[language].createButton}
              </motion.button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mt-6 p-3 bg-red-100 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="px-6">
              <div className="flex space-x-8">
                {Object.entries(tabConfig).map(([key, tab]) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === key;
                  const colorClass = isActive 
                    ? `text-${tab.color}-600 border-${tab.color}-600` 
                    : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300";
                  
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${colorClass} transition-colors duration-200`}
                    >
                      <IconComponent className="w-5 h-5 mr-2" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Description */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <p className="text-gray-600 text-sm">
              {tabConfig[activeTab].description}
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{content[language].totalLoans}</p>
                    <p className="text-2xl font-bold text-gray-900">{tabStats.totalLoans}</p>
                    <p className="text-gray-600 text-sm">{content[language].totalAmount}</p>
                    <p className="text-lg font-semibold text-emerald-600">{formatCurrency(tabStats.totalAmount)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-emerald-600" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{content[language].unpaidLoans}</p>
                    <p className="text-2xl font-bold text-red-600">{tabStats.unpaidLoans}</p>
                    <p className="text-gray-600 text-sm">{content[language].unpaidAmount}</p>
                    <p className="text-lg font-semibold text-red-600">{formatCurrency(tabStats.unpaidAmount)}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">{content[language].paidLoans}</p>
                    <p className="text-2xl font-bold text-green-600">{tabStats.paidLoans}</p>
                    <p className="text-gray-600 text-sm">{content[language].paidAmount}</p>
                    <p className="text-lg font-semibold text-green-600">{formatCurrency(tabStats.paidAmount)}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {content[language].statusFilter}
                      </label>
                      <select
                        name="isPaid"
                        value={filters.isPaid}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      >
                        <option value="">{content[language].allStatus}</option>
                        <option value="false">{content[language].unpaid}</option>
                        <option value="true">{content[language].paid}</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {content[language].searchPerson}
                      </label>
                      <input
                        type="text"
                        name="personName"
                        value={filters.personName}
                        onChange={handleFilterChange}
                        placeholder={content[language].searchPerson}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {content[language].dateFromFilter}
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {content[language].dateToFilter}
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-gray-700"
                    >
                      {content[language].clearFilters}
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white"
                    >
                      {content[language].filterButton}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loans List */}
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
                <p className="text-gray-600 mt-2">{content[language].loading}</p>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">{content[language].noLoans}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLoans.map((loan) => (
                  <div key={loan._id} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                    {editingId === loan._id ? (
                      <form onSubmit={handleEditSubmit} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            name="personName"
                            placeholder={content[language].personNameLabel}
                            value={editFormData.personName}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                            required
                          />
                          <input
                            type="text"
                            name="productName"
                            placeholder={content[language].productNameLabel}
                            value={editFormData.productName}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                            required
                          />
                          <input
                            type="number"
                            name="amount"
                            placeholder={content[language].amountLabel}
                            value={editFormData.amount}
                            onChange={handleEditChange}
                            step="0.01"
                            min="0"
                            className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                            required
                          />
                          <input
                            type="number"
                            name="quantity"
                            placeholder={content[language].quantityLabel}
                            value={editFormData.quantity}
                            onChange={handleEditChange}
                            min="1"
                            className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {content[language].loanTypeLabel}
                          </label>
                          <select
                            name="loanType"
                            value={editFormData.loanType}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                          >
                            <option value="family">{content[language].familyLoans}</option>
                            <option value="clients">{content[language].clientsLoans}</option>
                            <option value="special">{content[language].specialLoans}</option>
                          </select>
                        </div>
                        <textarea
                          name="description"
                          placeholder={content[language].descriptionLabel}
                          value={editFormData.description}
                          onChange={handleEditChange}
                          className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                          rows="2"
                        />
                        <div className="flex space-x-2">
                          <button type="submit" className="px-4 py-2 bg-green-600 rounded text-white">
                            <Check className="w-4 h-4 mr-1 inline" />
                            {content[language].save}
                          </button>
                          <button type="button" onClick={cancelEditing} className="px-4 py-2 bg-red-600 rounded text-white">
                            <X className="w-4 h-4 mr-1 inline" />
                            {content[language].cancel}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex justify-between items-start">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="flex items-center mb-2">
                              <User className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-900 font-medium">{loan.personName}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              <Package className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-700">{loan.productName}</span>
                              {loan.quantity > 1 && (
                                <span className="text-gray-500 ml-2">x{loan.quantity}</span>
                              )}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-emerald-600 font-semibold">{formatCurrency(loan.amount)}</span>
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center mb-2">
                              <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                              <span className="text-gray-700">{formatDate(loan.loanDate)}</span>
                            </div>
                            <div className="flex items-center">
                              {loan.isPaid ? (
                                <div className="flex items-center text-green-600">
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  <span>{content[language].paid}</span>
                                </div>
                              ) : (
                                <div className="flex items-center text-red-600">
                                  <XCircle className="h-4 w-4 mr-2" />
                                  <span>{content[language].unpaid}</span>
                                </div>
                              )}
                            </div>
                            {loan.isPaid && loan.paidDate && (
                              <div className="flex items-center mt-1">
                                <Check className="h-4 w-4 text-gray-500 mr-2" />
                                <span className="text-gray-500 text-sm">{formatDate(loan.paidDate)}</span>
                              </div>
                            )}
                          </div>

                          <div>
                            {loan.description && (
                              <p className="text-gray-600 text-sm mb-2">{loan.description}</p>
                            )}
                            {loan.createdBy && (
                              <p className="text-gray-500 text-xs">
                                {content[language].createdBy}: {getUsernameFromEmail(loan.createdBy.email || loan.createdBy)}
                              </p>
                            )}
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              !loan.loanType 
                                ? "bg-gray-100 text-gray-800" 
                                : loan.loanType === "family" 
                                  ? "bg-blue-100 text-blue-800"
                                  : loan.loanType === "clients"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-purple-100 text-purple-800"
                            }`}>
                              {!loan.loanType 
                                ? content[language].legacyLoan
                                : loan.loanType === "family" 
                                  ? content[language].familyLoans
                                  : loan.loanType === "clients"
                                    ? content[language].clientsLoans
                                    : content[language].specialLoans
                              }
                            </div>
                          </div>
                        </div>

                        <div className="flex space-x-2 ml-4">
                          {!loan.isPaid && (
                            <button
                              onClick={() => handleMarkAsPaid(loan._id)}
                              className="p-2 text-green-600 hover:text-green-500 hover:bg-green-50 rounded-lg"
                              title={content[language].markAsPaid}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => startEditing(loan)}
                            className="p-2 text-blue-600 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                            title={content[language].edit}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(loan._id)}
                            className="p-2 text-red-600 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            title={content[language].delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Create Loan Modal */}
          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                onClick={() => setIsCreating(false)}
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.8 }}
                  className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-xl font-bold text-emerald-600 mb-4">{content[language].createTitle}</h3>
                  <form onSubmit={handleCreateSubmit} className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {content[language].loanTypeLabel}
                      </label>
                      <select
                        name="loanType"
                        value={formData.loanType}
                        onChange={handleCreateChange}
                        className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      >
                        <option value="family">{content[language].familyLoans}</option>
                        <option value="clients">{content[language].clientsLoans}</option>
                        <option value="special">{content[language].specialLoans}</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      name="personName"
                      placeholder={content[language].personNameLabel}
                      value={formData.personName}
                      onChange={handleCreateChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="text"
                      name="productName"
                      placeholder={content[language].productNameLabel}
                      value={formData.productName}
                      onChange={handleCreateChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="number"
                      name="amount"
                      placeholder={content[language].amountLabel}
                      value={formData.amount}
                      onChange={handleCreateChange}
                      step="0.01"
                      min="0"
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      required
                    />
                    <input
                      type="number"
                      name="quantity"
                      placeholder={content[language].quantityLabel}
                      value={formData.quantity}
                      onChange={handleCreateChange}
                      min="1"
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                    />
                    <textarea
                      name="description"
                      placeholder={content[language].descriptionLabel}
                      value={formData.description}
                      onChange={handleCreateChange}
                      className="w-full p-2 rounded bg-gray-50 border border-gray-300 text-gray-900"
                      rows="2"
                    />
                    <div className="flex justify-end space-x-2 mt-3">
                      <button type="button" onClick={() => setIsCreating(false)} className="px-4 py-2 bg-red-600 rounded text-white">
                        <X className="w-4 h-4 mr-1 inline" />
                        {content[language].cancel}
                      </button>
                      <button type="submit" className="px-4 py-2 bg-green-600 rounded text-white">
                        <Check className="w-4 h-4 mr-1 inline" />
                        {content[language].save}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default LoanManagement;