
import React, { useState } from "react";
import { doc, collection, addDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase/Firebase"; // Assuming you have a config file
import { getAuth } from "firebase/auth";

const ProductUploadForm = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    brandName: "",
    sku: "",
    price: "",
    description: "",
    specifications: [{ key: "", value: "" }],
    tags: "",
    imageLinks: [],
    stockQuantity: "",
    warehouseLocation: "",
  });
  const auth = getAuth();
  const user = auth.currentUser;

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle specifications changes
  const handleSpecChange = (index, field, value) => {
    const updatedSpecs = [...formData.specifications];
    updatedSpecs[index] = {
      ...updatedSpecs[index],
      [field]: value,
    };
    setFormData({
      ...formData,
      specifications: updatedSpecs,
    });
  };

  // Add new specification field
  const addSpecification = () => {
    setFormData({
      ...formData,
      specifications: [...formData.specifications, { key: "", value: "" }],
    });
  };

  // Handle image link input
  const handleImageLinkAdd = (link) => {
    setFormData({
      ...formData,
      imageLinks: [...formData.imageLinks, link],
    });
  };

  // Remove image link
  const removeImageLink = (index) => {
    const updatedLinks = [...formData.imageLinks];
    updatedLinks.splice(index, 1);
    setFormData({
      ...formData,
      imageLinks: updatedLinks,
    });
  };

  // Handle image link manual entry
  const handleImageLinkInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      handleImageLinkAdd(e.target.value.trim());
      e.target.value = "";
      e.preventDefault();
    }
  };

  // handle browse file
  const handleBrowseFiles = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.multiple = true;

    fileInput.onchange = (e) => {
      const files = e.target.files;
      if (files.length > 0) {
        // For local development, you can use URL.createObjectURL
        // In production, you'd upload these to storage and get back URLs
        Array.from(files).forEach((file) => {
          const tempUrl = URL.createObjectURL(file);
          handleImageLinkAdd(tempUrl);
        });
      }
    };

    fileInput.click();
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) {
        throw new Error("User not logged in.");
      }

      // Process tags into an array
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      // Format the data with userId
      const productData = {
        productName: formData.productName,
        category: formData.category, // This will now correctly match with AllProducts
        brandName: formData.brandName,
        sku: formData.sku,
        price: parseFloat(formData.price) || 0,
        description: formData.description,
        specifications: formData.specifications.filter(
          (spec) => spec.key && spec.value
        ),
        tags: tagsArray,
        imageLinks: formData.imageLinks,
        stockQuantity: parseInt(formData.stockQuantity) || 0,
        warehouseLocation: formData.warehouseLocation,
        status: isDraft ? "draft" : "published",
        createdAt: new Date().toISOString(),
        userId: user.uid,
      };

      // Add the document to the appropriate Firestore collection
      const collectionName = isDraft ? "productDrafts" : "products";
      const docRef = await addDoc(collection(db, collectionName), productData);
      console.log(
        `Product ${isDraft ? "draft" : ""} added with ID: `,
        docRef.id
      );

      // Reset form after successful submission if not a draft
      if (!isDraft) {
        setFormData({
          productName: "",
          category: "",
          brandName: "",
          sku: "",
          price: "",
          description: "",
          specifications: [{ key: "", value: "" }],
          tags: "",
          imageLinks: [],
          stockQuantity: "",
          warehouseLocation: "",
        });
      }

      alert(
        isDraft ? "Product saved as draft!" : "Product published successfully!"
      );
    } catch (error) {
      console.error("Error adding product: ", error);
      alert("Error adding product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Upload New Product</h1>

      <form onSubmit={(e) => handleSubmit(e, false)}>
        {/* Basic Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Product Name
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter product name"
                required
              />
            </div>

            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Home & Kitchen">Home & Kitchen</option>
                <option value="Clothing">Clothing</option>
                <option value="Beauty & Personal Care">
                  Beauty & Personal Care
                </option>
                <option value="Sports & Outdoors">Sports & Outdoors</option>
                <option value="Books">Books</option>
                <option value="Toys & Games">Toys & Games</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                SKU/Product Code
              </label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter SKU"
                required
              />
            </div>

            <div>
              <label
                htmlFor="brandName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Brand Name
              </label>
              <input
                type="text"
                id="brandName"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter brand name"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Price
              </label>
              <div className="flex items-center">
                <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                  USD
                </span>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-r-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remaining form code unchanged */}
        {/* Product Details */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Product Details</h2>

          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter product description"
              required
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specifications
            </label>
            {formData.specifications.map((spec, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2"
              >
                <input
                  type="text"
                  value={spec.key}
                  onChange={(e) =>
                    handleSpecChange(index, "key", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Key"
                />
                <input
                  type="text"
                  value={spec.value}
                  onChange={(e) =>
                    handleSpecChange(index, "value", e.target.value)
                  }
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Value"
                />
              </div>
            ))}
            <button
              type="button"
              onClick={addSpecification}
              className="mt-2 text-blue-600 text-sm flex items-center"
            >
              + Add More Specification
            </button>
          </div>

          <div>
            <label
              htmlFor="tags"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tags
            </label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Enter tags separated by commas"
            />
          </div>
        </div>

        {/* Product Images */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center mb-4">
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-8m-12 0H8m16 0a4 4 0 010-8m-4 4h3m6-4h3m6-4h3m6-12v8a4 4 0 01-4 4h-4m-12 0h-4m-4-4v-4m-4 4h36"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-2 text-sm text-gray-500">
                Drag and drop your images here
              </p>
              <p className="text-xs text-gray-500">or</p>
              <div className="mt-2">
                <input
                  type="text"
                  placeholder="Paste image URL and press Enter"
                  className="p-2 border border-gray-300 rounded mb-2 w-64"
                  onKeyDown={handleImageLinkInput}
                />
              </div>
              <button
                onClick={handleBrowseFiles}
                type="button"
                className="mt-2 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Files
              </button>
              <p className="mt-2 text-xs text-gray-500">
                Maximum file size 5MB. Supported formats: JPG, PNG
              </p>
            </div>
          </div>

          {formData.imageLinks.length > 0 && (
            <div className="relative border rounded p-4">
              <div className="h-64 overflow-y-auto pr-1">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {formData.imageLinks.map((link, index) => (
                    <div
                      key={index}
                      className="relative border rounded overflow-hidden"
                    >
                      <img
                        src={link}
                        alt={`Product ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageLink(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors z-10"
                        aria-label="Remove image"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Inventory Management */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Inventory Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="stockQuantity"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stock Quantity
              </label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                value={formData.stockQuantity}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
                placeholder="Enter quantity"
                min="0"
              />
            </div>

            <div>
              <label
                htmlFor="warehouseLocation"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Warehouse Location
              </label>
              <select
                id="warehouseLocation"
                name="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select location</option>
                <option value="warehouse1">Warehouse 1</option>
                <option value="warehouse2">Warehouse 2</option>
                <option value="warehouse3">Warehouse 3</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={(e) => handleSubmit(e, true)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Save as Draft
          </button>

          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            disabled={loading}
          >
            Preview
          </button>

          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Publishing..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductUploadForm;
