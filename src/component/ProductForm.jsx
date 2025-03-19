import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  collection,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase/Firebase";
import { getAuth } from "firebase/auth";

const ProductForm = () => {
  const { productId } = useParams(); // For edit mode
  const navigate = useNavigate();
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [isLoading, setIsLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [imagePreview, setImagePreview] = useState(null);

  const [formData, setFormData] = useState({
    productName: "",
    description: "",
    price: "",
    category: "Electronics",
    brandName: "",
    imageLinks: [""],
    status: "draft", // Default to draft
    stockQuantity: 1,
    tags: [],
    features: [""],
    specifications: {
      weight: "",
      dimensions: "",
      color: "",
      material: "",
    },
    shipping: {
      free: false,
      price: "0",
      estimatedDelivery: "3-5 business days",
    },
  });

  const categories = [
    "Electronics",
    "Clothing",
    "Home & Kitchen",
    "Beauty & Personal Care",
    "Sports & Outdoors",
    "Toys & Games",
    "Books",
    "Automotive",
    "Health & Wellness",
    "Other",
  ];

  // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (productId) {
        setIsEdit(true);
        setIsLoading(true);
        try {
          const productDoc = await getDoc(doc(db, "products", productId));
          if (productDoc.exists()) {
            const productData = productDoc.data();

            // Set default values for any missing fields
            const updatedData = {
              ...formData,
              ...productData,
              price: productData.price?.toString() || "",
              stockQuantity: productData.stockQuantity?.toString() || "1",
              features: productData.features || [""],
              specifications: {
                weight: productData.specifications?.weight || "",
                dimensions: productData.specifications?.dimensions || "",
                color: productData.specifications?.color || "",
                material: productData.specifications?.material || "",
              },
              shipping: {
                free: productData.shipping?.free || false,
                price: productData.shipping?.price?.toString() || "0",
                estimatedDelivery:
                  productData.shipping?.estimatedDelivery ||
                  "3-5 business days",
              },
            };

            setFormData(updatedData);

            // Set preview image if available
            if (productData.imageLinks?.[0]) {
              setImagePreview(productData.imageLinks[0]);
            }
          } else {
            console.error("Product not found");
            setFormError("Product not found");
            // Navigate after a short delay
            setTimeout(() => navigate("/my-account"), 3000);
          }
        } catch (error) {
          console.error("Error fetching product:", error);
          setFormError("Error loading product data. Please try again.");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();
  }, [productId, navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked,
    });
  };

  // Handle nested object updates (specifications, shipping)
  const handleNestedInputChange = (category, field, value) => {
    setFormData({
      ...formData,
      [category]: {
        ...formData[category],
        [field]: value,
      },
    });
  };

  // Handle shipping checkbox specifically
  const handleShippingFreeChange = (e) => {
    const { checked } = e.target;
    setFormData({
      ...formData,
      shipping: {
        ...formData.shipping,
        free: checked,
        price: checked ? "0" : formData.shipping.price,
      },
    });
  };

  // Handle image link changes
  const handleImageLinkChange = (index, value) => {
    const updatedImageLinks = [...formData.imageLinks];
    updatedImageLinks[index] = value;
    setFormData({
      ...formData,
      imageLinks: updatedImageLinks,
    });

    if (index === 0) {
      setImagePreview(value);
    }
  };

  // Add new image link field
  const addImageLinkField = () => {
    setFormData({
      ...formData,
      imageLinks: [...formData.imageLinks, ""],
    });
  };

  // Remove image link field
  const removeImageLinkField = (index) => {
    const updatedImageLinks = formData.imageLinks.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      imageLinks: updatedImageLinks.length > 0 ? updatedImageLinks : [""],
    });
  };

  // Handle features update
  const handleFeatureChange = (index, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({
      ...formData,
      features: updatedFeatures,
    });
  };

  // Add new feature field
  const addFeatureField = () => {
    setFormData({
      ...formData,
      features: [...formData.features, ""],
    });
  };

  // Remove feature field
  const removeFeatureField = (index) => {
    const updatedFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      features: updatedFeatures.length > 0 ? updatedFeatures : [""],
    });
  };

  // Handle tags input
  const handleTagsChange = (e) => {
    const value = e.target.value;
    // Split by commas and remove whitespace
    const tagArray = value
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setFormData({
      ...formData,
      tags: tagArray,
    });
  };

  // Validate form
  const validateForm = () => {
    if (!formData.productName.trim()) {
      setFormError("Product name is required");
      return false;
    }
    if (
      !formData.price.trim() ||
      isNaN(formData.price) ||
      parseFloat(formData.price) < 0
    ) {
      setFormError("Valid price is required");
      return false;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required");
      return false;
    }
    if (!formData.imageLinks[0]?.trim()) {
      setFormError("At least one image link is required");
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e, status = "draft") => {
    e.preventDefault();

    if (!currentUser) {
      setFormError("You must be logged in to create or edit products");
      return;
    }

    if (!validateForm()) {
      window.scrollTo(0, 0); // Scroll to top to see error
      return;
    }

    setIsLoading(true);
    setFormError("");

    try {
      // Format data for Firestore
      const productData = {
        productName: formData.productName.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price) || 0,
        category: formData.category,
        brandName: formData.brandName.trim(),
        imageLinks: formData.imageLinks.filter((link) => link.trim()),
        status: status, // Use the status passed from the button click
        stockQuantity: parseInt(formData.stockQuantity) || 1,
        tags: formData.tags,
        features: formData.features.filter((feature) => feature.trim()),
        specifications: {
          weight: formData.specifications.weight.trim(),
          dimensions: formData.specifications.dimensions.trim(),
          color: formData.specifications.color.trim(),
          material: formData.specifications.material.trim(),
        },
        shipping: {
          free: formData.shipping.free,
          price: parseFloat(formData.shipping.price) || 0,
          estimatedDelivery: formData.shipping.estimatedDelivery.trim(),
        },
        updated: serverTimestamp(),
      };

      if (isEdit) {
        // Update existing product
        await updateDoc(doc(db, "products", productId), productData);
        setFormSuccess(
          `Product successfully ${
            status === "published" ? "published" : "saved as draft"
          }`
        );
      } else {
        // Create new product
        const newProductData = {
          ...productData,
          userId: currentUser.uid,
          created: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "products"), newProductData);
        setFormSuccess(
          `Product successfully ${
            status === "published" ? "published" : "saved as draft"
          } with ID: ${docRef.id}`
        );
      }

      // Redirect after success message (with delay)
      setTimeout(() => {
        navigate("/my-account");
      }, 2000);
    } catch (error) {
      console.error("Error saving product:", error);
      setFormError("Error saving product. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Preview image if URL is valid
  const validateAndPreviewImage = (url) => {
    const img = new Image();
    img.onload = () => setImagePreview(url);
    img.onerror = () => setImagePreview(null);
    img.src = url;
  };

  // Check image URL when first link changes
  useEffect(() => {
    if (formData.imageLinks[0]) {
      validateAndPreviewImage(formData.imageLinks[0]);
    }
  }, [formData.imageLinks[0]]);

  if (isLoading && !formData.productName) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4">Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        <Link
          to="/my-account"
          className="text-blue-500 hover:text-blue-700 flex items-center"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back to My Account
        </Link>
      </div>

      {formError && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">{formError}</span>
        </div>
      )}

      {formSuccess && (
        <div
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6"
          role="alert"
        >
          <span className="block sm:inline">{formSuccess}</span>
        </div>
      )}

      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white shadow-md rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="productName"
              >
                Product Name*
              </label>
              <input
                id="productName"
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="price"
              >
                Price ($)*
              </label>
              <input
                id="price"
                type="number"
                name="price"
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="category"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="brandName"
              >
                Brand Name
              </label>
              <input
                id="brandName"
                type="text"
                name="brandName"
                value={formData.brandName}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="stockQuantity"
              >
                Stock Quantity
              </label>
              <input
                id="stockQuantity"
                type="number"
                name="stockQuantity"
                min="0"
                value={formData.stockQuantity}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="tags"
              >
                Tags (comma-separated)
              </label>
              <input
                id="tags"
                type="text"
                name="tags"
                value={formData.tags.join(", ")}
                onChange={handleTagsChange}
                placeholder="e.g. wireless, bluetooth, headphones"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div className="mb-6">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="imageLinks"
              >
                Product Images*
              </label>
              {formData.imageLinks.map((link, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="text"
                    value={link}
                    onChange={(e) =>
                      handleImageLinkChange(index, e.target.value)
                    }
                    placeholder="Image URL"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
                  />
                  <button
                    type="button"
                    onClick={() => removeImageLinkField(index)}
                    disabled={formData.imageLinks.length === 1}
                    className={`p-2 rounded-full ${
                      formData.imageLinks.length === 1
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-500 hover:bg-red-100"
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addImageLinkField}
                className="text-blue-500 hover:text-blue-700 flex items-center text-sm mt-2"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                Add Another Image
              </button>
            </div>

            {imagePreview && (
              <div className="mb-6">
                <p className="text-gray-700 text-sm font-bold mb-2">
                  Image Preview
                </p>
                <div className="w-full h-48 border rounded-md overflow-hidden">
                  <img
                    src={imagePreview}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/Images/DSLR.png"; // Fallback image
                    }}
                  />
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Shipping Options
              </label>
              <div className="mb-2">
                <input
                  id="freeShipping"
                  type="checkbox"
                  checked={formData.shipping.free}
                  onChange={handleShippingFreeChange}
                  className="mr-2"
                />
                <label htmlFor="freeShipping" className="text-gray-700">
                  Free Shipping
                </label>
              </div>
              {!formData.shipping.free && (
                <input
                  type="number"
                  value={formData.shipping.price}
                  onChange={(e) =>
                    handleNestedInputChange("shipping", "price", e.target.value)
                  }
                  placeholder="Shipping Price"
                  min="0"
                  step="0.01"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-2"
                />
              )}
              <input
                type="text"
                value={formData.shipping.estimatedDelivery}
                onChange={(e) =>
                  handleNestedInputChange(
                    "shipping",
                    "estimatedDelivery",
                    e.target.value
                  )
                }
                placeholder="Estimated Delivery Time"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        </div>

        {/* Full width fields */}
        <div className="mb-6">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description*
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          ></textarea>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Key Features
          </label>
          {formData.features.map((feature, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={feature}
                onChange={(e) => handleFeatureChange(index, e.target.value)}
                placeholder="Feature"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mr-2"
              />
              <button
                type="button"
                onClick={() => removeFeatureField(index)}
                disabled={formData.features.length === 1}
                className={`p-2 rounded-full ${
                  formData.features.length === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-red-500 hover:bg-red-100"
                }`}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addFeatureField}
            className="text-blue-500 hover:text-blue-700 flex items-center text-sm mt-2"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add Another Feature
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Specifications
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <input
                type="text"
                value={formData.specifications.weight}
                onChange={(e) =>
                  handleNestedInputChange(
                    "specifications",
                    "weight",
                    e.target.value
                  )
                }
                placeholder="Weight"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.specifications.dimensions}
                onChange={(e) =>
                  handleNestedInputChange(
                    "specifications",
                    "dimensions",
                    e.target.value
                  )
                }
                placeholder="Dimensions"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.specifications.color}
                onChange={(e) =>
                  handleNestedInputChange(
                    "specifications",
                    "color",
                    e.target.value
                  )
                }
                placeholder="Color"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <input
                type="text"
                value={formData.specifications.material}
                onChange={(e) =>
                  handleNestedInputChange(
                    "specifications",
                    "material",
                    e.target.value
                  )
                }
                placeholder="Material"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <h3 className="text-lg font-medium mb-2">Publishing Options</h3>
          <p className="text-sm text-gray-600 mb-4">
            {isEdit
              ? "Update your product status:"
              : "Choose to save as draft or publish immediately:"}
          </p>
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "draft")}
              disabled={isLoading}
              className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-6 rounded-md w-full sm:w-auto flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                  />
                </svg>
              )}
              Save as Draft
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, "published")}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md w-full sm:w-auto flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              )}
              {isEdit ? "Update & Publish" : "Publish Now"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
