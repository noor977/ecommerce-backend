require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/product');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected for seeding...'))
  .catch(err => console.log(err));

const sampleProducts = [
  {
    name: 'Wireless Headphones',
    price: 5999,
    category: 'Electronics',
    image: 'https://via.placeholder.com/300',
    description: 'High quality wireless headphones with noise cancellation.',
    stock: 20
  },
  {
    name: 'Running Shoes',
    price: 3500,
    category: 'Footwear',
    image: 'https://via.placeholder.com/300',
    description: 'Lightweight and comfortable running shoes.',
    stock: 15
  },
  {
    name: 'Leather Wallet',
    price: 1200,
    category: 'Accessories',
    image: 'https://via.placeholder.com/300',
    description: 'Slim genuine leather wallet with multiple card slots.',
    stock: 50
  },
  {
    name: 'Smartwatch',
    price: 12000,
    category: 'Electronics',
    image: 'https://via.placeholder.com/300',
    description: 'Feature-packed smartwatch with health tracking.',
    stock: 10
  },
  {
    name: 'Backpack',
    price: 2800,
    category: 'Bags',
    image: 'https://via.placeholder.com/300',
    description: 'Durable waterproof backpack with laptop compartment.',
    stock: 30
  },
  {
    name: 'Sunglasses',
    price: 1800,
    category: 'Accessories',
    image: 'https://via.placeholder.com/300',
    description: 'UV protected stylish sunglasses.',
    stock: 25
  }
];

const seedDB = async () => {
  await Product.deleteMany({});
  await Product.insertMany(sampleProducts);
  console.log('Database seeded successfully!');
  mongoose.connection.close();
};

seedDB();