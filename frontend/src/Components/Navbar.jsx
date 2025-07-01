import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-gray-900 text-white p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <h1 className="text-2xl font-bold text-yellow-400">PETRONIX</h1>

        {/* Desktop Menu */}
        <ul className="hidden md:flex space-x-8 text-lg items-center">
          {[
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about" },
            { name: "Services", path: "/services" },
           
          ].map((item) => (
            <li key={item.name}>
              <Link to={item.path} className="hover:text-purple-400 transition">
                {item.name}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop Login Button */}
        <div className="hidden md:flex items-center">
          <Link
            to="/login"
            className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-5 py-2 rounded-md transition"
          >
            Login
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button className="md:hidden text-yellow-400" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden bg-gray-900 text-white flex flex-col items-center space-y-4 py-4 transition-all">
          {[
            { name: "Home", path: "/" },
            { name: "About Us", path: "/about" },
            { name: "Services", path: "/services" },
            { name: "Contact", path: "/contact" }
          ].map((item) => (
            <li key={item.name}>
              <Link to={item.path} className="hover:text-purple-400 transition" onClick={() => setIsOpen(false)}>
                {item.name}
              </Link>
            </li>
          ))}

          {/* Mobile Login Button */}
          <Link
            to="/login"
            className="w-4/5 text-center bg-purple-600 hover:bg-purple-700 py-2 rounded-md transition"
            onClick={() => setIsOpen(false)}
          >
            Login
          </Link>
        </ul>
      )}
    </nav>
  );
}
