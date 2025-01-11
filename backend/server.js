const express = require("express");
const fs = require("fs");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());

app.get("/api/products", async (req, res) => {
  try {
    // Fetch gold price from GoldAPI
    const goldApiResponse = await axios.get(
      "https://api.gold-api.com/price/XAU"
    );

    const goldPricePerGram = goldApiResponse.data.price / 31.1035; // 1 ounce = 31.1035 grams

    fs.readFile("./products.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading products file:", err);
        return res.status(500).json({ error: "Failed to load products." });
      }

      const products = JSON.parse(data);

      const updatedProducts = products.map((product) => ({
        ...product,
        price: (
          (product.popularityScore + 1) *
          product.weight *
          goldPricePerGram
        ).toFixed(2),
      }));

      // filters
      const { minPrice, maxPrice, minPopularity, maxPopularity } = req.query;

      const filteredProducts = updatedProducts.filter((product) => {
        const price = parseFloat(product.price);
        const popularity = product.popularityScore;

        const minPop = minPopularity ? parseFloat(minPopularity) : -Infinity;
        const maxPop = maxPopularity ? parseFloat(maxPopularity) : Infinity;

        return (
          (minPrice ? price >= parseFloat(minPrice) : true) &&
          (maxPrice ? price <= parseFloat(maxPrice) : true) &&
          popularity >= minPop &&
          popularity <= maxPop 
        );
      });

      res.json(filteredProducts);
    });
  } catch (error) {
    console.error("Error fetching gold price:", error);
    res.status(500).json({ error: "Failed to fetch gold price." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
