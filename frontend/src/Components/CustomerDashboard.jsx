import React from "react";
import { CreditCard, ShieldCheck, MapPin, Bell, History, User, DollarSign } from "lucide-react";
import CNavbar from "./CNavbar";
import CFooter from "./CFooter";

export default function CustomerDashboard() {
  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <CNavbar />

      {/* Hero Section */}
      <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">
          Welcome to Petronix
        </h2>
        <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
          Revolutionizing fuel payments with secure, seamless transactions and real-time tracking.
        </p>
      </header>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 p-10">
        {[
          { Icon: CreditCard, title: "Credit-Based Fueling", desc: "Refuel now, pay later with flexible credit options." },
          { Icon: ShieldCheck, title: "Quick & Secure Payments", desc: "Pay easily via UPI, cards, or net banking." },
          { Icon: History, title: "Real-Time Tracking", desc: "Monitor transactions, credit usage, and fuel history in real time." },
        ].map((feature, index) => (
          <div
            key={index}
            className="p-6 bg-gray-800 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 hover:bg-gray-700"
          >
            <feature.Icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
            <h3 className="text-xl font-semibold text-purple-400">{feature.title}</h3>
            <p className="text-gray-300">{feature.desc}</p>
          </div>
        ))}
      </section>

      {/* 📌 Contents Section */}
      <section className="p-10">
        <h2 className="text-4xl font-bold text-center text-purple-500 mb-8">Explore</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "Credit Request", Icon: CreditCard, link: "/CreditRequest", desc: "Easily request fuel credit and manage your credit balance efficiently." },
            { title: "Payment", Icon: DollarSign, link: "/Payment", desc: "Make instant payments for fuel purchases using multiple payment options." },
            { title: "Fueling History", Icon: History, link: "/FuelingHistory", desc: "Track your fuel transactions and usage history in one convenient place." },
            { title: "Find Petrol Pumps", Icon: MapPin, link: "/FindPetrolPumps", desc: "Locate nearby petrol pumps with real-time availability updates." },
            { title: "Notifications", Icon: Bell, link: "/Notifications", desc: "Stay updated with transaction alerts, offers, and system notifications." },
            { title: "View Profile", Icon: User, link: "/UserProfile", desc: "Manage your account details, preferences, and security settings." },
          ].map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="p-6 bg-gray-800 rounded-lg shadow-lg text-center transform transition duration-300 hover:scale-105 hover:bg-gray-700 hover:ring-4 hover:ring-purple-400"
            >
              <item.Icon className="w-12 h-12 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold text-purple-400">{item.title}</h3>
              <p className="text-gray-300 text-sm">{item.desc}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Footer */}
      <CFooter />
    </div>
  );
}
