import React from "react";
import StepCard from "./Stepcard";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      title: "Find What You Need",
      description: "Browse thousands of items available for rent in your area",
      image: "/Images/contact.png",
    },
    {
      id: 2,
      title: "Book Securely",
      description:
        "Reserve items with our secure payment system and verification process",
      image: "/Images/phone.png",
    },
    {
      id: 3,
      title: "Rent & Return",
      description: "Pick up your rental items and return them when you're done",
      image: "/Images/return.png",
    },
  ];

  return (
    <div className="my-16">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
        How It Works
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>
    </div>
  );
};

export default HowItWorks;
