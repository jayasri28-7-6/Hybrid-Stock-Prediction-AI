const jwt = require('jsonwebtoken');

const auth = {
  // Required authentication
  required: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  },

  // Optional authentication
  optional: (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
      next();
    } catch (error) {
      // If token is invalid, still proceed without user
      next();
    }
  }
};

module.exports = auth;