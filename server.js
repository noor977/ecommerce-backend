require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const Product = require('./models/product');
const User = require('./models/User');
const { isLoggedIn, isAdmin } = require('./middleware/auth');

const app = express();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// MongoDB connect
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 15000,
}).then(() => console.log('MongoDB Connected!'))
  .catch(err => console.log('DB Error:', err));
// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

// Make user available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// ===== HOME =====
app.get('/', async (req, res) => {
  try {
    const products = await Product.find().limit(3);
    res.render('home', { products });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

// ===== PRODUCTS WITH PAGINATION =====
app.get('/products', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const categoryQuery = req.query.category || '';
    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const skip = (page - 1) * limit;

    let filter = {};
    if (searchQuery) filter.name = { $regex: searchQuery, $options: 'i' };
    if (categoryQuery) filter.category = categoryQuery;

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    const products = await Product.find(filter).skip(skip).limit(limit);
    const categories = await Product.distinct('category');

    res.render('products', {
      products,
      searchQuery,
      categoryQuery,
      categories,
      currentPage: page,
      totalPages
    });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

// ===== PRODUCT DETAILS =====
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.send('Not found');
    res.render('product_details', { product });
  } catch(e) {
    res.send('Error: ' + e.message);
  }
});

// ===== SIGNUP =====
app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.render('signup', { error: 'Email already registered!' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch(e) {
    res.render('signup', { error: e.message });
  }
});

// ===== LOGIN =====
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.render('login', { error: 'Email not found!' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.render('login', { error: 'Wrong password!' });
    }
    req.session.user = { id: user._id, name: user.name, email: user.email, role: user.role };
    res.redirect('/');
  } catch(e) {
    res.render('login', { error: e.message });
  }
});

// ===== LOGOUT =====
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

// ===== ADMIN - ADD PRODUCT =====
app.get('/admin/add-product', isLoggedIn, isAdmin, (req, res) => {
  res.render('add_product', { error: null, success: null });
});

app.post('/admin/add-product', isLoggedIn, isAdmin, async (req, res) => {
  try {
    const { name, price, category, image, description, stock } = req.body;
    const product = new Product({ name, price, category, image, description, stock });
    await product.save();
    res.render('add_product', { error: null, success: 'Product added successfully!' });
  } catch(e) {
    res.render('add_product', { error: e.message, success: null });
  }
});

// ===== START SERVER =====
app.listen(process.env.PORT || 3000, () => {
  console.log('Server running at http://localhost:3000');
});