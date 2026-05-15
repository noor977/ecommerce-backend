const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

console.log('Starting minimal server...');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
  console.log('[LOG]', req.method, req.url);
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  console.log('[LOG] Home route hit');
  const products = [];
  res.render('home', { products });
});

app.listen(PORT, () => {
  console.log(`[LOG] Server on port ${PORT}`);
});
