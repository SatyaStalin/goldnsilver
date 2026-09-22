/**
 * Book Sequel for paid physical orders still stuck in pending/failed.
 * Usage: node src/scripts/bookPendingSequelOrders.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const Order = require('../models/Order');
const { bookShipmentForOrder } = require('../services/sequelService');
const { getSequelConfig } = require('../services/sequelApi');

async function main() {
  const cfg = getSequelConfig();
  console.log('Sequel configured:', cfg.configured, 'autoBook:', cfg.autoBook, 'pickup:', cfg.pickupTime);
  if (!cfg.configured) {
    throw new Error('SEQUEL_API_TOKEN missing');
  }

  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goldnsilver');
  const orders = await Order.find({
    requiresSequelShipment: true,
    paymentStatus: 'success',
    $or: [
      { 'sequel.docketNumber': { $exists: false } },
      { 'sequel.docketNumber': null },
      { 'sequel.docketNumber': '' }
    ]
  }).limit(50);

  console.log(`Found ${orders.length} paid physical order(s) without docket`);
  for (const order of orders) {
    try {
      const booked = await bookShipmentForOrder(order);
      console.log('OK', String(order._id), 'docket', booked.sequel?.docketNumber, booked.sequel?.trackingUrl);
    } catch (err) {
      console.error('FAIL', String(order._id), err.message);
    }
  }
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
