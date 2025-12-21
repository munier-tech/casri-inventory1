import mongoose from 'mongoose';

const purchaseSchema = new mongoose.Schema({
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    productName: String,
    quantity: Number,
    unitPrice: Number,
    total: Number
  }],
  amountDue: {
    type: Number,
    required: true,
    min: 0
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'zaad', 'edahab'],
    default: 'cash'
  },
  notes: String
}, { timestamps: true });

const vendorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  purchases: [purchaseSchema],
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalAmount: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;