import React from "react";

const SafeAndSecure = () => {
  const features = [
    "Verified users and listings",
    "Secure payment processing",
    "Insurance coverage available",
    "24/7 customer support",
  ];

  return (
    <div className="my-16">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="p-8 lg:p-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Safe and Secure Rentals
            </h2>
            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-500"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-700">{feature}</p>
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <a
                href="#"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Learn More
              </a>
            </div>
          </div>
          <div className="relative">
            <img
              className="h-full w-full object-cover"
              src="/Images/customersupport.png"
              alt="Customer support"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafeAndSecure;
