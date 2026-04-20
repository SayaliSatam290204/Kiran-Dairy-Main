import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      required: true,
      unique: true
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      default: null // Optional - for inventory returns without sales
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
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
        reason: {
          type: String,
          enum: ['damaged', 'expired', 'excess'], // Specific reasons for inventory returns
          required: true
        }
      }
    ],
    totalRefund: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    rejectionReason: {
      type: String,
      default: null // Store reason if admin rejects
    },
    returnDate: {
      type: Date,
      default: Date.now
    },
    approvedDate: {
      type: Date,
      default: null
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('Return', returnSchema);
