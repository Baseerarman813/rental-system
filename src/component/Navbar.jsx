import React, { useContext, useEffect, useState } from "react";
import { Link, useNavigate, Routes, Route } from "react-router-dom";
import { getAuth } from "firebase/auth";
import ProductUploadForm from "./ProductUploadForm"; // Import the component we created

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const navigate = useNavigate();
  const auth = getAuth();

  // Check authentication state when component mounts
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    // Clean up subscription
    return () => unsubscribe();
  }, [auth]);

  const handleListItem = () => {
    if (isLoggedIn) {
      setIsModalOpen(true); // Open modal if logged in
    } else {
      navigate("/login"); // Redirect to login if not logged in
    }
  };

  const closeModal = () => {
    setIsModalOpen(false); // Close the modal
  };

  return (
    <>
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="ml-2 text-lg font-semibold">RentHub</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  to="/"
                  className="border-transparent text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Browse
                </Link>
                <Link
                  to="/"
                  className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  How it Works
                </Link>
                <Link
                  to="/"
                  className="border-transparent text-gray-500 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  About
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              {isLoggedIn ? (
                <Link
                  to="/account"
                  className="text-gray-500 hover:text-gray-700 px-3 py-2 text-sm font-medium"
                >
                  My Account
                </Link>
              ) : null}
              <button
                onClick={handleListItem}
                className="ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                List Your Item
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-auto  backdrop-blur-sm flex justify-center items-start mt-20" // Added backdrop-blur-sm
        >
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full relative">
            {/* Close Button (X Icon) */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">List Your Item</h2>
            <ProductUploadForm />
          </div>
        </div>
      )}

      {/* Add Routes component below the Navbar */}
      <Routes>
        <Route path="/list-your-item" element={<ProductUploadForm />} />
        {/* Add other routes as needed */}
      </Routes>
    </>
  );
};

export default Navbar;
