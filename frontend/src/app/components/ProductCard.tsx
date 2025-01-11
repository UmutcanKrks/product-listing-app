"use client";

import React, { useState, useEffect } from "react";
import Image from 'next/image';

interface ProductCardProps {
  title: string;
  price: string;
  rating: number;
  colors: { name: string; colorCode: string; imageUrl: string }[];
}

const ProductCard: React.FC<ProductCardProps> = ({
  title,
  price,
  rating,
  colors,
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedGoldType, setSelectedGoldType] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (colors.length > 0) {
      setSelectedImage(colors[0].imageUrl);
      setSelectedGoldType(colors[0].name);
    }
  }, [colors]);

  if (!isClient) {
    return null;
  }

  const handleColorClick = (imageUrl: string, goldType: string) => {
    setSelectedImage(imageUrl);
    setSelectedGoldType(goldType);
  };

  const renderStars = () => {
    const filledStars = Math.floor(rating);
    const emptyStars = 5 - filledStars;

    return (
      <>
        {Array(filledStars)
          .fill(null)
          .map((_, i) => (
            <span key={`filled-${i}`} className="text-2xl gold-yellow ">
              &#9733;
            </span>
          ))}
        {Array(emptyStars)
          .fill(null)
          .map((_, i) => (
            <span key={`empty-${i}`} className="text-2xl text-gray-300 ">
              &#9733;
            </span>
          ))}
      </>
    );
  };

  return (
    <div className="rounded-lg p-4 text-start max-w-xs mx-auto">
      <Image
  src={selectedImage ?? colors[0]?.imageUrl}
  alt={title}
  className="w-full h-56 rounded-2xl mb-4 object-cover object-center shadow-none"
  width={320}
  height={224}
/>
      <h3 className="f-montserrat-medium fs-3 mb-1 ">{title}</h3>
      <p className="montserrat-regular fs-3 mb-5">${price} USD</p>
      <div className="flex justify-start gap-2 mb-3">
        {colors.map((color) => (
          <button
            key={color.name}
            className={`gold-dot ${
              selectedImage === color.imageUrl
                ? "ring-1 ring-gray-600 ring-offset-2"
                : ""
            }`}
            style={{ backgroundColor: color.colorCode }}
            onClick={() => handleColorClick(color.imageUrl, color.name)}
          />
        ))}
      </div>
      <p className="gold-type f-avenir fs-1 mb-1">{selectedGoldType} Gold</p>
      <div className="flex items-center review-rating">
        {renderStars()}
        <span className="ml-3 fs-2 f-avenir mt-1.5">{rating.toFixed(1)}/5</span>
      </div>
    </div>
  );
};

export default ProductCard;
