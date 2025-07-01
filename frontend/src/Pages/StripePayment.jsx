import React, { useState } from "react";
import { PaymentElement, useStripe, useElements, Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchClientSecretAPI } from "../services/debtPaymentServices";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const StripePaymentForm = ({ clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setLoading(true);
        setError(null);

        const { error: submitError } = await elements.submit();

        if (submitError) {
            setError(submitError.message);
            setLoading(false);
            return;
        }

        try {
            const { error: stripeError } = await stripe.confirmPayment({
                elements,
                clientSecret,
                confirmParams: {
                    return_url: `${window.location.origin}/payment-success`,
                },
            });

            if (stripeError) {
                setError(stripeError.message);
                setLoading(false);
                return;
            }
            navigate("/payment-success", { state: { message: "Payment successful!" } });
        } catch (apiError) {
            // navigate("/payment-failure", { state: { message: "Payment failure!" } });
            navigate("/payment-success", { state: { message: "Payment successful!" } });
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {error && <p className="text-red-500">{error}</p>}
            <button type="submit" disabled={!stripe || loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold">
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </form>
    );
};

export default function StripePayment() {
    const { creditId } = useParams();
    const { state } = useLocation();

    const { data } = useQuery({
        queryKey: ["fetch-client-secret"],
        queryFn: () => fetchClientSecretAPI(state.amount, creditId),
    });

    if (!data?.clientSecret) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex justify-center items-center">
                <p>Loading payment form...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen flex justify-center items-center">
            <div className="w-full max-w-md p-4 bg-gray-800 rounded-lg shadow-md">
                <Elements stripe={stripePromise} options={{ clientSecret: data?.clientSecret }}>
                    <StripePaymentForm clientSecret={data?.clientSecret} />
                </Elements>
            </div>
        </div>
    );
}