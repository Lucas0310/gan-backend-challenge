const express = require('express');
const app = express();
const PORT = 8080;

app.get('/cities-by-tag?tag=excepteurus&isActive=true', (req, res) => {
  res.send('Welcome to the homepage!');
});

// Endpoint for a specific route
app.get('/about', (req, res) => {
  res.send('This is the about page.');
});

// Endpoint with dynamic parameters
app.get('/user/:id', (req, res) => {
  const userId = req.params.id;
  res.send(`User ID: ${userId}`);
});

// 404 endpoint for undefined routes
app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
