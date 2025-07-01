import { Link } from "react-router-dom";
import Navbar from "./Navbar";

export default function Home() {
  return (
    <div className="bg-gray-900 text-white">
      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <header className="text-center py-20 bg-purple-700">
        <h2 className="text-4xl font-bold">Revolutionizing Fuel Payments</h2>
        <p className="mt-4">Refuel on credit, manage payments effortlessly, and track transactions securely.</p>
        <button className="mt-6 px-6 py-2 bg-white text-purple-700 font-semibold rounded-md">Get Started</button>
      </header>

      {/* Features Section */}
      <section className="py-16 px-6 md:px-20 bg-gray-100 text-gray-900 text-center">
        <h3 className="text-3xl font-bold mb-8">Why Choose Petronix?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "Credit-Based Fueling", desc: "Refuel now, pay later with flexible credit options." },
            { title: "Quick & Secure Payments", desc: "Pay easily via UPI, cards, or net banking." },
            { title: "Real-Time Tracking", desc: "Monitor transactions, credit usage, and fuel history in real time." },
          ].map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
              <p className="text-gray-700">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h2 className="text-2xl font-bold text-yellow-400">PETRONIX</h2>
            <p className="mt-2 text-gray-400">Revolutionizing fuel payments with secure and seamless transactions.</p>
          </div>
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="mt-2 space-y-2">
              <li><Link to="/" className="text-gray-400 hover:text-yellow-400">Home</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-yellow-400">About Us</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-yellow-400">Services</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-yellow-400">Contact</Link></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <p className="mt-2 text-gray-400">📍 25th Street Avenue, Los Angeles, CA</p>
            <p className="text-gray-400">📧 office@yourfirm.com</p>
            <p className="text-gray-400">📞 +800 49 900 900</p>
          </div>
        </div>
        {/* Admin Login */}
        <div className="text-center mt-8 text-gray-500 border-t border-gray-700 pt-4">
          <p>
            © {new Date().getFullYear()} Petronix. All rights reserved.
            <span className="ml-4">
              <Link to="/AdminLogin" className="text-yellow-400 hover:text-purple-400">Admin Login</Link>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
}
