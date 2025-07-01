import React from "react";
import CFooter from "./CFooter";
import Navbar from "./Navbar";

export default function Services() {
  return (
    <div className="bg-[#1A0826] text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header className="text-center py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 shadow-lg">
        <h2 className="text-5xl font-extrabold text-[#E0AFFF] drop-shadow-lg">
          Our Services
        </h2>
        <p className="text-gray-300 mt-4 text-lg max-w-3xl mx-auto">
          Powering smarter fuel management with innovative digital solutions.
        </p>
      </header>

      {/* Services List */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 py-12">
        {[
          {
            img: "/images/credit-fuel.png",
            title: "Credit-Based Fueling",
            desc: "Refuel your vehicles instantly and settle payments later with our credit system.",
          },
          {
            img: "/images/secure-payment.png",
            title: "Secure Digital Payments",
            desc: "Make payments via UPI, cards, or net banking with enterprise-grade security.",
          },
          {
            img: "/images/tracking.png",
            title: "Real-Time Transaction Tracking",
            desc: "Monitor every fuel transaction live to ensure full transparency and accountability.",
          },
          {
            img: "/images/fleet-management.png",
            title: "Fleet Management Solutions",
            desc: "Manage multiple vehicles with centralized control and fuel usage monitoring.",
          },
          {
            img: "/images/analytics.png",
            title: "Fuel Consumption Analytics",
            desc: "Gain insights with detailed analytics on consumption trends and driver behavior.",
          },
          {
            img: "/images/api-integration.png",
            title: "Enterprise API Integration",
            desc: "Seamlessly integrate Petronix services into your existing business ecosystem.",
          },
        ].map((service, index) => (
          <div
            key={index}
            className="p-6 bg-purple-900 rounded-xl shadow-lg text-center transition-transform duration-300 hover:scale-105 hover:bg-purple-800"
          >
            <img
              src={service.img}
              alt={service.title}
              className="w-20 mx-auto mb-4 drop-shadow-lg hover:rotate-3 transition duration-300"
            />
            <h3 className="text-xl font-semibold text-[#E0AFFF]">{service.title}</h3>
            <p className="text-gray-300">{service.desc}</p>
          </div>
        ))}
      </section>

      {/* Why Choose Petronix */}
      <section className="py-12 px-8 max-w-4xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-[#E0AFFF] mb-6">Why Petronix Stands Out?</h3>
        <ul className="text-gray-300 text-lg space-y-4">
          {[
            {
              icon: "⛽",
              title: "One-Stop Fueling Solution",
              desc: "From credit systems to analytics, manage your entire fueling process effortlessly.",
            },
            {
              icon: "🔗",
              title: "Seamless Integrations",
              desc: "Compatible APIs for easy integration with existing enterprise systems.",
            },
            {
              icon: "📡",
              title: "Live Data Access",
              desc: "Track and analyze fuel usage and payments in real-time.",
            },
            {
              icon: "🏆",
              title: "Reliability & Support",
              desc: "24/7 customer support and reliable infrastructure to power your operations.",
            },
          ].map((item, index) => (
            <li
              key={index}
              className="bg-purple-900 p-5 rounded-lg shadow-md hover:scale-105 transition flex items-center space-x-4"
            >
              <span className="text-[#E0AFFF] text-2xl">{item.icon}</span>
              <div>
                <span className="text-[#E0AFFF] font-semibold">{item.title}:</span>{" "}
                <span>{item.desc}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Call to Action */}
      <section className="text-center py-16 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 shadow-lg">
        <h2 className="text-3xl font-bold text-[#E0AFFF] drop-shadow-lg">
          Ready to Elevate Your Fuel Management?
        </h2>
        <p className="text-gray-200 mt-4 text-lg">
          Join Petronix and unlock the full potential of digital fueling solutions.
        </p>
        <a
          href="/register"
          className="mt-6 inline-block px-6 py-3 bg-[#E0AFFF] text-gray-900 font-semibold rounded-full shadow-md text-lg hover:bg-[#D48EFF] transition duration-300"
        >
          Get Started
        </a>
      </section>

      {/* Footer */}
      <CFooter />
    </div>
  );
}
