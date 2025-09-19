import Category from "../models/categoryModel.js";

// ✅ Create Category
export const createCategory = async (req, res) => {
  try {
    console.log("=== CREATE CATEGORY REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request headers:", req.headers);

    const { name, description } = req.body || {};
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    
    if (!name || name.trim() === "") {
      console.log("❌ Name is required");
      return res.status(400).json({ 
        success: false,
        error: "Category name is required" 
      });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: name.trim() });
    if (existingCategory) {
      console.log("❌ Category already exists");
      return res.status(400).json({ 
        success: false,
        error: "Category with this name already exists" 
      });
    }

    const categoryData = {
      name: name.trim(),
      description: description ? description.trim() : "",
      imageUrl: imageUrl || ""
    };

    console.log("Creating category with data:", categoryData);

    const category = new Category(categoryData);
    const savedCategory = await category.save();
    
    console.log("✅ Category created successfully:", savedCategory._id);
    
    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category: savedCategory
    });
  } catch (error) {
    console.error("❌ Error creating category:", error);
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

// ✅ Update Category
export const updateCategory = async (req, res) => {
  try {
    console.log("=== UPDATE CATEGORY REQUEST ===");
    console.log("Category ID:", req.params.id);
    console.log("Update data:", req.body);
    console.log("Update file:", req.file);

    const { name, description } = req.body || {};
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    const updateData = {};
    if (name !== undefined && name.trim() !== "") {
      // Check if new name conflicts with existing category
      const existingCategory = await Category.findOne({ 
        name: name.trim(), 
        _id: { $ne: req.params.id } 
      });
      if (existingCategory) {
        return res.status(400).json({ 
          success: false,
          error: "Category with this name already exists" 
        });
      }
      updateData.name = name.trim();
    }
    if (description !== undefined) updateData.description = description.trim();
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

    console.log("Processed update data:", updateData);

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      console.log("❌ Category not found");
      return res.status(404).json({ 
        success: false,
        error: "Category not found" 
      });
    }

    console.log("✅ Category updated successfully:", category._id);
    
    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category
    });
  } catch (error) {
    console.error("❌ Error updating category:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Delete Category
export const deleteCategory = async (req, res) => {
  try {
    console.log("=== DELETE CATEGORY REQUEST ===");
    console.log("Category ID:", req.params.id);

    // Check if category is being used by any products
    const Product = (await import("../models/productModel.js")).default;
    const productsUsingCategory = await Product.countDocuments({ category: req.params.id });
    
    if (productsUsingCategory > 0) {
      console.log(`❌ Category is used by ${productsUsingCategory} products`);
      return res.status(400).json({ 
        success: false,
        error: `Cannot delete category. It is used by ${productsUsingCategory} product(s)` 
      });
    }

    const category = await Category.findByIdAndDelete(req.params.id);

    if (!category) {
      console.log("❌ Category not found");
      return res.status(404).json({ 
        success: false,
        error: "Category not found" 
      });
    }

    console.log("✅ Category deleted successfully:", category._id);
    
    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      deletedCategory: category
    });
  } catch (error) {
    console.error("❌ Error deleting category:", error);
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