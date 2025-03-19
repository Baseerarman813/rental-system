import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/Firebase";
import Navbar from "./component/Navbar";
import Hero from "./component/Hero";
import FeaturedRentals from "./component/FeaturedRentals";
import CategoryBrowser from "./component/CategoryBrowser";
import HowItWorks from "./component/HowItWorks";
import SafeAndSecure from "./component/SafeAndSecure";
import Footer from "./component/Footer"; // Import Footer
import AuthPage from "./component/AuthPage";
import MyAccount from "./component/MyAccount";
import ProductUploadForm from "./component/ProductUploadForm"; // Import the ProductUploadForm component
import ProductDetail from "./component/ProductDetail";
import AllProducts from "./component/AllProducts";

// Main App component
function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth state at the top level
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Update user state
      setAuthChecked(true); // Mark auth check as complete
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Show loading state while checking authentication
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-white flex flex-col">
        {/* Always render Navbar */}
        <Navbar />

        {/* Render routes */}
        <div className="flex-grow">
          <AppRoutes user={user} />
        </div>

        {/* Always render Footer */}
        <Footer />
      </div>
    </Router>
  );
}

// Routes component to handle all application routes
const AppRoutes = ({ user }) => {
  return (
    <Routes>
      {/* Auth route - redirects to home if logged in */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/" replace /> : <AuthPage />}
      />
      {/* Home route - redirects to auth if not logged in */}
      <Route
        path="/"
        element={user ? <HomePage /> : <Navigate to="/auth" replace />}
      />
      {/* My Account route */}
      <Route
        path="/account"
        element={
          user ? <MyAccount user={user} /> : <Navigate to="/auth" replace />
        }
      />
      {/* Add Product Upload Form route */}
      <Route
        path="/list-your-item"
        element={user ? <ProductUploadForm /> : <Navigate to="/auth" replace />}
      />
      {/* Fallback route */}
      <Route
        path="*"
        element={<Navigate to={user ? "/" : "/auth"} replace />}
      />
      <Route path="/product/:productId" element={<ProductDetail />} />
      <Route path="/all-products" element={<AllProducts />} />{" "}
      {/* Add the new route */}
    </Routes>
  );
};

// Home page component
const HomePage = () => (
  <>
    <Hero />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <FeaturedRentals />
      <CategoryBrowser />
      <HowItWorks />
      <SafeAndSecure />
    </div>
  </>
);

export default App;
