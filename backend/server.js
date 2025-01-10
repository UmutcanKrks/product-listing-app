const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3001;

// Endpoint to get product data
app.get('/api/products', (req, res) => {
    fs.readFile('./products.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to load products.' });
        }
        const products = JSON.parse(data);
        res.json(products);
    });
});

app.listen(PORT, () => {
    console.log(`Backend server is running at http://localhost:${PORT}`);
});
