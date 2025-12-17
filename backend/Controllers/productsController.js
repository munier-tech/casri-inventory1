import cloudinary from "../lib/Cloudinary.js";
import Product from "../models/productModel.js";

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

// productController.js - Update the validation message

export const createProduct = async (req, res) => {
  try {
    const body = req.body || {};

    // Accept either a single product object or an array of products
    const products = Array.isArray(body.products) ? body.products : [body];

    if (!products.length) {
      return res.status(400).json({
        success: false,
        error: "Please send at least one product to create.",
      });
    }

    const createdProducts = [];
    const failedProducts = [];

    for (const item of products) {
      const { name, description, cost, stock, lowStockThreshold, price, expiryDate } = item || {};

      // Validate required fields - only name and cost are required
      if (!name || !cost) {
        failedProducts.push({
          ...item,
          reason: "Product name and cost are required",
        });
        continue;
      }

      const productData = {
        name: name.trim(),
        description: description ? description.trim() : "",
        cost: parseFloat(cost),
        price: price ? parseFloat(price) : parseFloat(cost), // Use price if provided, otherwise use cost
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
        expiryDate: expiryDate || null,
      };

      createdProducts.push(productData);
    }

    // If no valid products found
    if (createdProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid products found to create.",
        failedProducts,
      });
    }

    // Insert products
    const savedProducts = await Product.insertMany(createdProducts);

    res.status(201).json({
      success: true,
      message:
        savedProducts.length > 1
          ? "Products created successfully."
          : "Product created successfully.",
      createdCount: savedProducts.length,
      failedCount: failedProducts.length,
      createdProducts: savedProducts,
      failedProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Also update the updateProduct function:
export const updateProduct = async (req, res) => {
  try {
    const { name, description, cost, stock, lowStockThreshold, price, expiryDate } = req.body || {};
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: "Product not found" });
    }

    // Handle new image upload
    if (req.file) {
      if (product.image) {
        const publicId = product.image.split("/").slice(-1)[0].split(".")[0];
        await cloudinary.uploader.destroy(`products/${publicId}`);
      }

      let uploadResult;
      if (req.file.buffer) {
        uploadResult = await uploadBufferToCloudinary(req.file.buffer, "products");
      } else {
        uploadResult = await cloudinary.uploader.upload(req.file.path, { folder: "products" });
      }
      product.image = uploadResult.secure_url;
    }

    if (name) product.name = name.trim();
    if (description) product.description = description.trim();
    if (cost !== undefined) product.cost = parseFloat(cost);
    if (price !== undefined) product.price = parseFloat(price);
    if (stock !== undefined) product.stock = parseInt(stock);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = parseInt(lowStockThreshold);
    if (expiryDate !== undefined) product.expiryDate = expiryDate;

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Get All Products
export const getProducts = async (_req, res) => {
  try {
    const products = await Product.find().populate("name");
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};



// ✅ Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: "Alaab Lama helin" });
    }

    if (product.image) {
      const publicId = product.image.split("/").slice(-1)[0].split(".")[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "ALaabta si guul leh ayaa la tirtiray",
      deletedProduct: product,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category", "name");
    if (!product) {
      return res.status(404).json({ success: false, error: "Alaab Lama helin" });
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Get Low Stock Products
export const getLowStockProducts = async (_req, res) => {
  try {
    const products = await Product.find({
      $expr: { $lte: ["$stock", "$lowStockThreshold"] },
    }).populate("category", "name");

    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
