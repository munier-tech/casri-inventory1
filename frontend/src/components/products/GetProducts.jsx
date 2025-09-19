import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2, FiCheck, FiX, FiPlus } from "react-icons/fi";
import { toast } from "react-hot-toast";
import { motion } from "framer-motion";
import useProductsStore from "../../store/useProductsStore";
import useCategoryStore from "../../store/useCategoryStore";

const API_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : ""; 

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
        toast.success("Alaabta waa  tirtiray");
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
    setImagePreview(product.image ? `${API_URL}${product.image}` : null);
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
    tableHeaders: ["Sawir", "Magac", "Qiimaha Saxda ah", "Tirada kaydka", "Qaybta", "Ficilada"],
    noProducts: "Lama helin alaabo",
    edit: "Wax ka beddel",
    delete: "Tirtir",
    save: "Kaydi",
    cancel: "Jooji",
    addProduct: "Ku dar Alaab",
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-emerald-900/20 p-3 rounded-lg mr-4">
                <FiPlus className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{content.title}</h2>
                <p className="text-gray-400">Maamulka alaabta</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium"
              onClick={() => (window.location.href = "/createProduct")}
            >
              <FiPlus className="w-5 h-5 mr-2" />
              {content.addProduct}
            </motion.button>
          </div>

          {/* Products Table */}
          <div className="p-6 overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-700 text-left">
                  {content.tableHeaders.map((header, index) => (
                    <th key={index} className="px-4 py-3 text-emerald-300 font-semibold">
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
                      className={`border-b border-gray-700 ${
                        index % 2 === 0 ? "bg-gray-800" : "bg-gray-800/50"
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      {/* Image */}
                      <td className="px-4 py-3">
                        {editingProduct === product._id ? (
                          <div className="flex flex-col">
                            <input
                              type="file"
                              onChange={handleImageChange}
                              accept="image/*"
                              className="mb-2 text-sm text-gray-300"
                            />
                            {imagePreview && (
                              <img
                                src={imagePreview.startsWith("http") ? imagePreview : `${API_URL}${imagePreview}`}
                                alt="preview"
                                className="h-12 w-12 object-cover rounded mt-2"
                              />
                            )}
                          </div>
                        ) : product.image ? (
                          <img
                            src={`${API_URL}${product.image}`}
                            alt={product.name}
                            className="h-12 w-12 object-cover rounded"
                          />
                        ) : (
                          <span className="text-gray-400">--</span>
                        )}
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        {editingProduct === product._id ? (
                          <input
                            type="text"
                            value={updatedData.name}
                            onChange={(e) =>
                              setUpdatedData({ ...updatedData, name: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        ) : (
                          <span className="text-white">{product.name}</span>
                        )}
                      </td>

                      

                      {/* Cost */}
                      <td className="px-4 py-3">
                        {editingProduct === product._id ? (
                          <input
                            type="number"
                            value={updatedData.cost}
                            onChange={(e) =>
                              setUpdatedData({ ...updatedData, cost: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        ) : (
                          <span className="text-yellow-400">${product.cost}</span>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3">
                        {editingProduct === product._id ? (
                          <input
                            type="number"
                            value={updatedData.stock}
                            onChange={(e) =>
                              setUpdatedData({ ...updatedData, stock: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        ) : (
                          <span className="text-gray-300">{product.stock}</span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        {editingProduct === product._id ? (
                          <select
                            value={updatedData.category}
                            onChange={(e) =>
                              setUpdatedData({ ...updatedData, category: e.target.value })
                            }
                            className="w-full px-2 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white"
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
                          <span className="text-gray-300">{product.category?.name || "Qayb la'aan"}</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {editingProduct === product._id ? (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleUpdate(product._id)}
                                className="p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg text-white"
                                title={content.save}
                              >
                                <FiCheck />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={handleCancel}
                                className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                                title={content.cancel}
                              >
                                <FiX />
                              </motion.button>
                            </>
                          ) : (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleEdit(product)}
                                className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-white"
                                title={content.edit}
                              >
                                <FiEdit2 />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleDelete(product._id)}
                                className="p-2 bg-red-700 hover:bg-red-600 rounded-lg text-white"
                                title={content.delete}
                              >
                                <FiTrash2 />
                              </motion.button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={content.tableHeaders.length}
                      className="px-4 py-8 text-center text-gray-400"
                    >
                      {content.noProducts}
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
