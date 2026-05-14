require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log('DB Error:', err));

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// ===== ROUTES =====

// Home Page - show 3 featured products
app.get('/', async (req, res) => {
  try {
    const featuredProducts = await Product.find().limit(3);
    res.render('home', { products: featuredProducts });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Products Page - show all products + search
app.get('/products', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const categoryQuery = req.query.category || '';

    let filter = {};

    if (searchQuery) {
      filter.name = { $regex: searchQuery, $options: 'i' };
    }

    if (categoryQuery) {
      filter.category = categoryQuery;
    }

    const products = await Product.find(filter);
    const categories = await Product.distinct('category');

    res.render('products', {
      products,
      searchQuery,
      categoryQuery,
      categories
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Product Details Page
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).send('Product not found');
    res.render('product-details', { product });
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});