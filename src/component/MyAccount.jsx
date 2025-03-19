
import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/Firebase";

const MyAccount = ({ user }) => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [activeTab, setActiveTab] = useState("published");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      console.log("User signed out successfully");
      navigate("/"); // Redirect to home page after sign out
    } catch (error) {
      console.error("Sign out error:", error.message);
    }
  };

  // Fetch user's products based on active tab
  useEffect(() => {
    const fetchUserProducts = async () => {
      if (!user) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const status = activeTab === "published" ? "published" : "draft";
        console.log(`Fetching ${status} products for user:`, user.uid);

        const q = query(
          collection(db, "products"),
          where("userId", "==", user.uid),
          where("status", "==", status)
        );

        const querySnapshot = await getDocs(q);
        const userProducts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (userProducts.length === 0) {
          console.log(`No ${status} products found for user.`);
        }

        setProducts(userProducts);
      } catch (error) {
        console.error("Error fetching user products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProducts();
  }, [user, activeTab]);

  // Handle product deletion
  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteDoc(doc(db, "products", productId));
      setProducts(products.filter((product) => product.id !== productId));
      console.log("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      setError("Failed to delete product. Please try again.");
    }
  };

  // Handle changing product status (publish draft or unpublish product)
  const handleChangeStatus = async (productId, currentStatus) => {
    try {
      const newStatus = currentStatus === "published" ? "draft" : "published";
      const updateData = {
        status: newStatus,
        updated: serverTimestamp(),
        updatedBy: {
          uid: user.uid,
          displayName: user.displayName || "Unknown User",
          email: user.email,
          photoURL: user.photoURL || "",
        },
      };

      if (newStatus === "published") {
        updateData.publishedBy = {
          uid: user.uid,
          displayName: user.displayName || "Unknown User",
          email: user.email,
          photoURL: user.photoURL || "",
          publishedAt: serverTimestamp(),
        };
      }

      await updateDoc(doc(db, "products", productId), updateData);
      setProducts((prevProducts) =>
        prevProducts.map((product) =>
          product.id === productId ? { ...product, status: newStatus } : product
        )
      );
      console.log(
        `Product ${
          currentStatus === "published" ? "unpublished" : "published"
        } successfully`
      );
    } catch (error) {
      console.error("Error updating product status:", error);
      setError("Failed to update product status. Please try again.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-2xl font-semibold">My Account</h2>
      <div className="flex items-center mt-6">
        {/* Profile Image */}
        <img
          src={user?.photoURL || "/Images/profile.png"} // Default profile if no image
          alt="Profile"
          className="h-16 w-16 rounded-full"
        />
        <div className="ml-4">
          <h3 className="text-xl font-medium">{user?.displayName}</h3>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>
      <div className="mt-8">
        <button
          onClick={handleSignOut}
          className="text-white bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md"
        >
          Sign Out
        </button>
      </div>
      {/* Product Management Section */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold mb-4">My Products</h3>
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "published"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("published")}
          >
            Published Products
          </button>
          <button
            className={`py-2 px-4 font-medium ${
              activeTab === "draft"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => setActiveTab("draft")}
          >
            Drafts
          </button>
        </div>
        {/* Add New Product Button */}
        <div className="mb-6">
          <Link
            to="/add-product"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Product
          </Link>
        </div>
        {/* Products List */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading products...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : products.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {products.map((product) => (
                <li key={product.id}>
                  <div className="flex items-center px-4 py-4 sm:px-6">
                    <div className="min-w-0 flex-1 flex items-center">
                      {/* Product Image */}
                      <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={product.imageLinks?.[0] || "/Images/DSLR.png"}
                          alt={product.productName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      {/* Product Info */}
                      <div className="min-w-0 flex-1 px-4">
                        <div>
                          <p className="text-sm font-medium text-blue-600 truncate">
                            {product.productName || "Unnamed Product"}
                          </p>
                          <p className="mt-1 text-sm text-gray-500 truncate">
                            ${product.price?.toFixed(2) || "0.00"} ·{" "}
                            {product.category || "General"}
                          </p>
                          {product.status === "draft" && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              Draft
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Link
                        to={`/edit-product/${product.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-sm"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() =>
                          handleChangeStatus(product.id, product.status)
                        }
                        className={`${
                          product.status === "published"
                            ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                            : "bg-green-100 hover:bg-green-200 text-green-800"
                        } px-3 py-1 rounded-md text-sm`}
                      >
                        {product.status === "published"
                          ? "Unpublish"
                          : "Publish"}
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-md text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No {activeTab === "published" ? "published products" : "drafts"}{" "}
              found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating a new product.
            </p>
            <div className="mt-6">
              <Link
                to="/add-product"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Product
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
