import mongoose from 'mongoose';

// Schema for individual flavor variants
// Using subdocuments allows us to validate each flavor and track stock individually.
const variantSchema = new mongoose.Schema({
  flavor: { 
    type: String, 
    required: [true, 'Flavor name is required'],
    trim: true 
  },
  emoji: { 
    type: String // e.g., "🍓", "🍏"
  },
  stock: { 
    type: Number, 
    required: [true, 'Stock count is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0 
  },
  availability: {
    type: Boolean,
    default: true
  }
});

// Main Product Schema
const productSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Product name is required'], 
    trim: true 
  },
  tagline: { 
    type: String, // e.g., "Smooth • Long-lasting • Premium taste"
    trim: true
  },
  basePrice: { 
    type: Number, 
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  deliveryFee: { 
    type: Number, 
    default: 400 
  },
  category: {
    type: String,
    default: 'Disposable'
  },
  description: {
    type: String
  },
  // Nesting the variants array
  variants: [variantSchema] 
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexing for faster search (Great for 2026 SEO)
productSchema.index({ name: 'text', category: 'text' });

const Product = mongoose.model('products', productSchema);

export default Product