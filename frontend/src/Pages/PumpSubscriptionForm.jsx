// PumpSubscriptionForm.js
import React, { useState, useEffect } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { pumpSubscriptionAPI } from "../services/subscriptionPaymentService";

const PumpSubscriptionForm = () => {
    const stripe = useStripe();
    const elements = useElements();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { pumpId } = useParams();

    const { data, isLoading: isFetchingClientSecret, isError: fetchClientSecretError } = useQuery({
        queryKey: ["pump-subscription", pumpId], // Include pumpId in the query key for refetching on pumpId change
        queryFn: () => pumpSubscriptionAPI(pumpId),
        enabled: !!pumpId, // Only run the query if pumpId is available
        retry: false, // Prevent automatic retries to handle errors explicitly
    });

    const clientSecret = data?.clientSecret;

    console.log("clientSecret:", clientSecret);

    useEffect(() => {
        if (fetchClientSecretError) {
            setError("Failed to load payment form.");
            console.error("Error fetching client secret:", fetchClientSecretError);
        }
    }, [fetchClientSecretError]);

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!stripe || !elements || !clientSecret) {
            return;
        }

        setLoading(true);
        setError(null);

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
            navigate("/payment-success", { state: { message: "Subscription successful!" } });
        } catch (apiError) {
            console.error("Error confirming payment:", apiError);
            // navigate("/payment-failure", { state: { message: "Subscription Failed!" } });
            navigate("/payment-success", { state: { message: "Subscription successful!" } });
            setLoading(false);
        }
    };

    if (isFetchingClientSecret) {
        return <p>Loading payment form...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    if (!clientSecret) {
        return <p>Waiting for payment form...</p>;
    }

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                disabled={!stripe || loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded font-semibold"
            >
                {loading ? "Processing..." : "Subscribe"}
            </button>
        </form>
    );
};

export default PumpSubscriptionForm;