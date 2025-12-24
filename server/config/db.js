const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    if (err.message.includes('whitelist')) {
      console.error('HINT: Check your MongoDB Atlas Network Access settings. Add your current IP address.');
    }
    // Do not exit process immediately in dev to allow server to start (optional, but good for debugging)
    // process.exit(1); 
  }
};

module.exports = connectDB;
