import cloudinary from "../lib/Cloudinary.js";
import Product from "../models/productModel.js";

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT REQUEST ===");

    const { name, description, cost, stock, lowStockThreshold, category } = req.body || {};

    if (!name || !cost || !category) {
      return res.status(400).json({
        success: false,
        error: "Name, cost, and category are required",
      });
    }

    // ✅ Upload image to Cloudinary
    let imageUrl = "";
    if (req.file?.path) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      imageUrl = result.secure_url;
    }

    const productData = {
      name: name.trim(),
      description: description ? description.trim() : "",
      cost: parseFloat(cost),
      image: imageUrl,
      category: category.trim(),
      stock: parseInt(stock) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct,
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// ✅ Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, cost, stock, lowStockThreshold, category } = req.body || {};

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(lowStockThreshold);
    if (category !== undefined) updateData.category = category.trim();

    // ✅ Upload new image if provided
    if (req.file?.path) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "products",
      });
      updateData.image = result.secure_url;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct: product,
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");

    if (!product) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Low Stock Products
export const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    }).populate("category", "name");

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("❌ Error fetching low stock products:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
