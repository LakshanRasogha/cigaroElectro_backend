import Product from '../models/product.js'
import { isItAdmin } from "./userController.js"
//Add a new product (Admin Only)
export const addProduct = async (req, res) => {
  try {
    // if (!isItAdmin(req)) {
    //   return res.status(403).json({ message: "Unauthorized: Admin access required" });
    // }

    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({ message: "Product added successfully", data: newProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//Get all products (Public)
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get a single product by Key (Public)
export const getProduct = async (req, res) => {
  try {
    const { key } = req.params;

    // Use $regex with 'i' flag for case-insensitive matching
    const product = await Product.findOne({ 
      key: { $regex: new RegExp(`^${key}$`, 'i') } 
    });

    if (!product) {
      return res.status(404).json({ message: `Product with key '${key}' not found` });
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update product by Key (Admin Only)
export const updateProduct = async (req, res) => {
  try {
    // if (!isItAdmin(req)) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }
    
    const updatedProduct = await Product.findOneAndUpdate(
      { key: req.params.key },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product updated", data: updatedProduct });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



//Delete product by Key (Admin Only)
export const deleteProduct = async (req, res) => {
  try {
    // if (!isItAdmin(req)) {
    //   return res.status(403).json({ message: "Unauthorized" });
    // }

    const deletedProduct = await Product.findOneAndDelete({ key: req.params.key });
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getVariantByKey = async (req, res) => {
  try {
    const { key, vKey } = req.params; // Expecting both in the route

    const product = await Product.findOne(
      { 
        Key: key,            // Match the product
        "variants.vKey": vKey // Match the specific variant inside the array
      },
      { 
        "variants.$": 1      // Projection: Return ONLY the first matched variant element
      }
    );

    if (!product || !product.variants.length) {
      return res.status(404).json({ message: "Variant or Product not found" });
    }

    // Return the specific variant object directly
    res.status(200).json(product.variants[0]); 
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateVariantByKey = async (req, res) => {
  try {
    if (!isItAdmin(req)) {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    // Identifiers come strictly from the URL params
    const { key, vKey } = req.params; 
    // New data comes from the request body
    const updateData = req.body; 

    const updatedProduct = await Product.findOneAndUpdate(
      { 
        Key: key,            // Match the parent Product
        "variants.vKey": vKey // Match the specific Variant
      },
      { 
        $set: { 
          // Update only the fields provided in the body
          "variants.$.vKey": updateData.vKey || vKey,
          "variants.$.flavor": updateData.flavor,
          "variants.$.emoji": updateData.emoji,
          "variants.$.stock": updateData.stock,
          "variants.$.availability": updateData.availability,
          "variants.$.variantImage": updateData.variantImage
        } 
      },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product or specific Variant not found" });
    }

    res.status(200).json({ 
      message: "Variant updated successfully", 
      data: updatedProduct 
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a specific variant from a product (Admin Only)
export const deleteVariantByKey = async (req, res) => {
  try {
    // if (!isItAdmin(req)) {
    //   return res.status(403).json({ message: "Unauthorized: Admin access required" });
    // }

    // Capture keys from URL parameters
    const { key, vKey } = req.params; 

    const updatedProduct = await Product.findOneAndUpdate(
      { Key: key }, // Find the product by its Key
      { 
        $pull: { 
          variants: { vKey: vKey } // Remove the variant that matches this vKey
        } 
      },
      { new: true } // Return the updated product after deletion
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ 
      message: "Variant deleted successfully",
      data: updatedProduct 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};