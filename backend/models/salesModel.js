import mongoose from "mongoose";

const saleSchema = new mongoose.Schema({
  saleNumber: {
    type: String,
    required: true,
    unique: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    sellingPrice: {
      type: Number,
      required: true,
      min: 0
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    itemTotal: {
      type: Number,
      required: true
    },
    itemDiscount: {
      type: Number,
      default: 0
    },
    itemNet: {
      type: Number,
      required: true
    }
  }],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
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
  remainingBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'zaad', 'edahab', 'credit'],
    default: 'cash'
  },
  changeAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalQuantity: {
    type: Number,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  customerName: {
    type: String,
    trim: true
  },
  customerPhone: {
    type: String,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'partially_paid', 'completed', 'cancelled', 'refunded', 'overdue'],
    default: 'pending'
  },
  paymentHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'zaad', 'edahab']
    },
    collectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    notes: {
      type: String
    }
  }],
  dueDate: {
    type: Date
  },
  hasDebt: {
    type: Boolean,
    default: false
  },
  debtRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Debt"
  }
}, {
  timestamps: true
});

// FIXED: Use amountDue instead of grandTotal
saleSchema.virtual('isPaidInFull').get(function() {
  return this.amountPaid >= this.amountDue; // CHANGED: grandTotal → amountDue
});

// FIXED: Use amountDue instead of grandTotal
saleSchema.virtual('calculatedBalance').get(function() {
  return Math.max(0, this.amountDue - this.amountPaid); // CHANGED: grandTotal → amountDue
});

// FIXED: Use amountDue instead of grandTotal
saleSchema.pre('save', function(next) {
  // Calculate remaining balance
  this.remainingBalance = Math.max(0, this.amountDue - this.amountPaid); // CHANGED: grandTotal → amountDue
  
  // Update status based on payment - COMPARE WITH amountDue, NOT grandTotal
  if (this.amountPaid >= this.amountDue) { // CHANGED: grandTotal → amountDue
    this.status = 'completed';
    this.hasDebt = false;
  } else if (this.amountPaid > 0) {
    this.status = 'partially_paid';
    this.hasDebt = true;
  } else {
    this.status = 'pending';
    this.hasDebt = true;
  }
  
  // Check if overdue
  if (this.dueDate && new Date() > this.dueDate && this.remainingBalance > 0) {
    this.status = 'overdue';
  }
  
  next();
});

const Sale = mongoose.model("Sale", saleSchema);
export default Sale;