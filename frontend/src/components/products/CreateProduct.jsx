import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PlusCircle, Upload, X } from "lucide-react";
import useProductsStore from "../../store/useProductsStore";
import useCategoryStore from "../../store/useCategoryStore";

const CreateProduct = () => {
  const { createProduct, loading, error } = useProductsStore();
  const { categories, fetchCategories, loading: categoriesLoading } = useCategoryStore();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock: "",
    lowStockThreshold: "",
    category: "",
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append("name", formData.name);
    submitData.append("description", formData.description);
    submitData.append("price", formData.price);
    submitData.append("cost", formData.cost);
    submitData.append("stock", formData.stock);
    submitData.append("lowStockThreshold", formData.lowStockThreshold || 5);
    submitData.append("category", formData.category);
    if (formData.image) submitData.append("image", formData.image);

    await createProduct(submitData);

    if (!error) {
      setFormData({
        name: "",
        description: "",
        cost: "",
        stock: "",
        lowStockThreshold: "",
        category: "",
        image: null,
      });
      setImagePreview(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-700"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-700 flex items-center">
            <div className="bg-emerald-900/20 p-3 rounded-lg mr-4">
              <PlusCircle className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Abuur Alaab Cusub</h2>
              <p className="text-gray-400">Ku dar alaab cusub bakhaarkaaga</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            {error && (
              <div className="mb-6 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 mb-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Magaca Alaabta</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Geli magaca alaabta"
                />
              </div>

              

              {/* Price, Cost, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Qiimaha Hore ee Alaabtu ku Timid ($)</label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Tirada Kaydka Aad dhigayso</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

             
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Qaybta</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  disabled={categoriesLoading}
                >
                  <option value="">Dooro qayb</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sawirka Alaabta</label>
                {imagePreview ? (
                  <div className="relative inline-block">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-40 w-40 object-cover rounded-lg border border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600/50">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-400">Riix si aad u soo dejisato sawir</p>
                      <p className="text-xs text-gray-500">PNG, JPG, JPEG (Ugu Badnaan 5MB)</p>
                    </div>
                    <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                  </label>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span>Abuurista...</span>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Abuur Alaab
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateProduct;
