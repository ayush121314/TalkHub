const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandlerMiddleware = require('./middleware/error-handler');
const documentRoutes = require("./routes/documentRoutes");
const recordingRoutes = require("./routes/recordingRoutes");


// Initialize express
const app = express();

// Load env vars
dotenv.config();

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Define Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/lectures', require('./routes/lecture.routes'));
app.use('/api/docs',documentRoutes);
app.use('/api/recordings',recordingRoutes);

// Error handling middleware
app.use(errorHandlerMiddleware);

// Start server
const PORT = process.env.PORT || 4040;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
