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
      "https://www.goldapi.io/api/XAU/USD",
      {
        headers: {
          "x-access-token": "goldapi-45o1h19m5r45w4s-io",
        },
      }
    );

    const goldPricePerGram = goldApiResponse.data.price_gram_24k; // 24k gold price per gram

    fs.readFile("./products.json", "utf8", (err, data) => {
      if (err) {
        return res.status(500).json({ error: "Failed to load products." });
      }

      const products = JSON.parse(data);

      // Calculate the price for each product
      const updatedProducts = products.map((product) => ({
        ...product,
        price: (
          (product.popularityScore + 1) *
          product.weight *
          goldPricePerGram
        ).toFixed(2),
      }));

      res.json(updatedProducts);
    });
  } catch (error) {
    console.error("Error fetching gold price:", error);
    res.status(500).json({ error: "Failed to fetch gold price." });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
