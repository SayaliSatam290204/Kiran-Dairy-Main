import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null
    },

    phone: {
      type: String,
      sparse: true,
      trim: true,
      default: null
    },

    // ✅ Shop username (not used in current implementation)
    username: {
      type: String,
      sparse: true,
      trim: true,
      default: null
    },

    password: {
      type: String,
      required: true,
      select: false
    },

    role: {
      type: String,
      enum: ["super-admin", "admin", "shop"],
      default: "shop"
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);