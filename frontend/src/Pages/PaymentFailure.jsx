import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { XCircle } from "lucide-react"; // Import failure icon
import { useSelector } from "react-redux";

export default function PaymentFailure() {
    const location = useLocation();
    const navigate = useNavigate();
    const message = location.state?.message || "Payment failed.";
    const user = useSelector((state)=>state.auth.user.role)
    console.log(user);
    

    useEffect(() => {
        const timer = setTimeout(() => {
            if(user==="customer") navigate("/payment");
            if(user==="pumpOwner") navigate("/ManagePumps")
        }, 2000); // Redirect after 2 seconds

        return () => clearTimeout(timer); // Clear timeout on unmount
    }, [navigate]);

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col justify-center items-center">
            <div className="text-center">
                <XCircle className="text-red-400 mx-auto mb-4" size={64} />
                <h2 className="text-3xl font-bold mb-4">Payment Failed!</h2>
                <p className="text-gray-300">{message}</p>
                <p className="text-gray-500 mt-4">Redirecting in 2 seconds...</p>
            </div>
        </div>
    );
}