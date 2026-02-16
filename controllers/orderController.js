import Order from "../models/order.js";
import Product from "../models/product.js";
import User from "../models/user.js"
import { isItAdmin, isItCustomer } from "./userController.js";

export async function createOrder(req, res) {
  try {
    const data = req.body;

    // 1. Authentication Check
    if (!req.user) {
      return res.status(401).json({ message: "Please log in to place an order" });
    }

    // 2. Fetch User for Default fallback
    const userProfile = await User.findOne({ email: req.user.email });
    if (!userProfile) {
        return res.status(404).json({ message: "User profile not found" });
    }

    // 3. Logic: Manual Input OR Default Fallback
    // If frontend sends an address, use it. Otherwise, use userProfile defaults.
    const finalShippingAddress = {
      address: data.shippingAddress?.address || userProfile.address.address,
      city: data.shippingAddress?.city || userProfile.address.city,
      postalCode: data.shippingAddress?.postalCode || userProfile.address.postalCode,
      phone: data.shippingAddress?.phone || userProfile.phone
    };

    // Validate we have a result
    if (!finalShippingAddress.address || !finalShippingAddress.phone) {
        return res.status(400).json({ message: "Shipping address and phone are required." });
    }

    const orderInfo = { 
        orderId: "", // Will be set in step 4
        email: req.user.email,
        orderedItems: [], 
        totalAmount: 0,
        shippingAddress: finalShippingAddress 
    };

    // 4. Generate Sequential Order ID
    const lastOrder = await Order.findOne().sort({ orderDate: -1 });
    let nextId = 1;
    if (lastOrder && lastOrder.orderId) {
      nextId = parseInt(lastOrder.orderId.replace("ORD", "")) + 1;
    }
    orderInfo.orderId = "ORD" + String(nextId).padStart(4, '0');

    // 5. Process Items & Snapshot Data
    let runningTotal = 0;
    for (const item of data.orderedItems) {
        const product = await Product.findOne({ 
            key: { $regex: new RegExp(`^${item.key}$`, 'i') } 
        });
        
        if (!product) return res.status(404).json({ message: `Product ${item.key} not found` });

        const variant = product.variants.find(v => v.vKey === item.vKey);
        if (!variant) return res.status(400).json({ message: `Variant ${item.vKey} not found` });

        if (variant.availability === false || variant.stock < item.qty) {
            return res.status(400).json({ message: `Variant ${variant.flavor} is out of stock` });
        }

        orderInfo.orderedItems.push({
            productKey: product.key,
            name: product.name,
            basePrice: product.basePrice,
            deliveryFee: product.deliveryFee,
            variant: {
                vKey: variant.vKey,
                flavor: variant.flavor,
                variantImage: variant.variantImage,
                qty: item.qty
            }
        });

        runningTotal += (product.basePrice * item.qty) + product.deliveryFee;
    }

    orderInfo.totalAmount = runningTotal;

    // 6. Save Order
    const newOrder = new Order(orderInfo);
    const savedOrder = await newOrder.save();

    res.status(201).json({
      message: "Order placed successfully",
      order: savedOrder
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
// --- GET QUOTE (CALCULATE TOTAL WITHOUT SAVING) ---
export async function getQuote(req, res) {
    try {
        const data = req.body;
        let totalAmount = 0;
        const itemsWithDetails = [];

        for (const item of data.orderedItems) {
            const product = await Product.findOne({ key: item.key });

            if (!product) {
                return res.status(404).json({ message: `Product ${item.key} not found` });
            }

            const variant = product.variants.find(v => v.vKey === item.vKey);

            // Check variant availability and stock
            if (!variant || !variant.availability || variant.stock < item.qty) {
                return res.status(400).json({ 
                    message: `Variant ${item.vKey} is unavailable or out of stock` 
                });
            }

            const itemTotal = (product.basePrice * item.qty) + product.deliveryFee;
            totalAmount += itemTotal;

            // Push details so frontend can show a breakdown
            itemsWithDetails.push({
                name: product.name,
                flavor: variant.flavor,
                qty: item.qty,
                subTotal: itemTotal
            });
        }

        res.json({
            message: "Quote generated successfully",
            total: totalAmount,
            breakdown: itemsWithDetails
        });

    } catch (e) {
        res.status(500).json({ message: "Error calculating quote: " + e.message });
    }
}

// --- GET ORDERS (USER HISTORY OR ADMIN VIEW) ---
export async function getOrders(req, res) {
    try {
        let orders;
        if (isItAdmin(req)) {
            // Admin sees everything
            orders = await Order.find().sort({ createdAt: -1 });
        } else if (isItCustomer(req)) {
            // Customer only sees their own orders based on token email
            orders = await Order.find({ email: req.user.email }).sort({ createdAt: -1 });
        } else {
            return res.status(403).json({ error: "Unauthorized" });
        }
        
        res.json(orders);
    } catch (e) {
        res.status(500).json({ error: "Failed to load orders" });
    }
}
// --- APPROVE OR REJECT ORDER (ADMIN ONLY) ---
export async function approveOrRejectOrder(req, res) {
    const { orderId } = req.params;
    const { status } = req.body; // e.g., "Approved"

    if (!isItAdmin(req)) {
        return res.status(403).json({ error: "Unauthorized: Admin access required" });
    }

    try {
        const order = await Order.findOne({ orderId: orderId });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // 1. Update the status string (Pending, Approved, Shipped, etc.)
        order.status = status;

        // 2. Logic: If the string is "Approved", set the boolean isApproved to true
        if (status.toLowerCase() === "approved") {
            order.isApproved = true;
        } else if (status.toLowerCase() === "rejected" || status.toLowerCase() === "cancelled") {
            order.isApproved = false;
        }

        // 3. Save the changes
        await order.save();

        res.json({ 
            message: `Order status updated to ${status} successfully`,
            order: order 
        });
    } catch (e) {
        // Log the actual error to your console so you can see what happened
        console.error(e); 
        res.status(500).json({ error: "Failed to update order status" });
    }
}