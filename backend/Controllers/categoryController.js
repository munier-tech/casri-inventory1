import cloudinary from "../lib/Cloudinary.js";
import Category from "../models/categoryModel.js";

// helper for buffer uploads (Vercel/Netlify)
const uploadBufferToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(fileBuffer);
  });
};

// ✅ Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    let imageUrl = "";

    if (!name || name.trim() === "") {
      return res.status(400).json({ success: false, error: "Category name is required" });
    }

    // Check duplicate
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({ success: false, error: "Category with this name already exists" });
    }

    // Upload to Cloudinary if file exists
    if (req.file) {
      let uploadResult;
      if (req.file.buffer) {
        // Vercel/Netlify (memoryStorage)
        uploadResult = await uploadBufferToCloudinary(req.file.buffer, "categories");
      } else {
        // Local dev (diskStorage)
        uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "categories" });
      }
      imageUrl = uploadResult.secure_url;
    }

    const category = new Category({
      name: name.trim(),
      description: description ? description.trim() : "",
      imageUrl,
    });

    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: savedCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    // If new image is uploaded → delete old one and upload new
    if (req.file) {
      if (category.imageUrl) {
        const publicId = category.imageUrl.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      }

      let uploadResult;
      if (req.file.buffer) {
        uploadResult = await uploadBufferToCloudinary(req.file.buffer, "categories");
      } else {
        uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "categories" });
      }
      category.imageUrl = uploadResult.secure_url;
    }

    if (name) category.name = name.trim();
    if (description) category.description = description.trim();

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    // Delete from Cloudinary
    if (category.imageUrl) {
      const publicId = category.imageUrl.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(`categories/${publicId}`);
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      deletedCategory: category,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get All Categories
export const getCategories = async (_req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.status(200).json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
