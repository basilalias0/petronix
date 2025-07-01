// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const errorHandler = require('./middleware/errorHandler');
const  router  = require('./routes');

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Middleware


app.use(cors({
  origin: '*', // Frontend URL (React.js), adjust as needed
  credentials: true,
})); // Enable CORS

// Database Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  }
}
connectDB();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Petronix API' });
});

app.use("/api/v1",router)

app.use(errorHandler)

app.listen(process.env.PORT,()=>{
  console.log("application is running on ",process.env.PORT);
  
})