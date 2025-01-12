"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ProductCard from "./components/ProductCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.css";

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
  const res = await fetch(
    `https://backend-three-liart-33.vercel.app/api/products?${queryParams}`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    minPrice: "1",
    maxPrice: "1000",
    minPopularity: "0",
    maxPopularity: "1",
  });
  const [priceRange, setPriceRange] = useState<[number, number]>([1, 1000]);
  const [popularityRange, setPopularityRange] = useState<[number, number]>([
    0, 5,
  ]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const swiperRef = useRef<any>(null); // Create a reference for Swiper

  const debounce = (callback: (filters: Filters) => void, delay: number) => {
    let timer: NodeJS.Timeout;
    return (filters: Filters) => {
      clearTimeout(timer);
      timer = setTimeout(() => callback(filters), delay);
    };
  };

  const updateFilters = useCallback(
    debounce((newFilters: Filters) => {
      setFilters(newFilters);
    }, 1500),
    []
  );

  useEffect(() => {
    updateFilters({
      minPrice: priceRange[0].toString(),
      maxPrice: priceRange[1].toString(),
      minPopularity: popularityRange[0].toString(),
      maxPopularity: popularityRange[1].toString(),
    });
  }, [priceRange, popularityRange, updateFilters]);

  useEffect(() => {
    const getProducts = async () => {
      setIsLoading(true);
      try {
        const data = await fetchProducts(filters);
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getProducts();
  }, [filters]);

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

      <div className="filters flex flex-wrap gap-6 mb-6 mx-auto">
        {/* Price Range Slider */}
        <div className="filter-item">
          <h2 className="text-sm mb-2">
            Price Range: ${priceRange[0]} - ${priceRange[1]}
          </h2>
          <Slider
            range
            min={1}
            max={1000}
            value={priceRange}
            onChange={(value) => setPriceRange(value as [number, number])}
          />
        </div>

        {/* Popularity Range Slider */}
        <div className="filter-item">
          <h2 className="text-sm mb-2">
            Popularity: {popularityRange[0].toFixed(2)} -{" "}
            {popularityRange[1].toFixed(2)}
          </h2>
          <Slider
            range
            min={0}
            max={5}
            step={0.1}
            value={popularityRange}
            onChange={(value) => setPopularityRange(value as [number, number])}
          />
        </div>
      </div>

      <button
        className="absolute left-0 top-1/2 z-10 -translate-y-1/2"
        onClick={() => swiperRef.current.swiper.slidePrev()}
      >
        <ChevronLeftIcon className="w-16 h-16" />
      </button>

      <button
        className="absolute right-0 top-1/2 z-10 -translate-y-1/2"
        onClick={() => swiperRef.current.swiper.slideNext()}
      >
        <ChevronRightIcon className="w-16 h-16" />
      </button>
      <div className="relative">
        <Swiper
          ref={swiperRef}
          spaceBetween={10}
          slidesPerView={"auto"}
          loop={false}
          grabCursor={true}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
        >
          {products.map((product) => (
            <SwiperSlide
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
