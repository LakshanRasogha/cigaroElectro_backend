import Order from "../models/order.js";
import Product from "../models/product.js";
import { isItAdmin, isItCustomer } from "./userController.js";

export async function createOrder(req, res) {
  try {
    const data = req.body;
    const orderInfo = { orderedItems: [], totalAmount: 0 };

    // 1. Authentication Check
    if (!req.user) {
      return res.status(401).json({ message: "Please log in to place an order" });
    }
    orderInfo.email = req.user.email;

    // 2. Generate Sequential Order ID
    const lastOrder = await Order.findOne().sort({ orderDate: -1 });
    let nextId = 1;
    if (lastOrder && lastOrder.orderId) {
      nextId = parseInt(lastOrder.orderId.replace("ORD", "")) + 1;
    }
    orderInfo.orderId = "ORD" + String(nextId).padStart(4, '0');

    // 3. Process Items & Snapshot Data
    let runningTotal = 0;

    for (const item of data.orderedItems) {
        const product = await Product.findOne({ 
            key: { $regex: new RegExp(`^${item.key}$`, 'i') } 
        });
        
        if (!product) {
            return res.status(404).json({ message: `Product ${item.key} not found` });
        }

        const variant = product.variants.find(v => v.vKey === item.vKey);
        
        if (!variant) {
            return res.status(400).json({ message: `Variant ${item.vKey} not found` });
        }

        if (variant.availability === false || variant.stock < item.qty) {
            return res.status(400).json({ 
            message: `Variant ${variant.flavor} is currently unavailable or out of stock` 
            });
        }

      // Create the immutable snapshot
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

    // 4. Save Order
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

export async function getQuote(req, res){
    console.log(req.body)
    const data = req.body
    const orderInfo = {
        orderedItems:[]
    }
    let oneDayCost = 0
    for(let i=0; i<data.orderedItems.length; i++){
        try{
            const product = await Product.findOne({key: data.orderedItems[i].key})
            if(product == null){
                res.status(400).json({
                    message: `Product with key ${data.orderedItems[i].key} not found`
                })
                return
            }
            if(product.availability === false){
                res.status(400).json({
                    message: `Product with key ${data.orderedItems[i].key} is not available`
                })
                return
            }
            orderInfo.orderedItems.push({
                product: {
                    key: product.key,
                    name: product.name,
                    image: product.image[0],
                    price: product.price
                },
                quantity: data.orderedItems[i].qty
            })

            oneDayCost += product.price * data.orderedItems[i].qty
        
        }catch(e){
            res.status(500).json({
                message: "Error processing order"
            })
            return
        }
    }
    
    orderInfo.days = data.days
    orderInfo.startingDate = data.startingDate
    orderInfo.endingDate = data.endingDate
    orderInfo.totalAmount = oneDayCost * data.days

    try{
        res.json({
            message: "Order placed successfully",
            total: orderInfo.totalAmount,
        })
    }catch(e){
        res.status(500).json({
            message: "Error placing order"
        })
    }
}

export async function getOrders(req, res){
    if(isItCustomer(req)){
        try{
            const orders = await Order.find({email: req.user.email})
            res.json(orders)
        }catch(e){
            res.status(500).json({error:"Faild to load orders"})
        }
    }else if(isItAdmin(req)){
        try{
            const orders = await Order.find()
            res.json(orders)
        }catch(e){
            res.status(500).json({error:"Faild to load orders"})
        }
    }else{
        res.status(403).json({error:"Unauthorized"})
    }
}

export async function approveOrRejectOrder(req,res){
    const orderId = req.params.orderId
    const status = req.body.status

    if(isItAdmin(req)){
        const order = await Order.findOne({
            orderId: orderId
        })
        if(order == null){
            res.status(404).json({error: "Order not found"})
            return
        }

        await Order.updateOne({
            orderId: orderId
        },{
            status:status
        })

        res.json({message:"Order is Approved/Rejected successfully"})
    }else{
        res.status(403).json({error:"Unauthorized"})
    }
}