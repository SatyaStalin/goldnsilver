require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/goldnsilver', {
      autoIndex: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

const products = [
  {
    name: 'Digital Gold 10g',
    slug: 'digital-gold-10g',
    metal: 'gold',
    type: 'digital',
    category: 'Digital Gold',
    description: 'Buy 10 grams of 24K digital gold, stored in insured vaults, redeemable anytime.',
    pricePerUnit: 6500,
    unit: 'gram',
    stock: 100,
    imageUrl: 'https://images.pexels.com/photos/315788/pexels-photo-315788.jpeg',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Gold Coin 5g',
    slug: 'gold-coin-5g',
    metal: 'gold',
    type: 'physical_coin',
    category: 'Gold Coin',
    description: '5 grams 24K gold coin with tamper-proof packaging and BIS certification.',
    pricePerUnit: 3750,
    unit: 'gram',
    stock: 50,
    imageUrl: 'https://images.pexels.com/photos/706137/pexels-photo-706137.jpeg',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Silver Coin 100g',
    slug: 'silver-coin-100g',
    metal: 'silver',
    type: 'physical_coin',
    category: 'Silver Coin',
    description: '100 grams 999 purity silver coin in various weights.',
    pricePerUnit: 95,
    unit: 'gram',
    stock: 200,
    imageUrl: 'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg',
    isFeatured: true,
    isActive: true
  },
  {
    name: 'Gold SIP Monthly Plan',
    slug: 'gold-sip-monthly-plan',
    metal: 'gold',
    type: 'sip',
    category: 'Gold SIP',
    description: 'Automated monthly gold accumulation to reach long-term goals.',
    pricePerUnit: 2000,
    unit: 'month',
    stock: 999,
    imageUrl: 'https://images.pexels.com/photos/2101137/pexels-photo-2101137.jpeg',
    isFeatured: true,
    isActive: true
  }
];

const seedProducts = async () => {
  try {
    await connectDB();
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Insert new products
    const insertedProducts = await Product.insertMany(products);
    console.log(`Seeded ${insertedProducts.length} products`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding products:', error);
    process.exit(1);
  }
};

seedProducts();
