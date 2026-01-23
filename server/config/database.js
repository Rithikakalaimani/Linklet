const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/urlshortener';
    const conn = await mongoose.connect(mongoUri);
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('⚠️  Server will start but database operations will fail.');
    console.error('💡 To fix:');
    console.error('   1. Make sure MongoDB is running locally: mongod');
    console.error('   2. Or update MONGODB_URI in .env with a valid connection string');
    console.error('   3. For MongoDB Atlas, check your network access and connection string');
    isConnected = false;
    return false;
  }
};

const isDBConnected = () => isConnected;

module.exports = { connectDB, isDBConnected };
