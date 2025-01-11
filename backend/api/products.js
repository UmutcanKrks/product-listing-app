import axios from "axios";
import fs from "fs";
import path from "path";
import cors from "cors";

// Create the CORS middleware
const corsOptions = {
  origin: ["https://frontend-nine-tau-32.vercel.app", "http://localhost:3000"],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const applyCors = cors(corsOptions);

export default async function handler(req, res) {
  // Apply CORS to all requests
  await new Promise((resolve, reject) => {
    applyCors(req, res, (result) =>
      result instanceof Error ? reject(result) : resolve(result)
    );
  });

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Fetch gold price from GoldAPI
    const goldApiResponse = await axios.get(
      "https://api.gold-api.com/price/XAU"
    );
    const goldPricePerGram = goldApiResponse.data.price / 31.1035; // 1 ounce = 31.1035 grams

    // Use absolute path to access products.json
    const filePath = path.join(process.cwd(), "public", "products.json");
    const products = JSON.parse(fs.readFileSync(filePath, "utf8"));

    // Update product prices
    const updatedProducts = products.map((product) => ({
      ...product,
      price: (
        (product.popularityScore + 1) *
        product.weight *
        goldPricePerGram
      ).toFixed(2),
    }));

    // Filter products based on query params
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

    // Respond with the filtered products
    res.status(200).json(filteredProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to load products." });
  }
}
