import Product from "../models/productModel.js";

// ✅ Create Product
export const createProduct = async (req, res) => {
  try {
    console.log("=== CREATE PRODUCT REQUEST ===");
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    console.log("Request headers:", req.headers);

    const { name, description, cost, stock, lowStockThreshold, category } = req.body || {};
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : "";
    
    // Validate required fields
    if (!name || !cost || !category) {
      console.log("❌ Missing required fields");
      return res.status(400).json({ 
        success: false,
        error: "Name, cost, and category are required",
        received: { name: !!name, cost: !!cost, category: !!category }
      });
    }

    // Create product object
    const productData = {
      name: name.trim(),
      description: description ? description.trim() : "",
      cost: parseFloat(cost),
      image: imageUrl,
      category: category.trim(),
      stock: parseInt(stock) || 0,
      lowStockThreshold: parseInt(lowStockThreshold) || 5,
    };

    console.log("Creating product with data:", productData);

    const product = new Product(productData);
    const savedProduct = await product.save();
    
    console.log("✅ Product created successfully:", savedProduct._id);
    
    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product: savedProduct
    });
  } catch (error) {
    console.error("❌ Error creating product:", error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// ✅ Get All Products
export const getProducts = async (req, res) => {
  try {
    console.log("=== GET PRODUCTS REQUEST ===");
    
    const products = await Product.find().populate("category", "name");
    
    console.log(`✅ Found ${products.length} products`);
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    console.log("=== UPDATE PRODUCT REQUEST ===");
    console.log("Product ID:", req.params.id);
    console.log("Update data:", req.body);
    console.log("Update file:", req.file);

    const { name, description, cost, stock, lowStockThreshold, category } = req.body || {};
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description.trim();
    if (cost !== undefined) updateData.cost = parseFloat(cost);
    if (stock !== undefined) updateData.stock = parseInt(stock);
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = parseInt(lowStockThreshold);
    if (category !== undefined) updateData.category = category.trim();
    if (imageUrl !== undefined) updateData.image = imageUrl;

    console.log("Processed update data:", updateData);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!product) {
      console.log("❌ Product not found");
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }

    console.log("✅ Product updated successfully:", product._id);
    
    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    console.log("=== DELETE PRODUCT REQUEST ===");
    console.log("Product ID:", req.params.id);

    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      console.log("❌ Product not found");
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }

    console.log("✅ Product deleted successfully:", product._id);
    
    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      deletedProduct: product
    });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Get Product by ID
export const getProductById = async (req, res) => {
  try {
    console.log("=== GET PRODUCT BY ID REQUEST ===");
    console.log("Product ID:", req.params.id);

    const product = await Product.findById(req.params.id).populate("category", "name");

    if (!product) {
      console.log("❌ Product not found");
      return res.status(404).json({ 
        success: false,
        error: "Product not found" 
      });
    }

    console.log("✅ Product found:", product._id);
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// ✅ Get Low Stock Products
export const getLowStockProducts = async (req, res) => {
  try {
    console.log("=== GET LOW STOCK PRODUCTS REQUEST ===");
    
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] }
    }).populate("category", "name");

    console.log(`✅ Found ${products.length} low stock products`);
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error("❌ Error fetching low stock products:", error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};