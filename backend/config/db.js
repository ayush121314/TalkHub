const dotenv = require('dotenv');
const mongoose = require('mongoose');

//load env config
dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.log('MongoDB URI:', process.env.MONGO_URI)
    process.exit(1);
  }
};

module.exports = connectDB;
