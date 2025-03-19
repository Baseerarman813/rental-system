import React from "react";
import CategoryIcon from "./CategoryIcon";
const CategoryBrowser = () => {
  const categories = [
    { id: 1, name: "Tools", icon: "tools", itemCount: 2340 },
    { id: 2, name: "Vehicles", icon: "vehicle", itemCount: 1878 },
    { id: 3, name: "Cameras", icon: "camera", itemCount: 3421 },
    { id: 4, name: "Furniture", icon: "furniture", itemCount: 2789 },
    { id: 5, name: "Electronics", icon: "electronics", itemCount: 4332 },
    { id: 6, name: "Music", icon: "music", itemCount: 1224 },
    { id: 7, name: "Sports", icon: "sports", itemCount: 2156 },
    { id: 8, name: "Home & Garden", icon: "home", itemCount: 1890 },
  ];

  return (
    <div className="my-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">
        Browse by Category
      </h2>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
        {categories.map((category) => (
          <CategoryIcon key={category.id} category={category} />
        ))}
      </div>
    </div>
  );
};

export default CategoryBrowser;
