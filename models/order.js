import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
    },
    // --- NEW FIELDS ADDED ---
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    // ------------------------
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String },
      phone: { type: String, required: true },
    },
    orderDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    orderedItems: [
      {
        productKey: {
          // Reference to the main product key
          type: String,
          required: true,
        },
        name: {
          type: String,
          required: true,
        },
        basePrice: {
          type: Number,
          required: true,
        },
        deliveryFee: {
          type: Number,
          default: 400,
        },
        // Snapshot of the specific variant chosen
        variant: {
          vKey: {
            type: String,
            required: true,
          },
          flavor: {
            type: String,
            required: true,
          },
          variantImage: {
            type: [String],
            required: true,
          },
          qty: {
            type: Number,
            required: true,
            min: 1,
          },
        },
      },
    ],
    isApproved: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      required: true,
      default: "Pending",
      enum: ["Pending", "Approved", "Cancelled", "Rejected"],
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true, // Useful for tracking when orders were last updated
  },
);

// Check if model exists before compiling to prevent OverwriteModelError in dev
const Order = mongoose.model("orders", orderSchema);
export default Order;
