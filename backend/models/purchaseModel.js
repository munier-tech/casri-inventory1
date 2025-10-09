// models/purchaseModel.js
import mongoose from "mongoose";

const purchaseSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true },
    supplierName: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    additionalPrice: { type: Number, default: 0 },
    substractingPrice : { type : Number , default : 0},
    description: { type: String, default: "" },
    total: { type: Number, required: true },
    datePurchased: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;