import React from "react";

export default function OFooter() {
  return (
    <footer className="bg-black text-gray-400 p-6">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        
        {/* Company Info */}
        <div>
          <h2 className="text-yellow-400 text-2xl font-bold">PETRONIX</h2>
          <p className="mt-2">Revolutionizing fuel payments with secure and seamless transactions.</p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-purple-400">Quick Links</h3>
          <ul className="mt-2 space-y-1">
            <li><a href="#" className="hover:text-purple-400">Home</a></li>
            <li><a href="#" className="hover:text-purple-400">About Us</a></li>
            <li><a href="#" className="hover:text-purple-400">Services</a></li>
            <li><a href="#" className="hover:text-purple-400">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold text-purple-400">Contact Us</h3>
          <p className="mt-2 flex items-center"><span className="mr-2">📍</span> 25th Street Avenue, Los Angeles, CA</p>
          <p className="mt-2 flex items-center"><span className="mr-2">📧</span> office@yourfirm.com</p>
          <p className="mt-2 flex items-center"><span className="mr-2">📞</span> +800 49 900 900</p>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center mt-6 border-t border-gray-700 pt-4">
        <p>&copy; {new Date().getFullYear()} Petronix. All Rights Reserved.</p>
      </div>
    </footer>
  );
}
