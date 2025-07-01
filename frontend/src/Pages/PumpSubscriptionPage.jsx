// PumpSubscriptionPage.js
import React from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import PumpSubscriptionForm from "./PumpSubscriptionForm";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { pumpSubscriptionAPI } from "../services/subscriptionPaymentService";
import ONavbar from "../Components/ONavbar";
import OFooter from "../Components/OFooter";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const PumpSubscriptionPage = () => {
    const { pumpId } = useParams();

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ["pump-subscription", pumpId],
        queryFn: () => pumpSubscriptionAPI(pumpId),
        enabled: !!pumpId,
        retry: false,
    });

    const clientSecret = data?.clientSecret;

    // ///////////////////////////////////////

    if (isLoading) {
        return <p>Loading payment form...</p>;
    }
    // //////////////////////////////////

    if (isError || !clientSecret) {
        return <p className="text-red-500">Failed to load payment form.</p>;
    }

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <ONavbar />
            <main className="flex flex-col items-center p-10 space-y-8 flex-1">
                <div className="w-full max-w-md p-4 bg-gray-800 rounded-lg shadow-md">
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <PumpSubscriptionForm />
                    </Elements>
                </div>
            </main>
            <OFooter />
        </div>
    );
};

export default PumpSubscriptionPage;