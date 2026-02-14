import Product from '../models/product.js';

//Add a new product (Admin Only)
export const addProduct = async (req, res) => {
  try {
    if (!isItAdmin(req)) {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

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
    const product = await Product.findOne({ key: req.params.key });
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Update product by Key (Admin Only)
export const updateProduct = async (req, res) => {
  try {
    if (!isItAdmin(req)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

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
    if (!isItAdmin(req)) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const deletedProduct = await Product.findOneAndDelete({ key: req.params.key });
    if (!deletedProduct) return res.status(404).json({ message: "Product not found" });
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getVariant = async (req, res) => {
  try {
    const product = await Product.findOne({ key: req.params.key }).select('variants');
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product.variants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a specific variant from a product (Admin Only)
export const deleteVariant = async (req, res) => {
  try {
    // Check admin permission
    if (!isItAdmin(req)) {
      return res.status(403).json({ message: "Unauthorized: Admin access required" });
    }

    const { key } = req.params;
    const { variantId } = req.body; // Pass the _id of the variant in the request body

    // Use $pull to remove the variant from the array
    const updatedProduct = await Product.findOneAndUpdate(
      { key: key },
      { $pull: { variants: { _id: variantId } } },
      { new: true } // Return the updated product so frontend can refresh
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