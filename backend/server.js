// backend/server.js or backend/app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authController = require('./controllers/authController');

dotenv.config(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 8000;

app.use(cors()); // Enable CORS if the frontend is on a different port
app.use(express.json()); // To parse JSON request bodies

// Define the login route
app.post('/auth/login', authController.login);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
