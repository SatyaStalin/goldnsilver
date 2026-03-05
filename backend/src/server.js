require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sipRoutes = require('./routes/sipRoutes');
const buybackRoutes = require('./routes/buybackRoutes');
const blogRoutes = require('./routes/blogRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const adminRoutes = require('./routes/adminRoutes');
const livePriceRoutes = require('./routes/livePriceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const productImportRoutes = require('./routes/productImportRoutes');
const zerodhaRoutes = require('./routes/zerodhaRoutes');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/sip', sipRoutes);
app.use('/api/buyback', buybackRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/live-price', livePriceRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/products/import', productImportRoutes);
app.use('/api/zerodha', zerodhaRoutes);
app.use('/sample-products.csv', express.static('sample-products.csv'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
