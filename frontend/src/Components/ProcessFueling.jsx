import { useState } from "react";
import SNavbar from "./SNavbar";
import SFooter from "./SFooter";

export default function ProcessFueling() {
  const [customerId, setCustomerId] = useState("");
  const [fuelType, setFuelType] = useState("petrol");
  const [fuelAmount, setFuelAmount] = useState(""); // Represents price in ₹
  const [paymentMethod, setPaymentMethod] = useState("credit");
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");
  const [pin, setPin] = useState(""); // New state for 4-digit PIN

  const handleFueling = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setMessage("");

    if (!/^\d{4}$/.test(pin)) {
      setProcessing(false);
      setMessage("Invalid PIN. Please enter a 4-digit PIN (e.g., 1234).");
      return;
    }

    if (!customerId || !fuelAmount || parseFloat(fuelAmount) <= 0) {
      setProcessing(false);
      setMessage("Please fill all fields with a valid amount.");
      return;
    }

    try {
      const token = sessionStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/v1/transcation/fuel-sale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerEmail: customerId,
          fuelAmount: parseFloat(fuelAmount),
          fuelPrice: 1, // Replace with dynamic price if needed
          fuelType, // ✅ fuelType included
          paymentType: paymentMethod,
          pin,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Transaction failed");
      }

      setMessage(`Fueling successful! ₹${data.chargedAmount} charged to ${customerId}`);
      setCustomerId("");
      setFuelType("petrol");
      setFuelAmount("");
      setPin("");
    } catch (err) {
      setMessage(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white flex flex-col">
      {/* Navbar */}
      <SNavbar />

      {/* Hero Section */}
      <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Process Fueling</h1>
        <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">
          Quickly process fueling transactions with ease.
        </p>
      </header>

      {/* Main Form Section */}
      <section className="flex flex-col items-center p-10 space-y-10 flex-1">
        <div className="w-full max-w-3xl bg-gray-800 rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center">Fueling Form</h2>
          <form onSubmit={handleFueling} className="space-y-6">
            {/* Customer ID */}
            <div>
              <label className="block text-xl font-semibold mb-2 text-gray-300">Customer ID</label>
              <input
                type="text"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full p-4 text-lg bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter Customer ID"
                required
              />
            </div>

            {/* Fuel Type Selection */}
            <div>
              <label className="block text-xl font-semibold mb-2 text-gray-300">Fuel Type</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full p-4 text-lg bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="petrol">Petrol</option>
                <option value="diesel">Diesel</option>
                <option value="cng">CNG</option>
              </select>
            </div>

            {/* Fuel Amount in ₹ */}
            <div>
              <label className="block text-xl font-semibold mb-2 text-gray-300">Fuel Amount (₹)</label>
              <input
                type="text"
                inputMode="decimal"
                value={fuelAmount}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d*\.?\d{0,2}$/.test(value)) {
                    setFuelAmount(value);
                  }
                }}
                className="w-full p-4 text-lg bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter amount in ₹"
                required
              />
            </div>


            {/* Payment Method */}
            <div>
              <label className="block text-xl font-semibold mb-2 text-gray-300">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full p-4 text-lg bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="credit">Credit Balance</option>
              </select>
            </div>

            {/* 4-Digit PIN */}
            <div>
              <label className="block text-xl font-semibold mb-2 text-gray-300">4-Digit PIN</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="\d{4}"
                value={pin}
                onChange={(e) => {
                  const value = e.target.value;
                  if (/^\d{0,4}$/.test(value)) {
                    setPin(value);
                  }
                }}
                className="w-full p-4 text-lg bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter 4-digit PIN"
                required
                maxLength={4}
              />
            </div>


            {/* Submit Button */}
            <button
              type="submit"
              className={`w-full p-4 text-lg font-bold rounded-lg text-white transition ${processing
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-purple-500 hover:bg-purple-600"
                }`}
              disabled={processing}
            >
              {processing ? "Processing..." : "Process Fueling"}
            </button>
          </form>

          {/* Transaction Message */}
          {message && (
            <p className="mt-6 text-2xl font-semibold text-center text-green-400">{message}</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <SFooter />
    </div>
  );
}
