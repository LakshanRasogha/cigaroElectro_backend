import mongoose from 'mongoose';


const variantSchema = new mongoose.Schema({
  vKey: {
    type: String,
    required: true
  },
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
  },
  variantImage:{
        type: [String],
        required: true,
        default: ["https://www.sriyanidresspoint.lk/product/womens-classic-hand-bag-050502902013?srsltid=AfmBOopond1VIeIgFSkRe89_tTpUuwitN9lcThhQOMDUb23zjx8Kp7if"]
  }
});

// Main Product Schema
const productSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true
  },
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
    default: 'Disposable',
    enum: ['Disposable', 'Re-fill', 'E-Liquid', 'Accessories', 'T-shirts']

  },
  description: {
    type: String
  },
  productImage:{
    type: [String],
    required: true,
    default: ["https://www.sriyanidresspoint.lk/product/womens-classic-hand-bag-050502902013?srsltid=AfmBOopond1VIeIgFSkRe89_tTpUuwitN9lcThhQOMDUb23zjx8Kp7if"]
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