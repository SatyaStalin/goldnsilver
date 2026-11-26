require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const { syncOpenSequelShipments } = require('../services/sequelService');

async function main() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/goldnsilver');
  const result = await syncOpenSequelShipments();
  console.log(JSON.stringify(result));
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
