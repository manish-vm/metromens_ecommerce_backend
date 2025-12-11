const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'https://metromens-ecommerce-frontend.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    exposedHeaders: ["set-cookie"]
  })
);

app.get('/', (req, res) => {
  res.send('MetroMensWear API is running');
});

// Debug endpoint to check product flags
app.get('/api/debug/product-counts', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const counts = {
      total: await Product.countDocuments(),
      trending: await Product.countDocuments({ isTrending: true }),
      bestseller: await Product.countDocuments({ isBestSeller: true }),
      newArrival: await Product.countDocuments({ isNewArrival: true })
    };
    res.json(counts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/api/auth', require('./routes/authRoutes.js'));
app.use('/api/products', require('./routes/productRoutes.js'));
app.use('/api/categories', require('./routes/categoryRoutes.js'));
app.use('/api/cart', require('./routes/cartRoutes.js'));
app.use('/api/orders', require('./routes/orderRoutes.js'));
app.use('/api/admin', require('./routes/adminRoutes.js'));
app.use('/api/upload', require('./routes/uploadRoutes.js'));
app.use('/api/user', require('./routes/userRoutes.js'));
app.use('/api/addresses', require('./routes/addressRoutes.js'));
app.use('/api/wishlist', require('./routes/wishlistRoutes.js'));

// Static uploads (if needed)
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Error handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`)
);

