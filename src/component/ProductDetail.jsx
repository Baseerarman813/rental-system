
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/Firebase";

const ProductDetail = () => {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productDoc = await getDoc(doc(db, "products", productId));

        if (productDoc.exists()) {
          setProduct({ id: productDoc.id, ...productDoc.data() });
          console.log("Product data:", productDoc.data());
        } else {
          console.error("Product not found");
        }
      } catch (error) {
        console.error("Error fetching product: ", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  // Fetch suggested products when main product is loaded
  useEffect(() => {
    const fetchSuggestedProducts = async () => {
      if (!product) return;

      setLoadingSuggestions(true);
      try {
        // Create a query to fetch products with the same category,
        // excluding the current product
        const q = query(
          collection(db, "products"),
          where("category", "==", product.category || "Electronics"),
          where("__name__", "!=", productId),
          limit(4)
        );

        const querySnapshot = await getDocs(q);
        const suggestedProductsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // If we don't have enough products in the same category, we'll need to fetch more
        if (suggestedProductsData.length < 4) {
          const additionalQ = query(
            collection(db, "products"),
            where("__name__", "!=", productId),
            limit(4 - suggestedProductsData.length)
          );

          const additionalSnapshot = await getDocs(additionalQ);
          const additionalProducts = additionalSnapshot.docs
            .map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
            .filter(
              (p) =>
                p.id !== productId &&
                !suggestedProductsData.some((sp) => sp.id === p.id)
            );

          setSuggestedProducts(
            [...suggestedProductsData, ...additionalProducts].slice(0, 4)
          );
        } else {
          setSuggestedProducts(suggestedProductsData);
        }
      } catch (error) {
        console.error("Error fetching suggested products: ", error);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestedProducts();
  }, [product, productId]);

  if (loading) {
    return (
      <div className="container mx-auto p-4">Loading product details...</div>
    );
  }

  if (!product) {
    return <div className="container mx-auto p-4">Product not found</div>;
  }

  // Default image if imageLinks is empty or undefined
  const mainImage =
    product.imageLinks && product.imageLinks.length > 0
      ? product.imageLinks[selectedImage]
      : "/Images/DSLR.png"; // Default fallback image

  // Safe rendering for specifications
  const renderSpecifications = () => {
    if (
      !product.specifications ||
      !Array.isArray(product.specifications) ||
      product.specifications.length === 0
    ) {
      return (
        <>
          <div className="text-gray-600">Category</div>
          <div className="font-medium">{product.category || "General"}</div>
          <div className="text-gray-600">Brand</div>
          <div className="font-medium">{product.brandName || "Unknown"}</div>
        </>
      );
    }

    return product.specifications.map((spec, index) => (
      <React.Fragment key={index}>
        <div className="text-gray-600">{spec.key}</div>
        <div className="font-medium">{spec.value}</div>
      </React.Fragment>
    ));
  };

  // Safe rendering for tags
  const renderTags = () => {
    if (
      !product.tags ||
      !Array.isArray(product.tags) ||
      product.tags.length === 0
    ) {
      return (
        <span className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm">
          {product.category || "product"}
        </span>
      );
    }

    return product.tags.map((tag, index) => (
      <span
        key={index}
        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-sm"
      >
        {tag}
      </span>
    ));
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Product Images */}
        <div>
          {/* Main Image */}
          <div className="bg-gray-100 rounded-lg overflow-hidden mb-4">
            <img
              src={mainImage}
              alt={product.productName}
              className="w-full h-96 object-contain"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "/Images/default.png";
              }}
            />
          </div>

          {/* Thumbnail Images - Only show if we have multiple images */}
          {product.imageLinks && product.imageLinks.length > 1 ? (
            <div className="grid grid-cols-3 gap-2">
              {product.imageLinks.slice(0, 3).map((image, index) => (
                <div
                  key={index}
                  className={`bg-gray-100 rounded-lg overflow-hidden cursor-pointer ${
                    selectedImage === index ? "ring-2 ring-blue-500" : ""
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image || "/Images/DSLR.png"} // Fallback image
                    alt={`${product.productName} thumbnail ${index + 1}`}
                    className="w-full h-24 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/Images/default.png"; // Fallback for broken images
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">
              No additional images available
            </p>
          )}
        </div>

        {/* Right Column - Product Info */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.productName}</h1>
          <p className="text-gray-600 mb-4">{product.brandName}</p>

          <div className="mb-4">
            <p className="text-sm text-gray-500">
              SKU: {product.sku || `PRD${product.id?.slice(0, 6)}`}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-4xl font-bold text-blue-600">
              ${product.price?.toFixed(2)}
            </h2>
            <p className="text-green-600 flex items-center mt-2">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              In Stock{" "}
              {product.stockQuantity > 0
                ? `(${product.stockQuantity} available)`
                : ""}
            </p>
          </div>

          <div className="mb-6">
            <p className="text-gray-700">
              {product.description || "A high-quality product for your needs."}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Specifications</h3>
            <div className="grid grid-cols-2 gap-y-2">
              {renderSpecifications()}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">{renderTags()}</div>

          <div className="mb-4">
            <p className="flex items-center text-gray-600">
              <svg
                className="w-4 h-4 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                  clipRule="evenodd"
                />
              </svg>
              {product.warehouseLocation || "Warehouse"}
            </p>
          </div>

          <button
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded transition duration-200"
            onClick={() => console.log(`Adding product ${product.id} to cart`)}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Product Suggestions Section */}
      <div className="mt-12 mb-8">
        <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>

        {loadingSuggestions ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading suggestions...</p>
          </div>
        ) : suggestedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {suggestedProducts.map((suggestedProduct) => (
              <Link
                to={`/product/${suggestedProduct.id}`}
                key={suggestedProduct.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                  <img
                    src={suggestedProduct.imageLinks?.[0] || "/Images/DSLR.png"}
                    alt={suggestedProduct.productName}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/Images/default.png";
                    }}
                  />
                </div>
                <div className="p-4">
                  <p className="text-sm text-blue-500">
                    {suggestedProduct.category || "Electronics"}
                  </p>
                  <h3 className="text-lg font-medium text-gray-900 mt-1 truncate">
                    {suggestedProduct.productName || "Unnamed Product"}
                  </h3>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    ${suggestedProduct.price?.toFixed(2) || "0.00"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 border rounded-lg">
            <p className="text-gray-500">No suggested products available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
