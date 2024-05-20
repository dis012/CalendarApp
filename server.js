const express = require('express');
const path = require('path');
const app = express();

// Serve static files directly from the root of the directory
app.use(express.static(__dirname));

// Route to serve the index.html file when visiting the base URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Set a port for the server to listen on
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});