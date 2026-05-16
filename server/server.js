const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.send('HealthMate API is running');
});

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/meals', require('./routes/meal'));
app.use('/api/progress', require('./routes/progress'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
