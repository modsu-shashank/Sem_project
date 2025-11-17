import mongoose from 'mongoose';
import { config } from './config.js';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('⚠️  Server will start without database connection for testing purposes');
    console.log('💡 To enable full functionality, please set up MongoDB and MONGODB_URI environment variable');
    return null;
  }
};

export default connectDB;
