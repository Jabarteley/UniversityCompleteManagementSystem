import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      logger.warning('MongoDB URI not provided - running without database');
      logger.info('To connect to MongoDB, set MONGODB_URI in your .env file');
      return;
    }
    
    await mongoose.connect(mongoURI);
    logger.success('MongoDB connected successfully');
  } catch (error) {
    logger.warning('MongoDB connection failed - running without database');
    logger.info('To connect to MongoDB, provide a valid MONGODB_URI in your .env file');
    logger.error('Connection error:', error instanceof Error ? error.message : 'Unknown error');
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected');
  } catch (error) {
    logger.error('Error disconnecting from MongoDB:', error);
  }
};

// Event listeners
mongoose.connection.on('disconnected', () => {
  logger.info('MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('MongoDB error:', error.message);
});

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected');
});