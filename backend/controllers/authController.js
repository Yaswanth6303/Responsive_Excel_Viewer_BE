// backend/controllers/authController.js
const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { username, password } = req.body;

  // Check if the username matches
  if (username !== process.env.ADMIN_USERNAME) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Check if the password matches
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // If credentials are correct, create a JWT token
  const token = jwt.sign(
    { username: process.env.ADMIN_USERNAME },
    process.env.JWT_SECRET,
    { expiresIn: '1h' } // Token expiration time (optional)
  );

  // Send the token as the response
  res.json({ token });
};
