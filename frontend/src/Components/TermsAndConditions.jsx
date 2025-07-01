import React from "react";
import { Link } from "react-router-dom";

export default function TermsAndConditions() {
  return (
    <div style={{ 
      backgroundColor: "white", 
      color: "black", 
      minHeight: "100vh", 
      padding: "20px", 
      fontFamily: "Times New Roman, serif", 
      lineHeight: "1.5" 
    }}>
      <h1 style={{ fontSize: "24px", textAlign: "center", marginBottom: "20px" }}>
        Terms and Conditions
      </h1>

      <div>
        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
          1. Credit Policy
        </h2>
        <ul style={{ listStyleType: "disc", marginLeft: "40px" }}>
          <li>
            Each registered customer is eligible for a credit limit of ₹5,000 (Indian Rupees Five Thousand Only).
          </li>
          <li>
            The credit amount must be repaid in full within 30 calendar days from the date of availing the credit.
          </li>
          <li>
            Failure to repay the credit amount within the stipulated 30-day period will be considered a default.
          </li>
          <li>
            In case of default, Petronix (the "Admin") reserves the right to initiate legal proceedings to recover the outstanding credit amount, including any applicable interest and legal fees.
          </li>
          <li>
            The customer shall be liable for all costs associated with the recovery process, including but not limited to legal fees, court costs, and collection agency fees.
          </li>
        </ul>

        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
          2. User Responsibilities
        </h2>
        <ul style={{ listStyleType: "disc", marginLeft: "40px" }}>
          <li>
            Users must provide accurate and complete information during registration.
          </li>
          <li>
            Users are responsible for maintaining the confidentiality of their account credentials.
          </li>
          <li>
            Users must notify Petronix immediately of any unauthorized use of their account.
          </li>
        </ul>

        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
          3. Legal Action
        </h2>
        <ul style={{ listStyleType: "disc", marginLeft: "40px" }}>
          <li>
            In the event of non-payment, Petronix may pursue legal action through appropriate courts in [Your Jurisdiction/City], India.
          </li>
          <li>
            The customer agrees to submit to the jurisdiction of the courts in [Your Jurisdiction/City], India for any disputes arising from this agreement.
          </li>
          <li>
            Interest on overdue amounts may be charged at a rate of [X]% per month (or the maximum rate permitted by law) until fully repaid.
          </li>
        </ul>

        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
          4. General Terms
        </h2>
        <ul style={{ listStyleType: "disc", marginLeft: "40px" }}>
          <li>
            Petronix reserves the right to modify these terms and conditions at any time, with notice provided to registered users.
          </li>
          <li>
            This agreement is governed by the laws of India.
          </li>
          <li>
            Any misuse of the credit facility may result in immediate termination of services and legal action.
          </li>
        </ul>

        <h2 style={{ fontSize: "18px", fontWeight: "bold", marginTop: "20px" }}>
          5. Acceptance
        </h2>
        <p>
          By checking the "I agree" box during registration, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions, including the credit repayment obligations and potential legal consequences of non-payment.
        </p>
      </div>

      <div style={{ textAlign: "center", marginTop: "30px" }}>
        <Link 
          to="/CustomerRegister" 
          style={{ 
            color: "blue", 
            textDecoration: "underline" 
          }}
        >
          Back to Registration
        </Link>
      </div>
    </div>
  );
}