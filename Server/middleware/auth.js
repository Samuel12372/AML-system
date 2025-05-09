const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(403).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = isAuthenticated;
