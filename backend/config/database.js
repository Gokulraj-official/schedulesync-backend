const mongoose = require('mongoose');

const connectDB = async () => {
  let retries = 5;
  const retryDelay = 5000; // 5 seconds

  while (retries > 0) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000,
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      retries--;
      console.error(`MongoDB connection failed: ${error.message}`);
      console.log(`Retrying in ${retryDelay / 1000} seconds... (${retries} retries left)`);
      
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        console.error('MongoDB connection failed after 5 retries. Server will continue running but database features will not work.');
        // Don't exit - let the server continue so we can debug Render deployment
        return;
      }
    }
  }
};

module.exports = connectDB;
