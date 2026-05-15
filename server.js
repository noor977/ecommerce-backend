require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Product = require('./models/product');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('DB OK'))
  .catch(e => console.log('DB ERR', e));

app.get('/', async (req, res) => {
  try {
    const products = await Product.find().limit(3);
    console.log('Products:', products.length);
    res.render('home', { products });
  } catch(e) {
    console.log('HOME ERR:', e.message);
    res.send('Error: ' + e.message);
  }
});

app.get('/products', async (req, res) => {
  try {
    const searchQuery = req.query.search || '';
    const categoryQuery = req.query.category || '';
    let filter = {};
    if(searchQuery) filter.name = { $regex: searchQuery, $options: 'i' };
    if(categoryQuery) filter.category = categoryQuery;
    const products = await Product.find(filter);
    const categories = await Product.distinct('category');
    res.render('products', { products, searchQuery, categoryQuery, categories });
  } catch(e) {
    console.log('PRODUCTS ERR:', e.message);
    res.send('Error: ' + e.message);
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if(!product) return res.send('Not found');
    res.render('product_details', { product });
  } catch(e) {
    console.log('DETAIL ERR:', e.message);
    res.send('Error: ' + e.message);
  }
});

app.listen(3000, () => console.log('Server at http://localhost:3000'));