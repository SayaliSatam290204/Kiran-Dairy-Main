import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema(
  {
    billNo: {
      type: String,
      required: true,
      unique: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null
    },
    shift: {
      type: String,
      enum: ['morning', 'evening'],
      default: 'morning'
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        subtotal: {
          type: Number,
          required: true
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: true
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'cheque', 'upi', 'split'],
      default: 'cash'
    },
    paymentDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null
      // Structure:
      // For single payment: { cash: {amount}, card: {amount}, upi: {amount, provider} }
      // For split: { upi: {amount, provider}, cash: {amount}, card: {amount} }
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed'
    },
    saleDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model('Sale', saleSchema);
