import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiShoppingCart, FiPlus, FiMinus, FiX, FiRefreshCw, FiSearch, FiArrowLeft, 
  FiCalendar, FiClock, FiDollarSign, FiPackage, FiTag, FiBarChart2
} from "react-icons/fi";
import { AlertTriangle, XCircle } from "lucide-react";
import useProductsStore from "../store/useProductsStore";
import useCategoryStore from "../store/useCategoryStore";
import useSalesStore from "../store/UseSalesStore";


const CreateSale = () => {
  const { products = [], fetchProducts } = useProductsStore();
  const { categories = [], fetchCategories } = useCategoryStore();
  const { createSale, createSaleByDate, dailySales, fetchDailySales } = useSalesStore();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellingCost, setSellingCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [view, setView] = useState("categories");
  const [activeTab, setActiveTab] = useState("today");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);

  const categoryColors = [
    "from-blue-500 to-purple-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-600",
    "from-teal-500 to-cyan-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500"
  ];

  const stockStatusColors = {
    high: "text-green-600 bg-green-50 border-green-200",
    low: "text-amber-600 bg-amber-50 border-amber-200",
    out: "text-red-600 bg-red-50 border-red-200"
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchDailySales();
  }, [fetchProducts, fetchCategories, fetchDailySales]);

  useEffect(() => {
    if (selectedCategory) {
      let filtered = products.filter((p) => p.category?._id === selectedCategory);

      if (searchTerm) {
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      setFilteredProducts(filtered);
    } else {
      setFilteredProducts([]);
    }
    setSelectedProduct(null);
    setQuantity(1);
  }, [selectedCategory, products, searchTerm]);

  useEffect(() => {
    if (selectedProduct) {
      setQuantity(1);
      setSellingCost(selectedProduct.cost || 0);
    }
  }, [selectedProduct]);

  const handleSubmit = async () => {
    if (!selectedProduct) return toast.error("Fadlan dooro alaab");
    if (quantity < 1) return toast.error("Tirada waa inay ka weyn tahay 0");
    if (quantity > selectedProduct.stock) return toast.error("Tirada alaabta way ka dhamaatay kaydka");

    setIsSubmitting(true);
    try {
      if (activeTab === "today") {
        await createSale({
          productId: selectedProduct._id,
          quantity,
          sellingCost,
        });
      } else {
        await createSaleByDate({
          productId: selectedProduct._id,
          quantity,
          sellingCost,
          saleDate,
        });
      }
      
      toast.success("Iibka si guul leh ayaa loo abuuray");
      await fetchProducts();
      await fetchDailySales();
      setSelectedProduct(null);
      setQuantity(1);
      setSellingCost(0);
      setSearchTerm("");
    } catch (error) {
      toast.error(error?.response?.data?.error || "Khalad ayaa dhacay");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { status: "out", text: "Dhamaatay", icon: XCircle };
    if (stock <= 5) return { status: "low", text: `Sii Dhamaanaya (${stock})`, icon: AlertTriangle };
    return { status: "high", text: `Kaydka: ${stock}`, icon: FiPackage };
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category._id);
    setView("products");
    setSearchTerm("");
  };

  const handleBackToCategories = () => {
    setView("categories");
    setSelectedCategory("");
    setSelectedProduct(null);
    setSearchTerm("");
    setCategorySearchTerm("");
  };

  const incrementQuantity = () => {
    if (selectedProduct && quantity < selectedProduct.stock) setQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const refreshProducts = async () => {
    try {
      await fetchProducts();
      await fetchDailySales();
      toast.success("Alaabta si guul leh ayaa loo cusboonaysiiyay");
    } catch (error) {
      toast.error("Khalad ayaa dhacay marka la cusboonaysiinayo alaabta");
    }
  };

  const getCategoryColor = (index) => {
    return categoryColors[index % categoryColors.length];
  };

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  const renderCategoriesView = () => (
    <div>
      <div className="relative w-full md:w-80 mb-8">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Raadi qaybo..."
          value={categorySearchTerm}
          onChange={(e) => setCategorySearchTerm(e.target.value)}
          className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
        />
        {categorySearchTerm && (
          <button
            onClick={() => setCategorySearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      <motion.div
        className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat, index) => {
            const productCount = products.filter(p => p.category?._id === cat._id).length;
            return (
              <motion.div
                key={cat._id}
                className="relative cursor-pointer rounded-2xl overflow-hidden shadow-lg group bg-white border border-gray-100 hover:border-blue-200 transition-all duration-300"
                onClick={() => handleCategoryClick(cat)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className={`h-32 w-full bg-gradient-to-br ${getCategoryColor(index)} flex items-center justify-center`}>
                  <FiPackage className="h-12 w-12 text-white opacity-90" />
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{cat.name}</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                      {productCount} alaab{productCount !== 1 ? 's' : ''}
                    </span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border border-gray-200">
            <FiPackage className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {categorySearchTerm ? `Qaybo lama helin "${categorySearchTerm}"` : "Qaybo lama helin"}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );

  const renderProductsView = () => {
    const currentCategory = categories.find((c) => c._id === selectedCategory);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <div className="flex items-center mb-6">
          <motion.button
            onClick={handleBackToCategories}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center p-2 mr-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
          >
            <FiArrowLeft className="h-5 w-5 text-gray-600" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {currentCategory?.name || "Alaabooyinka"} - Alaabooyinka
            </h2>
            <p className="text-gray-600">
              {filteredProducts.length} alaab ee la helay
              {searchTerm && ` oo ku jira "${searchTerm}"`}
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80 mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Raadi alaab..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
            <FiSearch className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm ? `Wax alaab ah lagama helin "${searchTerm}"` : "Alaab lagama helin qaybtaan."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-white border border-gray-300 hover:border-gray-400 rounded-xl text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Ka saar baaritaanka
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => {
              const stockInfo = getStockStatus(product.stock);
              const IconComponent = stockInfo.icon;
              
              return (
                <motion.div
                  key={product._id}
                  className={`bg-white rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-lg border border-gray-100 hover:shadow-xl ${
                    selectedProduct?._id === product._id
                      ? "ring-2 ring-blue-400 transform scale-105 border-blue-200"
                      : "hover:border-blue-200"
                  }`}
                  onClick={() => setSelectedProduct(product)}
                  whileHover={{ y: -5 }}
                  layoutId={`product-${product._id}`}
                >
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <FiPackage className="h-5 w-5 text-white" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${stockStatusColors[stockInfo.status]}`}>
                        <IconComponent className="h-3 w-3 inline mr-1" />
                        {stockInfo.text}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-blue-600 flex items-center">
                        <FiDollarSign className="h-4 w-4 mr-1" />
                        {product.cost}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50">
                    <div className="flex justify-between items-center text-sm text-gray-600">
                      <span>Qiimaha:</span>
                      <span className="font-medium">${product.cost}</span>
                    </div>
                    {product.stock > 0 && (
                      <div className="mt-2 bg-white rounded-lg p-2 border border-gray-200">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Kaydka hada:</span>
                          <span>{product.stock} Xabo</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              product.stock > 10 ? 'bg-green-500' : 
                              product.stock > 5 ? 'bg-amber-500' : 'bg-red-500'
                            }`}
                            style={{ 
                              width: `${Math.min(100, (product.stock / Math.max(product.stock, 20)) * 100)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    );
  };

  const renderDateSelector = () => (
    <div className="mb-6 bg-blue-50 p-4 rounded-xl border border-blue-200">
      <label className="block text-gray-700 mb-2 font-medium flex items-center">
        <FiCalendar className="inline mr-2 text-blue-500" />
        Taariikhda Iibka
      </label>
      <input
        type="date"
        value={saleDate}
        onChange={(e) => setSaleDate(e.target.value)}
        className="w-full p-3 bg-white border border-gray-300 rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      <p className="text-gray-600 text-sm mt-2">
        Dooro taariikhda aad rabto inaad iibka ku keydiso
      </p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-3 rounded-xl shadow-lg">
              <FiShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Iibi Alaab Cusub
              </h1>
              <p className="text-gray-600">Dooro qaybta oo iibi alaabta</p>
            </div>
          </motion.div>

          <motion.button
            onClick={refreshProducts}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl text-white font-medium shadow-lg transition-all duration-300"
            title="Cusboonaysii alaabta"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Cusboonaysii
          </motion.button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Wadarta Alaabta</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FiPackage className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Wadarta Qaybaha</p>
                <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <FiTag className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Iibka Maanta</p>
                <p className="text-2xl font-bold text-gray-900">{dailySales?.length || 0}</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-xl">
                <FiBarChart2 className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
          <button
            onClick={() => setActiveTab("today")}
            className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all ${
              activeTab === "today"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <FiClock className="inline mr-2" />
            Iibka Maanta
          </button>
          <button
            onClick={() => setActiveTab("date")}
            className={`flex-1 py-3 px-4 rounded-xl text-center font-medium transition-all ${
              activeTab === "date"
                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <FiCalendar className="inline mr-2" />
            Iibka Taariikhda
          </button>
        </div>

        {/* Date Selector for Date Tab */}
        {activeTab === "date" && renderDateSelector()}

        {view === "categories" ? renderCategoriesView() : renderProductsView()}

        {/* Selected Product Panel */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-2xl"
            >
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <FiPackage className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-blue-600 font-medium">Qiimaha: $</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={sellingCost}
                        onChange={(e) => setSellingCost(parseFloat(e.target.value) || 0)}
                        className="w-24 p-2 rounded-lg bg-gray-50 border border-gray-300 text-gray-800 focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-gray-600 text-sm">Kaydka hada:</span>
                      <span className={`text-sm font-medium ${
                        selectedProduct.stock === 0 ? 'text-red-600' : 
                        selectedProduct.stock <= 5 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {selectedProduct.stock}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-xl border border-gray-300">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
                    >
                      <FiMinus />
                    </button>
                    <span className="px-4 py-2 text-lg font-medium text-gray-900">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= selectedProduct.stock}
                      className="p-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="text-center min-w-[120px]">
                    <p className="text-lg font-bold text-blue-600">
                      ${(sellingCost * quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Wadarta</p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || quantity > selectedProduct.stock || quantity < 1}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl font-semibold text-white flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300"
                  >
                    {isSubmitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    ) : (
                      <>
                        <FiShoppingCart className="mr-2" />
                        iibi Alaabta
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CreateSale;