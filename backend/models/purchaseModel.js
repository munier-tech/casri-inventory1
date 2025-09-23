import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
    },
    supplierName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // who recorded this purchase
      required: true,
    },
    datePurchased: {
      type: Date,
      default: Date.now, // auto-generated
    },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);

export default Purchase;
