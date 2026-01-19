import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: {
    type: Date,
    default: () => new Date(),
    required: true
  },
  products: [
    {
      name: {
        type: String,
        required: true,
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
      price: {
        type: Number,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      category: {
        type: String,
      },
      quantity: {
        type: Number,
        default: 1, // Default quantity
      },
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      username : {
        type: String,
        required: true,
        ref: "User"
      },
    }
  ],
  Liability: [
    {
      name: {
        type: String,
        required: true,
      },
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Liability",
      },
      price: {
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        default: 1, // Default quantity
      },
      description: {
        type: String,
        required: true,
      }
    }
  ],
  financial : [
    {
    name : {
     type : String
    }
}]
});


const History = mongoose.model("History", historySchema);
export default History;