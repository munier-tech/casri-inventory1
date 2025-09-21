import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

import { 
  FiShoppingCart, FiPlus, FiMinus, FiX, FiRefreshCw, FiSearch, FiArrowLeft 
} from "react-icons/fi";
import { AlertTriangle, XCircle, Zap } from "lucide-react";
import useProductsStore from "../store/useProductsStore";
import useCategoryStore from "../store/useCategoryStore";
import useSalesStore from "../store/UseSalesStore";

const CreateSale = () => {
  const { products = [], fetchProducts } = useProductsStore();
  const { categories = [], fetchCategories } = useCategoryStore();
  const { createSale } = useSalesStore();

  const [selectedCategory, setSelectedCategory] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sellingCost, setSellingCost] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categorySearchTerm, setCategorySearchTerm] = useState("");
  const [view, setView] = useState("categories"); // 'categories' or 'products'

  const categoryColors = [
    "from-purple-600 to-blue-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-indigo-500 to-blue-600",
    "from-teal-500 to-cyan-500",
    "from-yellow-500 to-orange-500",
    "from-red-500 to-pink-500"
  ];

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

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
    if (quantity > selectedProduct.stock) return toast.error("Tirada weyn tahay kaydka lahayn");

    setIsSubmitting(true);
    try {
      await createSale({
        productId: selectedProduct._id,
        quantity,
        sellingCost,
      });
      toast.success("Iibka si guul leh ayaa loo abuuray");
      await fetchProducts();
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

  // Fixed Cloudinary support
  const getImageUrl = (url) => (url ? url : "/placeholder.png");

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
      <div className="relative w-full md:w-64 mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Raadi qaybo..."
          value={categorySearchTerm}
          onChange={(e) => setCategorySearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
        {categorySearchTerm && (
          <button
            onClick={() => setCategorySearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FiX className="h-4 w-4 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      <motion.div
        className="mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
                className="relative cursor-pointer rounded-2xl overflow-hidden shadow-xl group"
                onClick={() => handleCategoryClick(cat)}
                whileHover={{ scale: 1.03, y: -5 }}
                whileTap={{ scale: 0.97 }}
              >
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={getImageUrl(cat.imageUrl)}
                    alt={cat.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <h3 className="text-xl font-bold mb-1">{cat.name}</h3>
                    <p className="text-sm opacity-90">
                      {productCount} alaab{productCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Guji
                  </div>
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-center text-gray-400 col-span-full">
            {categorySearchTerm ? `Qaybo lama helin "${categorySearchTerm}"` : "Qaybo lama helin"}
          </p>
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
        className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700"
      >
        <div className="flex items-center mb-6">
          <motion.button
            onClick={handleBackToCategories}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center justify-center p-2 mr-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </motion.button>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
              {currentCategory?.name || "Alaabooyinka"} - Alaabooyinka
            </h2>
            <p className="text-gray-400">
              {filteredProducts.length} alaab ee la helay
              {searchTerm && ` oo ku jira "${searchTerm}"`}
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-64 mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Raadi alaab..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="h-4 w-4 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 bg-gray-700 rounded-xl">
            <FiSearch className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">
              {searchTerm ? `Wax alaab ah lagama helin "${searchTerm}"` : "Alaab lagama helin qaybtaan."}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mt-4 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl text-sm"
              >
                Ka saar baaritaanka
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map((product) => (
              <motion.div
                key={product._id}
                className={`bg-gradient-to-b from-gray-800 to-gray-700 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 shadow-lg ${
                  selectedProduct?._id === product._id
                    ? "ring-2 ring-emerald-400 transform scale-105"
                    : "hover:bg-gray-700 hover:shadow-xl"
                }`}
                onClick={() => setSelectedProduct(product)}
                whileHover={{ y: -5 }}
                layoutId={`product-${product._id}`}
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h2 className="text-lg font-semibold text-white truncate">{product.name}</h2>
                  </div>
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center flex-col p-4">
                      <XCircle className="h-8 w-8 text-white mb-2" />
                      <span className="text-white font-bold text-lg text-center">Dhamaatay</span>
                    </div>
                  )}
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-emerald-300 font-medium mb-1">${product.cost}</p>
                    <p className="text-gray-400 text-sm">Kaydka: {product.stock}</p>
                  </div>
                  {product.stock > 0 && product.stock <= 5 && (
                    <div className="flex items-center gap-2 bg-amber-900/30 border border-amber-700 rounded-lg px-3 py-2">
                      <AlertTriangle className="h-4 w-4 text-amber-400 flex-shrink-0" />
                      <p className="text-amber-400 text-xs font-medium">sii Dhamaanaya</p>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-3 rounded-xl">
              <FiShoppingCart className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Iibi Alaab Cusub
              </h1>
              <p className="text-gray-400">Dooro qaybta oo iibi alaabta</p>
            </div>
          </motion.div>

          <motion.button
            onClick={refreshProducts}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-white font-medium shadow-lg"
            title="Cusboonaysii alaabta"
          >
            <FiRefreshCw className="w-5 h-5 mr-2" />
            Cusboonaysii
          </motion.button>
        </div>

        {view === "categories" ? renderCategoriesView() : renderProductsView()}

        {/* Selected Product Panel */}
        <AnimatePresence>
          {selectedProduct && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 p-6 shadow-2xl"
            >
              <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={getImageUrl(selectedProduct.image)}
                      alt={selectedProduct.name}
                      className="h-16 w-16 object-cover rounded-xl border-2 border-emerald-400"
                    />
                    {selectedProduct.stock <= 5 && (
                      <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
                        <Zap className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedProduct.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-emerald-300">Qiimaha: $</span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={sellingCost}
                        onChange={(e) => setSellingCost(parseFloat(e.target.value) || 0)}
                        className="w-24 p-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <p className="text-gray-400 text-sm mt-1">Kaydka hada: {selectedProduct.stock}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center bg-gray-700 rounded-xl border border-gray-600">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <FiMinus />
                    </button>
                    <span className="px-4 py-2 text-lg font-medium text-white">{quantity}</span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= selectedProduct.stock}
                      className="p-2 text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <FiPlus />
                    </button>
                  </div>

                  <div className="text-center min-w-[120px]">
                    <p className="text-lg font-bold text-emerald-400">
                      ${(sellingCost * quantity).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">Wadarta</p>
                  </div>

                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || quantity > selectedProduct.stock || quantity < 1}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300"
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
