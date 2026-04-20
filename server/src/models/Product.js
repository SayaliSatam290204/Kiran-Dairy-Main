
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    subcategory: {
      type: String,
      default: "",
      trim: true,
      // Examples: "Toned Milk", "Full Cream Milk", "Curd", "Yogurt", "Butter", "Ghee", etc.
    },

    // ✅ Product image (uploaded via Multer or external URL)
    image: {
      type: String,
      default: "",
      trim: true,
      // Stores: "/uploads/products/filename.jpg" or image URL
    },

    // Keeping imageUrl for backward compatibility
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },

    // ✅ OPTIONAL: Multiple images (future use)
    images: {
      type: [String],
      default: [],
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Helpful index (optional) for faster search by name/category
productSchema.index({ name: 1, category: 1 });

export default mongoose.model("Product", productSchema);

