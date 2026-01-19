import mongoose from "mongoose";

const LoanSchema = new mongoose.Schema({
  // Person who owes the loan
  personName: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Product that was given as loan
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  
  // Price/amount of the loan
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  
  // Optional description/notes
  description: {
    type: String,
    default: "",
    trim: true,
  },
  
  // Quantity of products (default 1)
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
  
  // When the loan was given
  loanDate: {
    type: Date,
    default: Date.now,
  },
  
  // Payment status
  isPaid: {
    type: Boolean,
    default: false,
  },
  
  // When the loan was paid back
  paidDate: {
    type: Date,
  },
  
  // User who created this loan record
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field before saving
LoanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Update the updatedAt field before updating
LoanSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
  this.set({ updatedAt: Date.now() });
  next();
});

const Loan = mongoose.model("Loan", LoanSchema);

export default Loan;