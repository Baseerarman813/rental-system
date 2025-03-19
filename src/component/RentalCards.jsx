import React from "react";

const RentalCard = ({ item }) => {
  return (
    <div className="bg-white overflow-hidden rounded-lg shadow">
      <div className="relative">
        <img
          className="h-48 w-full object-cover"
          src={item.image}
          alt={item.title}
        />
        <div className="absolute top-2 left-2">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {item.category}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">{item.title}</h3>
        <div className="flex items-center mt-1">
          <svg
            className="h-4 w-4 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
          <p className="ml-1 text-sm text-gray-500">{item.location}</p>
        </div>
        <div className="mt-4 flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-gray-900">
              $ {item.price}
            </span>
            <span className="text-sm text-gray-500">/{item.priceUnit}</span>
          </div>
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-yellow-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="ml-1 text-sm text-gray-600">{item.rating}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalCard;
