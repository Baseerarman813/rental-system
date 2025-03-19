import React from "react";

const StepCard = ({ step }) => {
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        <img
          src={step.image}
          alt={step.title}
          className="w-64 h-24 object-cover rounded-lg"
        />
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white h-8 w-8 rounded-full flex items-center justify-center text-lg font-bold">
          {step.id}
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
      <p className="text-gray-600 text-center">{step.description}</p>
    </div>
  );
};

export default StepCard;
