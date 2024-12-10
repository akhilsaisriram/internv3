const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const productRoutes = require("./routes/productRoutes");
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const path = require("path");

// Middleware

app.use(express.json({ limit: '500mb' })); // Configure limit for express.json()
app.use(express.urlencoded({extended:false}))
app.use(bodyParser.json({ limit: '500mb' })); // Configure limit for body-parser
app.use(bodyParser.urlencoded({ limit: '500mb', extended: true }));
app.use(cors());
app.use(morgan('dev')); // Log HTTP requests in dev format

// Routes
app.use('/products', productRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
