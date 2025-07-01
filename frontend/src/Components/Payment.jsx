import React, { useEffect, useState } from "react";
import CNavbar from "./CNavbar";
import CFooter from "./CFooter";
import { CreditCard, CalendarDays, CheckCircle, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchDebtTransaction } from "../services/customerService";
import { useNavigate } from "react-router-dom";

export default function Payment() {
    const [approvedCredits, setApprovedCredits] = useState([]);
    const navigate = useNavigate();

    const { data, isLoading } = useQuery({
        queryKey: ["fetch-debt-transaction"],
        queryFn: fetchDebtTransaction,
    });

    useEffect(() => {
        if (data?.creditTransactions) {
            setApprovedCredits(data.creditTransactions);
        }
    }, [data]);

    const getPaybackDaysLeft = (createdAt) => {
        const createdDate = new Date(createdAt);
        if (isNaN(createdDate)) return 0;

        const now = new Date();
        const msDiff = now - createdDate;
        const daysPassed = Math.floor(msDiff / (1000 * 60 * 60 * 24));
        return 30 - daysPassed;
    };

    const handlePay = (credit) => {
        navigate(`/payment/${credit._id}`, { state: { amount: credit.amount } });
    };

    return (
        <div className="bg-gray-900 text-white min-h-screen flex flex-col">
            <CNavbar />

            <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
                <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">Credit Paybacks</h2>
                <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
                    Settle your approved credit dues.
                </p>
            </header>

            <section className="flex flex-col items-center p-10 space-y-10">
                <div className="w-full max-w-4xl bg-gray-800 shadow-lg rounded-2xl p-8">
                    <h2 className="text-3xl font-bold text-purple-400 text-center mb-6">Pending Credit Paybacks</h2>

                    {approvedCredits.length === 0 ? (
                        <p className="text-center text-gray-400">No approved credit requests found.</p>
                    ) : (
                        <div className="space-y-4">
                            {approvedCredits.map((credit) => {
                                const daysLeft = getPaybackDaysLeft(credit.createdAt);
                                const isOverdue = daysLeft < 0;

                                return (
                                    <div
                                        key={credit._id}
                                        className="flex justify-between items-center bg-gray-700 p-4 rounded-lg shadow-md"
                                    >
                                        <div className="flex items-center space-x-4">
                                            <CreditCard className="text-purple-400" size={24} />
                                            <div>
                                                <p className="text-lg font-semibold">₹{credit.amount || 0}</p>
                                                <p className="text-gray-400 text-sm flex items-center">
                                                    <CalendarDays size={16} className="mr-1" />
                                                    {new Date(credit.createdAt).toLocaleString()}
                                                </p>
                                                <p className="text-sm text-blue-400">
                                                    Approved By: {credit.approvedBy || "Admin"}
                                                </p>
                                                <p className={`text-sm flex items-center ${isOverdue ? "text-red-400" : "text-yellow-400"}`}>
                                                    <Clock size={16} className="mr-1" />
                                                    {isOverdue
                                                        ? `Overdue by ${Math.abs(daysLeft)} days`
                                                        : `Payback Days Left: ${daysLeft}`}
                                                </p>
                                            </div>
                                        </div>
                                        {credit.isRepaid ? (
                                            <CheckCircle className="text-green-400" size={24} />
                                        ) : (
                                            <button
                                                onClick={() => handlePay(credit)}
                                                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                                                disabled={isLoading}
                                            >
                                                {isLoading ? "Processing..." : "Pay Now"}
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            <CFooter />
        </div>
    );
}
