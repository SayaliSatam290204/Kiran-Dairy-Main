import mongoose from 'mongoose';

const dispatchSchema = new mongoose.Schema(
  {
    dispatchNo: {
      type: String,
      required: true,
      unique: true
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shop',
      required: true
    },
    // Support for batch dispatches - track multiple dispatch items in one record
    shopIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
      }
    ],
    isBatchDispatch: {
      type: Boolean,
      default: false
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
        status: {
          type: String,
          enum: ['pending', 'received', 'rejected'],
          default: 'pending'
        }
      }
    ],
    status: {
      type: String,
      enum: ['created', 'dispatched', 'received', 'pending'],
      default: 'created'
    },
    dispatchDate: {
      type: Date,
      default: Date.now
    },
    dispatchedDate: {
      type: Date,
      default: null
    },
    receivedDate: {
      type: Date,
      default: null
    },
    deliveryTime: {
      // Time taken to deliver in hours
      type: Number,
      default: null
    },
    notes: {
      type: String,
      default: ''
    },
    receivedNotes: {
      type: String,
      default: ''
    },
    confirmedBy: {
      // Staff member who confirmed receipt
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      default: null
    }
  },
  { timestamps: true }
);

export default mongoose.model('Dispatch', dispatchSchema);
