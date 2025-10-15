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

export const createProduct = async (req, res) => {
  try {
    const body = req.body || {};

    // Accept either a single product object or an array of products
    const products = Array.isArray(body.products) ? body.products : [body];

    if (!products.length) {
      return res.status(400).json({
        success: false,
        error: "Fadlan soo dir hal ama dhowr alaab si loo abuuro.",
      });
    }

    const createdProducts = [];
    const failedProducts = [];

    for (const item of products) {
      const { name, description, cost, stock, lowStockThreshold, category } = item || {};

      // Validate required fields
      if (!name || !cost || !category) {
        failedProducts.push({
          ...item,
          reason: "Magaca, Qiimaha Alaabta, iyo Qaybta waa in la buuxiyaa",
        });
        continue;
      }

      

      const productData = {
        name: name.trim(),
        description: description ? description.trim() : "",
        cost: parseFloat(cost),
        category: category.trim(),
        stock: parseInt(stock) || 0,
        lowStockThreshold: parseInt(lowStockThreshold) || 5,
      };

      createdProducts.push(productData);
    }

    // If no valid products found
    if (createdProducts.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Ma jiro wax alaab sax ah oo la abuuri karo.",
        failedProducts,
      });
    }

    // Insert products
    const savedProducts = await Product.insertMany(createdProducts);

    res.status(201).json({
      success: true,
      message:
        savedProducts.length > 1
          ? "Alaabooyin badan si guul leh ayaa loo abuuray."
          : "Alaabta si guul leh ayaa loo abuuray.",
      createdCount: savedProducts.length,
      failedCount: failedProducts.length,
      createdProducts: savedProducts,
      failedProducts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// ✅ Get All Products
export const getProducts = async (_req, res) => {
  try {
    const products = await Product.find().populate("category", "name");
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// ✅ Update Product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, cost, stock, lowStockThreshold, category } = req.body || {};
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, error: "Alaab Lama helin" });
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
    if (stock !== undefined) product.stock = parseInt(stock);
    if (lowStockThreshold !== undefined) product.lowStockThreshold = parseInt(lowStockThreshold);
    if (category) product.category = category.trim();

    const updatedProduct = await product.save();

    res.status(200).json({
      success: true,
      message: "Alaabta si guul leh ayaa la cusbooneysiiyay",
      product: updatedProduct,
    });
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
