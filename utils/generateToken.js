const jwt = require('jsonwebtoken');

const generateToken = (res, userId, isAdmin) => {
  const token = jwt.sign({ userId, isAdmin }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });

  // httpOnly cookie
res.cookie('jwt', token, {
  httpOnly: true,
  secure: true,                 // must be true for sameSite:none
  sameSite: 'none',             // required for cross-site
  domain: 'metromens-ecommerce-backend.onrender.com', // REQUIRED FIX
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000
});


  return token;
};

module.exports = generateToken;

