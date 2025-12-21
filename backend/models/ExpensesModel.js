import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  clientPhone: {
    type: String,
    required: [true, 'Client phone is required'],
    trim: true
  },
  amountDue: {
    type: Number,
    required: [true, 'Amount due is required'],
    min: [0, 'Amount due must be positive']
  },
  amountPaid: {
    type: Number,
    required: [true, 'Amount paid is required'],
    min: [0, 'Amount paid must be positive']
  },
  expenseType: {
    type: String,
    required: [true, 'Expense type is required'],
    enum: [
      'Rent',
      'Electricity',
      'Salaries and Wages',
      'Security / Guard',
      'Repairs and Maintenance',
      'Mobile Money',
      'Bank Charge Fees',
      'Marketing and Branding',
      'Taxes',
      'Internet',
      'Water',
      'Others'
    ]
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['Cash', 'Zaad', 'E-Dahab'],
    default: 'Cash'
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date
  },
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Fully Paid', 'Overdue'],
    default: 'Pending',
    calculated: true
  },
  balance: {
    type: Number,
    default: 0,
    calculated: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for balance calculation
expenseSchema.virtual('calculatedBalance').get(function() {
  return this.amountDue - this.amountPaid;
});

// Virtual for status calculation
expenseSchema.virtual('calculatedStatus').get(function() {
  const balance = this.amountDue - this.amountPaid;
  
  if (balance <= 0) {
    return 'Fully Paid';
  } else if (this.amountPaid > 0) {
    return 'Partially Paid';
  } else if (this.dueDate && new Date() > this.dueDate) {
    return 'Overdue';
  } else {
    return 'Pending';
  }
});

// Pre-save middleware to update balance and status
expenseSchema.pre('save', function(next) {
  this.balance = this.amountDue - this.amountPaid;
  
  if (this.balance <= 0) {
    this.status = 'Fully Paid';
  } else if (this.amountPaid > 0) {
    this.status = 'Partially Paid';
  } else if (this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  } else {
    this.status = 'Pending';
  }
  
  next();
});

// Indexes for faster queries
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, expenseType: 1 });
expenseSchema.index({ user: 1, clientName: 1 });
expenseSchema.index({ user: 1, status: 1 });
expenseSchema.index({ dueDate: 1 });

export default mongoose.model('Expense', expenseSchema);