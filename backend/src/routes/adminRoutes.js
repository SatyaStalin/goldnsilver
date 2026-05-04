const express = require('express');
const Product = require('../models/Product');
const Order = require('../models/Order');
const MetalRateSettings = require('../models/MetalRateSettings');
const upload = require('../middleware/upload');
const router = express.Router();

async function getOrCreateMetalRates() {
  let doc = await MetalRateSettings.findOne({ key: 'global' });
  if (!doc) {
    doc = await MetalRateSettings.create({ key: 'global', goldPerGram: 0, silverPerGram: 0 });
  }
  return doc;
}

function computePriceFromRates(productLike, rates) {
  const g =
    productLike.metalGrams != null && Number(productLike.metalGrams) > 0
      ? Number(productLike.metalGrams)
      : 1;
  const gold = Number(rates.goldPerGram) || 0;
  const silver = Number(rates.silverPerGram) || 0;
  const metal = productLike.metal || 'gold';
  let base = 0;
  if (metal === 'gold') base = gold * g;
  else if (metal === 'silver') base = silver * g;
  else if (metal === 'gold+silver') base = ((gold + silver) / 2) * g;
  else base = gold * g;
  return Math.round(base * 100) / 100;
}

// Get all products (admin - includes inactive) with pagination
router.get('/products', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Product.countDocuments();
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (err) {
    next(err);
  }
});

// Upload product image
router.post('/products/upload-image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.json({ imageUrl, filename: req.file.filename });
  } catch (err) {
    next(err);
  }
});

// Admin gold/silver per-gram rates (INR)
router.get('/gold-rates', async (req, res, next) => {
  try {
    const doc = await getOrCreateMetalRates();
    res.json({
      goldPerGram: doc.goldPerGram,
      silverPerGram: doc.silverPerGram,
      updatedAt: doc.updatedAt
    });
  } catch (err) {
    next(err);
  }
});

router.put('/gold-rates', async (req, res, next) => {
  try {
    const gold = parseFloat(req.body.goldPerGram);
    const silver = parseFloat(req.body.silverPerGram);
    if (Number.isNaN(gold) || Number.isNaN(silver) || gold < 0 || silver < 0) {
      return res
        .status(400)
        .json({ message: 'goldPerGram and silverPerGram must be non-negative numbers' });
    }
    const doc = await MetalRateSettings.findOneAndUpdate(
      { key: 'global' },
      { goldPerGram: gold, silverPerGram: silver },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    let bulkUpdated = 0;
    if (req.body.applyAll === true) {
      const products = await Product.find();
      for (const p of products) {
        p.pricePerUnit = computePriceFromRates(p, doc);
        await p.save();
        bulkUpdated += 1;
      }
    }
    res.json({
      goldPerGram: doc.goldPerGram,
      silverPerGram: doc.silverPerGram,
      bulkUpdated
    });
  } catch (err) {
    next(err);
  }
});

// Create product
router.post('/products', async (req, res, next) => {
  try {
    const { syncPriceFromRates = true, ...body } = req.body;
    const rates = await getOrCreateMetalRates();
    const useRates =
      syncPriceFromRates !== false &&
      (rates.goldPerGram > 0 || rates.silverPerGram > 0);
    if (useRates) {
      const temp = new Product(body);
      body.pricePerUnit = computePriceFromRates(temp, rates);
    }
    const product = new Product(body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

// Update product
router.put('/products/:id', async (req, res, next) => {
  try {
    const existing = await Product.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const { syncPriceFromRates = true, ...update } = req.body;
    const rates = await getOrCreateMetalRates();
    const useRates =
      syncPriceFromRates !== false &&
      (rates.goldPerGram > 0 || rates.silverPerGram > 0);
    if (useRates) {
      const merged = { ...existing.toObject(), ...update };
      const temp = new Product(merged);
      update.pricePerUnit = computePriceFromRates(temp, rates);
    }
    const product = await Product.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true
    });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

// Delete product
router.delete('/products/:id', async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// Get dashboard stats
router.get('/dashboard', async (req, res, next) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'pending' });
    const completedOrders = await Order.countDocuments({ status: { $in: ['paid', 'delivered'] } });
    
    // Calculate total revenue from paid/delivered orders
    const revenueOrders = await Order.find({ 
      status: { $in: ['paid', 'delivered'] },
      paymentStatus: 'success'
    });
    const totalRevenue = revenueOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Get monthly revenue for last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          status: { $in: ['paid', 'delivered'] },
          paymentStatus: 'success'
        }
      },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRevenue = [];
    const monthlyLabels = [];

    monthlyData.forEach(item => {
      monthlyRevenue.push(item.revenue);
      monthlyLabels.push(`${monthNames[item._id.month - 1]} ${item._id.year}`);
    });

    // Fill missing months with 0
    while (monthlyRevenue.length < 6) {
      monthlyRevenue.unshift(0);
      const date = new Date();
      date.setMonth(date.getMonth() - (6 - monthlyRevenue.length));
      monthlyLabels.unshift(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
    }

    // Get revenue distribution by product type
    const productDistribution = await Order.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'delivered'] },
          paymentStatus: 'success'
        }
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.metal',
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      }
    ]);

    res.json({
      totalRevenue,
      totalOrders,
      pendingOrders,
      completedOrders,
      monthlyRevenue: monthlyRevenue.slice(-6),
      monthlyLabels: monthlyLabels.slice(-6),
      productDistribution
    });
  } catch (err) {
    next(err);
  }
});

// Get all orders with user details
router.get('/orders', async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name slug imageUrl metal type')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// Update order status
router.put('/orders/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// Get all users who made purchases
router.get('/users', async (req, res, next) => {
  try {
    const User = require('../models/User');
    
    // Get all unique customers from orders (including guest orders with customer info)
    const ordersWithCustomers = await Order.find({
      $or: [
        { user: { $ne: null } },
        { customerEmail: { $exists: true, $ne: null } }
      ]
    }).select('user customerName customerEmail customerPhone totalAmount createdAt');

    // Group by user ID or email
    const userMap = new Map();
    
    ordersWithCustomers.forEach(order => {
      const key = order.user ? order.user.toString() : (order.customerEmail || 'guest');
      
      if (!userMap.has(key)) {
        userMap.set(key, {
          _id: order.user || key,
          name: null,
          email: order.customerEmail || null,
          phone: order.customerPhone || null,
          totalOrders: 0,
          totalSpent: 0,
          lastPurchaseDate: null
        });
      }
      
      const userData = userMap.get(key);
      userData.totalOrders += 1;
      userData.totalSpent += (order.totalAmount || 0);
      if (!userData.lastPurchaseDate || order.createdAt > userData.lastPurchaseDate) {
        userData.lastPurchaseDate = order.createdAt;
      }
      if (order.customerName && !userData.name) {
        userData.name = order.customerName;
      }
      if (order.customerEmail && !userData.email) {
        userData.email = order.customerEmail;
      }
      if (order.customerPhone && !userData.phone) {
        userData.phone = order.customerPhone;
      }
    });

    // Populate user details for registered users
    const userIds = Array.from(userMap.keys()).filter(key => key.match(/^[0-9a-fA-F]{24}$/));
    if (userIds.length > 0) {
      const users = await User.find({ _id: { $in: userIds } }).select('name email');
      users.forEach(user => {
        const userData = userMap.get(user._id.toString());
        if (userData) {
          userData.name = user.name || userData.name;
          userData.email = user.email || userData.email;
        }
      });
    }

    // Convert to array and sort by last purchase date
    const usersData = Array.from(userMap.values()).sort((a, b) => {
      if (!a.lastPurchaseDate) return 1;
      if (!b.lastPurchaseDate) return -1;
      return new Date(b.lastPurchaseDate) - new Date(a.lastPurchaseDate);
    });

    res.json(usersData);
  } catch (err) {
    next(err);
  }
});

// Get all buyback requests
router.get('/buybacks', async (req, res, next) => {
  try {
    const BuybackRequest = require('../models/BuybackRequest');
    const buybacks = await BuybackRequest.find().sort({ createdAt: -1 });
    res.json(buybacks);
  } catch (err) {
    next(err);
  }
});

// Update buyback status
router.put('/buybacks/:id', async (req, res, next) => {
  try {
    const BuybackRequest = require('../models/BuybackRequest');
    const buyback = await BuybackRequest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!buyback) {
      return res.status(404).json({ message: 'Buyback request not found' });
    }
    res.json(buyback);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
