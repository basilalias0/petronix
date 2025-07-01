import React from "react";
import CFooter from "./CFooter";
import Navbar from "./Navbar";

export default function About() {
  return (
    <div className="bg-[#1A0826] text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header className="text-center py-20 bg-gradient-to-r from-purple-900 via-purple-800 to-purple-700 shadow-lg">
        <h2 className="text-5xl font-extrabold text-[#E0AFFF] drop-shadow-lg">
          About Petronix
        </h2>
        <p className="text-gray-300 mt-4 text-lg max-w-3xl mx-auto">
          Transforming fuel payments with cutting-edge technology and seamless transactions.
        </p>
      </header>

      {/* Mission & Vision */}
      <section className="py-12 px-8 max-w-5xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-[#E0AFFF] mb-6">Our Mission & Vision</h3>
        <p className="text-gray-300 text-lg leading-relaxed">
          At <span className="text-[#E0AFFF] font-semibold">Petronix</span>, we aim to revolutionize fuel payments through **secure digital transactions** and **credit-based fueling**.  
          We ensure **efficiency, security, and transparency** for all users.
        </p>
      </section>

      {/* Key Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 px-10 py-12">
        {[
          {
            img: "/images/credit-fuel.png",
            title: "Credit-Based Fueling",
            desc: "Refuel anytime and pay later with our flexible credit options.",
          },
          {
            img: "/images/secure-payment.png",
            title: "Seamless Transactions",
            desc: "Experience instant payments through UPI, cards, and net banking.",
          },
          {
            img: "/images/tracking.png",
            title: "Real-Time Monitoring",
            desc: "Track your fuel usage, transactions, and credit balance efficiently.",
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-purple-900 rounded-xl shadow-lg text-center transition-transform duration-300 hover:scale-105 hover:bg-purple-800"
          >
            <img
              src={feature.img}
              alt={feature.title}
              className="w-20 mx-auto mb-4 drop-shadow-lg hover:rotate-3 transition duration-300"
            />
            <h3 className="text-xl font-semibold text-[#E0AFFF]">{feature.title}</h3>
            <p className="text-gray-300">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* Why Choose Us */}
      <section className="py-12 px-8 max-w-4xl mx-auto text-center">
        <h3 className="text-4xl font-bold text-[#E0AFFF] mb-6">Why Choose Petronix?</h3>
        <ul className="text-gray-300 text-lg space-y-4">
          {[
            {
              icon: "⚡",
              title: "Speed & Convenience",
              desc: "No need to carry cash—pay seamlessly anytime, anywhere.",
            },
            {
              icon: "🔒",
              title: "Advanced Security",
              desc: "End-to-end encryption ensures safe and secure transactions.",
            },
            {
              icon: "💳",
              title: "Flexible Credit System",
              desc: "Manage your fuel expenses easily without upfront payments.",
            },
            {
              icon: "📊",
              title: "Transparent Fuel Tracking",
              desc: "Real-time insights into your fuel usage and transactions.",
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
          Join Petronix for a Smarter Fueling Experience
        </h2>
        <p className="text-gray-200 mt-4 text-lg">
          Register now and take control of your fuel payments effortlessly.
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
