import cloudinary from "../lib/Cloudinary.js";
import Category from "../models/categoryModel.js";

// ✅ Create Category
import Category from "../models/categoryModel.js";
import cloudinary from "../config/cloudinary.js"; // your cloudinary config file

// ✅ Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    let imageUrl = "";

    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category name is required"
      });
    }

    // Check duplicate
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Category with this name already exists"
      });
    }

    // Upload to Cloudinary if file exists
    if (req.file) {
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories"
      });
      imageUrl = uploadResult.secure_url;
    }

    const category = new Category({
      name: name.trim(),
      description: description ? description.trim() : "",
      imageUrl
    });

    const savedCategory = await category.save();

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: savedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Update Category
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body || {};
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }

    // If new image is uploaded → delete old one from Cloudinary
    if (req.file) {
      if (category.imageUrl) {
        const publicId = category.imageUrl.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`categories/${publicId}`);
      }
      const uploadResult = await cloudinary.uploader.upload(req.file.path, {
        folder: "categories"
      });
      category.imageUrl = uploadResult.secure_url;
    }

    if (name) category.name = name.trim();
    if (description) category.description = description.trim();

    const updatedCategory = await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// ✅ Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Category not found"
      });
    }

    // ❌ Delete from Cloudinary
    if (category.imageUrl) {
      const publicId = category.imageUrl.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(`categories/${publicId}`);
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      deletedCategory: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};



// ✅ Get All Categories
export const getCategories = async (req, res) => {
  try {
    console.log("=== GET CATEGORIES REQUEST ===");
    
    const categories = await Category.find().sort({ name: 1 });
    
    console.log(`✅ Found ${categories.length} categories`);
    
    res.status(200).json({
      success: true,
      count: categories.length,
      categories
    });
  } catch (error) {
    console.error("❌ Error fetching categories:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};



// ✅ Get Category by ID
export const getCategoryById = async (req, res) => {
  try {
    console.log("=== GET CATEGORY BY ID REQUEST ===");
    console.log("Category ID:", req.params.id);

    const category = await Category.findById(req.params.id);

    if (!category) {
      console.log("❌ Category not found");
      return res.status(404).json({ 
        success: false,
        error: "Category not found" 
      });
    }

    console.log("✅ Category found:", category._id);
    
    res.status(200).json({
      success: true,
      category
    });
  } catch (error) {
    console.error("❌ Error fetching category:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};