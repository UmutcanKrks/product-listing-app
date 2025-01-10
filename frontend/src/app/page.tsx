"use client";
import ProductCard from "./components/ProductCard";
import { useState, useEffect, useRef } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

interface Product {
  name: string;
  price: string;
  weight: number;
  popularityScore: number;
  images: { yellow: string; rose: string; white: string };
}

const fetchProducts = async (): Promise<Product[]> => {
  const res = await fetch("http://localhost:3001/api/products");
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const container = scrollRef.current;
      container.scrollLeft +=
        direction === "right" ? scrollAmount : -scrollAmount;
    }
  };

  // Display loading state while fetching data
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center h-screen flex flex-col justify-center">
        <h1 className="fs-4 f-avenir">Loading Products...</h1>
      </div>
    );
  }

  return (
    <div className="container-xl h-screen flex flex-col justify-center sm:mx-16">
      <h1 className="fs-4 f-avenir text-center mb-6">Product List</h1>

      <div className="relative">
        <button
          className="absolute border-none left-0 top-1/2 hidden md:block"
          onClick={() => handleScroll("left")}
        >
          <ChevronLeftIcon className="w-16 h-16" />
        </button>

        <div
          ref={scrollRef}
          className="scroll-container flex flex-col md:flex-row overflow-x-auto gap-x-4 py-4 max-h-[80vh] scroll-smooth sm:mx-4 md:mx-16 pb-16"
        >
          {products.map((product) => (
            <div
              key={product.name}
              className="flex-shrink-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4"
            >
              <ProductCard
                title={product.name}
                price={product.price}
                rating={product.popularityScore * 5}
                colors={[
                  {
                    name: "Yellow",
                    colorCode: "#E6CA97",
                    imageUrl: product.images.yellow,
                  },
                  {
                    name: "White",
                    colorCode: "#D9D9D9",
                    imageUrl: product.images.white,
                  },
                  {
                    name: "Rose",
                    colorCode: "#E1A4A9",
                    imageUrl: product.images.rose,
                  },
                ]}
              />
            </div>
          ))}
        </div>

        <button
          className="absolute border-none top-1/2 right-0 hidden md:block"
          onClick={() => handleScroll("right")}
        >
          <ChevronRightIcon className="w-16 h-16" />
        </button>
      </div>
    </div>
  );
}
