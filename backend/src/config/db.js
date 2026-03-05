const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/goldnsilver';
    await mongoose.connect(uri, {
      autoIndex: true
    });
    console.log('MongoDB connected to goldnsilver database');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;

