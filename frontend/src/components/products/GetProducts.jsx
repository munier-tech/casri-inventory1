import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus, FiImage } from "react-icons/fi";
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
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

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
      image: null,
    });
    setImagePreview(product.image || null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUpdatedData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpdate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("name", updatedData.name);
      formData.append("cost", updatedData.cost);
      formData.append("stock", updatedData.stock);
      formData.append("lowStockThreshold", updatedData.lowStockThreshold);
      formData.append("category", updatedData.category);
      if (updatedData.image) formData.append("image", updatedData.image);

      await updateProduct(id, formData);
      toast.success("Alaabta si guul leh ayaa loo cusboonaysiiyay");
      setEditingProduct(null);
      setImagePreview(null);
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
      image: null,
    });
    setImagePreview(null);
  };

  const content = {
    title: "Liiska Alaabta",
    tableHeaders: ["Sawir", "Magac", "Qiimaha", "Kaydka", "Qaybta", "Ficilada"],
    noProducts: "Lama helin alaabo",
    edit: "Wax ka beddel",
    delete: "Tirtir",
    save: "Kaydi",
    cancel: "Jooji",
    addProduct: "Ku dar Alaab",
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
                  <FiPlus className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{content.title}</h2>
                  <p className="text-blue-100">Maamulka alaabta</p>
                </div>
              </div>
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
                {products && products.length > 0 ? (
                  products.map((product, index) => (
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
                      {/* Image */}
                      <td className="px-6 py-4">
                        {editingProduct === product._id ? (
                          <div className="flex flex-col items-start space-y-2">
                            <label className="flex items-center px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-200 transition-colors">
                              <FiImage className="w-4 h-4 mr-2" />
                              Beddel sawir
                              <input
                                type="file"
                                onChange={handleImageChange}
                                accept="image/*"
                                className="hidden"
                              />
                            </label>
                            {imagePreview && (
                              <img
                                src={imagePreview}
                                alt="preview"
                                className="h-12 w-12 object-cover rounded-lg border-2 border-blue-200 shadow-sm"
                              />
                            )}
                          </div>
                        ) : product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <FiImage className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
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
                          <span className="font-medium text-gray-800">{product.name}</span>
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
                          <span className="font-semibold text-green-600">${product.cost}</span>
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
                          <span className={`font-medium ${
                            product.stock < (product.lowStockThreshold || 5) 
                              ? "text-red-600" 
                              : "text-gray-700"
                          }`}>
                            {product.stock}
                          </span>
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={content.tableHeaders.length} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <FiImage className="w-16 h-16 mb-4 text-gray-300" />
                        <p className="text-lg font-medium">{content.noProducts}</p>
                        <p className="text-sm text-gray-400 mt-1">Ku dar alaab cusub si aad u bilowdo</p>
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