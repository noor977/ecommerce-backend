// Middleware: Check if user is logged in
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  res.redirect('/login');
};

// Middleware: Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  res.redirect('/');
};

module.exports = { isLoggedIn, isAdmin };