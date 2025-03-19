
import React, { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "../firebase/Firebase";
import { Link } from "react-router-dom";

const AllProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Define categories exactly as they appear in the upload form
  const categories = [
    "All",
    "Electronics",
    "Home & Kitchen",
    "Clothing",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Books",
    "Toys & Games",
    "Other",
  ];

  // Fetch all products from Firestore
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        // Create a query to fetch all products ordered by createdAt
        const q = query(
          collection(db, "products"),
          orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // console.log("Fetched products:", productsData); // Debug log to check data
        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (error) {
        console.error("Error fetching products: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  // Filter products when search term or category changes
  useEffect(() => {
    if (products.length > 0) {
      let results = [...products];

      // Filter by category
      if (selectedCategory !== "All") {
        results = results.filter(
          (product) => product.category === selectedCategory
        );
      }

      // Filter by search term (title or tags)
      if (searchTerm) {
        const searchTermLower = searchTerm.toLowerCase();
        results = results.filter(
          (product) =>
            // Search in product name
            product.productName?.toLowerCase().includes(searchTermLower) ||
            // Search in tags (if tags is an array)
            (Array.isArray(product.tags) &&
              product.tags.some((tag) =>
                tag.toLowerCase().includes(searchTermLower)
              ))
        );
      }

      setFilteredProducts(results);
    }
  }, [searchTerm, selectedCategory, products]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header and filter options */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">All Products</h1>
          <div className="flex items-center">
            <button
              className={`p-2 border ${
                viewMode === "grid" ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setViewMode("grid")}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path>
              </svg>
            </button>
            <button
              className={`p-2 border rounded-r ${
                viewMode === "list" ? "bg-blue-500 text-white" : ""
              }`}
              onClick={() => setViewMode("list")}
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search by product name or tags..."
            className="w-full p-2 border rounded"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              className={`px-3 py-1 text-sm border rounded-full ${
                selectedCategory === category
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Product display */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-center text-gray-500">Loading products...</p>
        </div>
      ) : (
        <>
          {/* Results count */}
          <div className="mb-4">
            <p className="text-gray-600">
              {filteredProducts.length} products found
            </p>
          </div>

          {/* Product Grid or List View */}
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link to={`/product/${product.id}`}>
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200">
                        <img
                          src={product.imageLinks?.[0] || "/Images/DSLR.png"}
                          alt={product.productName}
                          className="w-full h-48 object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-blue-500">
                          {product.category || "Other"}
                        </p>
                        <h3 className="text-lg font-medium text-gray-900 mt-1">
                          {product.productName || "Unnamed Product"}
                        </h3>
                        <p className="text-xl font-bold text-gray-900 mt-1">
                          ${product.price || 0}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Stock: {product.stockQuantity || 10}
                        </p>
                        {product.tags && product.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {product.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block bg-gray-100 px-2 py-1 text-xs rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="col-span-full flex justify-center items-center h-64">
                  <p className="text-center text-gray-500">
                    No products match your search criteria.
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <Link to={`/product/${product.id}`}>
                      <div className="flex">
                        <div className="w-48 h-48 bg-gray-200">
                          <img
                            src={product.imageLinks?.[0] || "/Images/DSLR.png"}
                            alt={product.productName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-grow">
                          <p className="text-sm text-blue-500">
                            {product.category || "Other"}
                          </p>
                          <h3 className="text-lg font-medium text-gray-900 mt-1">
                            {product.productName || "Unnamed Product"}
                          </h3>
                          <p className="text-xl font-bold text-gray-900 mt-1">
                            ${product.price || 0}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Stock: {product.stockQuantity || 10}
                          </p>
                          {product.tags && product.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {product.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-block bg-gray-100 px-2 py-1 text-xs rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-center text-gray-500">
                    No products match your search criteria.
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AllProducts;
