// productModel.js
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    cost: {
      type: Number,
      required: [true, "Cost is required"],
      min: [0, "Cost cannot be negative"],
    },
    price: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
      min: [1, "Low stock threshold must be at least 1"],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    image: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate price if not provided
productSchema.pre("save", function (next) {
  if (!this.price && this.cost) {
    this.price = this.cost;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;