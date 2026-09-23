const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * Reduce catalogue stock once when a product order is paid.
 * Cashfree can mark the order paid from the webhook before the browser
 * calls verify-payment; both paths call this, and only the first one applies.
 */
async function deductStockForPaidOrder(orderOrId) {
  const orderId = orderOrId && orderOrId._id ? orderOrId._id : orderOrId;
  if (!orderId) return false;

  const claimed = await Order.findOneAndUpdate(
    {
      _id: orderId,
      orderType: { $ne: 'safegold' },
      stockDeducted: { $ne: true }
    },
    { $set: { stockDeducted: true } },
    { new: false }
  );

  if (!claimed) return false;

  try {
    for (const item of claimed.items || []) {
      const productId = item.product && item.product._id ? item.product._id : item.product;
      const qty = Number(item.quantity) || 0;
      if (!productId || qty <= 0) continue;
      const result = await Product.updateOne({ _id: productId }, { $inc: { stock: -qty } });
      if (!result.matchedCount) {
        console.error('[stock] product not found for order', String(orderId), String(productId));
      }
    }
    return true;
  } catch (err) {
    await Order.updateOne({ _id: orderId }, { $set: { stockDeducted: false } });
    throw err;
  }
}

module.exports = { deductStockForPaidOrder };
