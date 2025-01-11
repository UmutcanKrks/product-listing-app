"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "./components/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";

interface Product {
  name: string;
  price: string;
  weight: number;
  popularityScore: number;
  images: { yellow: string; rose: string; white: string };
}

interface Filters {
  minPrice: string;
  maxPrice: string;
  minPopularity: string;
  maxPopularity: string;
}

const fetchProducts = async (filters: Filters): Promise<Product[]> => {
  const queryParams = new URLSearchParams(
    Object.entries(filters).map(([key, value]) => [key, String(value)])
  );
  const res = await fetch(`https://backend-three-liart-33.vercel.app/api/products?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    minPrice: "",
    maxPrice: "",
    minPopularity: "",
    maxPopularity: "",
  });
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>(filters);
  const scrollRef = useRef<HTMLDivElement>(null);

  const debounce = (callback: (filters: Filters) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (filters: Filters) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(filters), delay);
    };
  };

  const updateFilters = useCallback(
    debounce((newFilters: Filters) => {
      setDebouncedFilters(newFilters);
    }, 1500),
    []
  );

  useEffect(() => {
    updateFilters(filters);
  }, [filters, updateFilters]);

  useEffect(() => {
    const getProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts(debouncedFilters);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, [debouncedFilters]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const container = scrollRef.current;
      container.scrollLeft +=
        direction === "right" ? scrollAmount : -scrollAmount;
    }
  };

  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

      <div className="filters flex flex-wrap gap-4 mb-6 mx-auto">
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="minPopularity"
          placeholder="Min Popularity"
          value={filters.minPopularity}
          onChange={handleFilterChange}
          step="0.01"
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="maxPopularity"
          placeholder="Max Popularity"
          value={filters.maxPopularity}
          onChange={handleFilterChange}
          step="0.01"
          className="border p-2 rounded"
        />
      </div>

      <div className="relative">
        {products.length > 4 && (
          <button
            className="absolute border-none left-0 top-1/2 hidden md:block"
            onClick={() => handleScroll("left")}
          >
            <ChevronLeftIcon className="w-16 h-16" />
          </button>
        )}

        <div
          ref={scrollRef}
          className={`scroll-container flex flex-col md:flex-row overflow-x-auto gap-x-4 py-4 max-h-[80vh] scroll-smooth sm:mx-4 md:mx-16 pb-16 ${
            products.length <= 4 ? "hide-scrollbar" : ""
          }`}
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

        {products.length > 4 && (
          <button
            className="absolute border-none top-1/2 right-0 hidden md:block"
            onClick={() => handleScroll("right")}
          >
            <ChevronRightIcon className="w-16 h-16" />
          </button>
        )}
      </div>
    </div>
  );
}
