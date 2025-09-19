import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    cost: {
      type: Number,
      required: true, // Cost of product
    },
    image: {
      type: String,
      default: "",
      required: true
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0, // Current stock
    },
    lowStockThreshold: {
      type: Number,
      default: 5, // Warning when stock is low
    },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;