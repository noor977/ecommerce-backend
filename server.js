const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve public folder for CSS/JS files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'products.html'));
});

app.get('/products/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'product_details.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running: http://localhost:${PORT}`);
});