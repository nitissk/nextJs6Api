"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { productsApi } from "@/lib/api";
import { useAuthContext } from "@/context/AuthContext";
import { Product } from "@/types/types";

export default function ProductDetailPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const params = useParams();
  const productId = params.id as string;
  const { isAuthenticated, loading: authLoading } = useAuthContext();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = "/login";
      return;
    }

    if (productId) {
      loadProduct();
    }
  }, [productId, isAuthenticated, authLoading]);

  const loadProduct = async () => {
    setLoading(true);
    setError("");

    try {
      const { data, error } = await productsApi.getById(Number(productId));

      if (error) {
        setError(error);
        return;
      }

      if (data) {
        setProduct(data);
      }
    } catch (err) {
      setError("Product not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
              {error}
            </div>
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.thumbnail];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-6">
            <Link
              href="/dashboard"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-square w-full bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={images[currentImageIndex]}
                    alt={product.title}
                    width={500}
                    height={500}
                    className="w-full h-full object-cover"
                  />
                </div>

                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                          index === currentImageIndex
                            ? "border-blue-500"
                            : "border-gray-200"
                        }`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.title}
                  </h1>
                  <p className="text-lg text-gray-600 capitalize">
                    {product.category}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold text-gray-900">
                    ${product.price}
                  </span>
                  {product.discountPercentage > 0 && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm">
                      {product.discountPercentage}% off
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 py-4 border-t border-b border-gray-200">
                  <div>
                    <span className="text-sm text-gray-500">Rating</span>
                    <p className="font-semibold">{product.rating}/5</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Stock</span>
                    <p className="font-semibold">{product.stock} units</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Brand</span>
                    <p className="font-semibold">{product.brand || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Category</span>
                    <p className="font-semibold capitalize">
                      {product.category}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
