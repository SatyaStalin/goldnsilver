// require('dotenv').config();
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const path = require('path');


const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
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
const safegoldRoutes = require('./routes/safegoldRoutes');

const app = express();

// Connect DB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
// app.use('/api/uploads', express.static('uploads'));
app.use('/api/uploads', express.static(path.join(__dirname, '../uploads')));


// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
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
app.use('/api/safegold', safegoldRoutes);
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
  try {
    const {
      getPersistedAccessToken,
      getSessionPath
    } = require('./services/zerodhaSessionStore');
    const ok = Boolean(getPersistedAccessToken());
    console.info(
      `[zerodha] Persisted session: ${ok ? 'yes' : 'no'} | file: ${getSessionPath()}`
    );
    if (process.env.ZERODHA_ACCESS_TOKEN?.trim() && !ok) {
      console.warn(
        '[zerodha] ZERODHA_ACCESS_TOKEN is set but no session file yet — env token is ignored for market-data until OAuth or ZERODHA_ALLOW_ENV_TOKEN=1.'
      );
    }
  } catch (e) {
    /* ignore */
  }
  try {
    const { getSafeGoldConfig } = require('./services/safegoldApi');
    const sg = getSafeGoldConfig();
    console.info(
      `[safegold] mode=${sg.mode} | buy-price=${sg.buyPriceUrl} | mock=${sg.mock} | apiKey=${sg.hasApiKey ? 'set' : 'missing'}`
    );
    if (sg.ignoredLegacyProductionEnv) {
      console.warn(
        '[safegold] Ignoring SAFEGOLD_API_BASE_URL=https://api.safegold.com — staging is the default. Set SAFEGOLD_ENV=production for live.'
      );
    }
  } catch (e) {
    /* ignore */
  }
});
