import mongoose from "mongoose";

const stockLedgerSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    transactionType: {
      type: String,
      enum: [
        "dispatch_in",
        "sale_out",
        "return_in",
        "return_out",
        "return_reversal",
        "adjustment",
        "received"
      ],
      required: true
    },
    quantity: {
      type: Number,
      required: true
    },
    referenceId: {
      type: String,
      default: null
    },
    referenceType: {
      type: String,
      enum: ["dispatch", "sale", "return", "adjustment", null],
      default: null
    },
    notes: {
      type: String,
      default: ""
    },
    transactionDate: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

export default mongoose.model("StockLedger", stockLedgerSchema);