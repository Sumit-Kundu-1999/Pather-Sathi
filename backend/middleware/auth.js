const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

    if (!token) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  try {
    // Verify the token
    const verified = jwt.verify(token, process.env.JW_SECRET);

    // Attach user payload to the request object so subsequent routes can use it
    req.user = verified;

    // Move to the route handler
    next(); 
  } catch (error) {
    res.status(403).json({ message: 'Invalid or Expired Token' });
  }
}

module.exports = authenticateToken;
