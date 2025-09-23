import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, List, Edit, Trash2, X, Upload } from "lucide-react";
import useCategoryStore from "../../store/useCategoryStore";

const Categories = ({ language = "so" }) => {
  const {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategoryStore();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({ name: "", description: "" });
  const [formImage, setFormImage] = useState(null);
  const [formImagePreview, setFormImagePreview] = useState(null);

  const [editFormData, setEditFormData] = useState({ name: "", description: "" });
  const [editImage, setEditImage] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setFormImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleEditImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setEditImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    if (formImage) data.append("image", formImage);

    await createCategory(data);
    if (!error) {
      setFormData({ name: "", description: "" });
      setFormImage(null);
      setFormImagePreview(null);
      setIsCreating(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", editFormData.name);
    data.append("description", editFormData.description);
    if (editImage) data.append("image", editImage);

    await updateCategory(editingId, data);
    if (!error) {
      cancelEditing();
    }
  };

  const startEditing = (category) => {
    setEditingId(category._id);
    setEditFormData({ name: category.name, description: category.description || "" });
    setEditImagePreview(category.imageUrl || null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({ name: "", description: "" });
    setEditImage(null);
    setEditImagePreview(null);
  };

  const cancelCreating = () => {
    setIsCreating(false);
    setFormData({ name: "", description: "" });
    setFormImage(null);
    setFormImagePreview(null);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        language === "so"
          ? "Ma hubtaa inaad rabto inaad tirtirto qaybtan?"
          : "Are you sure you want to delete this category?"
      )
    ) {
      await deleteCategory(id);
    }
  };

  const content = {
    so: {
      title: "Qaybaha Alaabta",
      createButton: "Abuur Qayb Cusub",
      createTitle: "Abuur Qayb Cusub",
      editTitle: "Wax Ka Beddel Qaybta",
      nameLabel: "Magaca Qaybta",
      descriptionLabel: "Sharaxaad",
      imageLabel: "Sawirka",
      cancel: "Jooji",
      save: "Kaydi",
      delete: "Tirtir",
      edit: "Wax Ka Beddel",
      noCategories: "Ma jiro qaybo la keydiyay",
      loading: "Soo dejineysa qaybaha...",
      error: "Khalad ayaa dhacay",
      changeImage: "Beddel sawirka",
      uploadImage: "Soo rar sawir",
    },
    en: {
      title: "Product Categories",
      createButton: "Create New Category",
      createTitle: "Create New Category",
      editTitle: "Edit Category",
      nameLabel: "Category Name",
      descriptionLabel: "Description",
      imageLabel: "Image",
      cancel: "Cancel",
      save: "Save",
      delete: "Delete",
      edit: "Edit",
      noCategories: "No categories saved",
      loading: "Loading categories...",
      error: "An error occurred",
      changeImage: "Change image",
      uploadImage: "Upload image",
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl mr-4">
                <List className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{content[language].title}</h2>
                <p className="text-gray-400">
                  {language === "so"
                    ? "Maamul qaybaha alaabtaaga"
                    : "Manage your product categories"}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsCreating(true)}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl text-white font-medium shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {content[language].createButton}
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-xl text-red-300 flex items-center"
              >
                <X className="h-5 w-5 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Categories List */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                {language === "so" ? "Qaybaha Hadda Jira" : "Existing Categories"}
              </h3>

              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <p className="text-gray-400">{content[language].loading}</p>
                </div>
              ) : categories.length === 0 ? (
                <div className="text-center py-12 bg-gray-700/50 rounded-2xl border border-gray-600">
                  <List className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">{content[language].noCategories}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <motion.div
                      key={category._id}
                      className="bg-gradient-to-b from-gray-700/50 to-gray-800 rounded-2xl p-4 border border-gray-600 hover:border-gray-500 transition-all"
                      whileHover={{ y: -5 }}
                      layout
                    >
                      <div className="flex flex-col md:flex-row gap-4">
                        {category.imageUrl && (
                          <div className="flex-shrink-0">
                            <img
                              src={category.imageUrl}
                              alt={category.name}
                              className="w-24 h-24 object-cover rounded-xl"
                            />
                          </div>
                        )}

                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-lg font-semibold text-white mb-1">{category.name}</h4>
                              {category.description && (
                                <p className="text-gray-400 mb-2">{category.description}</p>
                              )}
                              <p className="text-sm text-gray-500">
                                {language === "so"
                                  ? `Taariikhda: ${new Date(category.createdAt).toLocaleDateString()}`
                                  : `Created: ${new Date(category.createdAt).toLocaleDateString()}`}
                              </p>
                            </div>

                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditing(category)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-xl transition-colors"
                                title={content[language].edit}
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(category._id)}
                                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-xl transition-colors"
                                title={content[language].delete}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Create Modal */}
              <AnimatePresence>
                {isCreating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">{content[language].createTitle}</h3>
                      <form onSubmit={handleCreateSubmit} className="space-y-4">
                        <div>
                          <label className="block text-gray-300 mb-1">{content[language].nameLabel}</label>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleCreateChange}
                            className="w-full p-2 rounded-xl bg-gray-700 border border-gray-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-1">{content[language].descriptionLabel}</label>
                          <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleCreateChange}
                            className="w-full p-2 rounded-xl bg-gray-700 border border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-1">{content[language].imageLabel}</label>
                          {formImagePreview && (
                            <img src={formImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mb-2" />
                          )}
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleCreateImageChange} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              id="create-image-upload"
                            />
                            <label 
                              htmlFor="create-image-upload" 
                              className="flex items-center justify-center p-3 bg-gray-700 border border-gray-600 rounded-xl cursor-pointer hover:bg-gray-600 transition-colors"
                            >
                              <Upload className="h-5 w-5 mr-2" />
                              {formImagePreview ? content[language].changeImage : content[language].uploadImage}
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelCreating}
                            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white"
                          >
                            {content[language].cancel}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                          >
                            {content[language].save}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Edit Modal */}
              <AnimatePresence>
                {editingId && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                  >
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.8 }}
                      className="bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700"
                    >
                      <h3 className="text-xl font-bold text-white mb-4">{content[language].editTitle}</h3>
                      <form onSubmit={handleEditSubmit} className="space-y-4">
                        <div>
                          <label className="block text-gray-300 mb-1">{content[language].nameLabel}</label>
                          <input
                            type="text"
                            name="name"
                            value={editFormData.name}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded-xl bg-gray-700 border border-gray-600 text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-1">{content[language].descriptionLabel}</label>
                          <textarea
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditChange}
                            className="w-full p-2 rounded-xl bg-gray-700 border border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-gray-300 mb-1">{content[language].imageLabel}</label>
                          {editImagePreview && (
                            <img src={editImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mb-2" />
                          )}
                          <div className="relative">
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={handleEditImageChange} 
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              id="edit-image-upload"
                            />
                            <label 
                              htmlFor="edit-image-upload" 
                              className="flex items-center justify-center p-3 bg-gray-700 border border-gray-600 rounded-xl cursor-pointer hover:bg-gray-600 transition-colors"
                            >
                              <Upload className="h-5 w-5 mr-2" />
                              {editImagePreview ? content[language].changeImage : content[language].uploadImage}
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white"
                          >
                            {content[language].cancel}
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white"
                          >
                            {content[language].save}
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Categories;