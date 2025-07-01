import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function CustomerRegister() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      alternatePhone: "",
      address: "",
      aadharNumber: "", // Changed from aadhaarNumber
      pin: "",
      password: "",
      confirmPassword: "",
      profilePicture: null,
      idProofPhoto: null,
      termsAccepted: false,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phoneNumber: Yup.string().required("Phone number is required"),
      alternatePhone: Yup.string(),
      address: Yup.string().required("Address is required"),
      aadharNumber: Yup.string() // Changed from aadhaarNumber
        .matches(/^\d{12}$/, "Aadhar number must be exactly 12 digits")
        .required("Aadhar number is required"),
      pin: Yup.string()
        .matches(/^\d{4}$/, "PIN must be exactly 4 digits")
        .required("PIN is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
      profilePicture: Yup.mixed().required("Profile picture is required"),
      idProofPhoto: Yup.mixed().required("ID proof photo is required"),
      termsAccepted: Yup.boolean()
        .oneOf([true], "You must accept the terms and conditions")
        .required("You must accept the terms and conditions"),
    }),
    onSubmit: async (values) => {
      try {
        setServerError("");
console.log(values.address);

        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("email", values.email);
        formData.append("phoneNumber", values.phoneNumber);
        formData.append("alternatePhone", values.alternatePhone);
        formData.append("address", values.address);
        formData.append("aadharNumber", values.aadharNumber); // Changed from aadhaarNumber
        formData.append("pin", values.pin);
        formData.append("password", values.password);
        if (values.profilePicture instanceof File) {
          formData.append("profilePicture", values.profilePicture);
        }

        if (values.idProofPhoto instanceof File) {
          formData.append("idProofPhoto", values.idProofPhoto);
        }

        await axios.post("http://localhost:5000/api/v1/customer/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        navigate("/Login");
      } catch (error) {
        setServerError(error.response?.data?.message || "Something went wrong.");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-lg rounded-2xl text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-400">Petronix</h1>
          <p className="text-gray-400 mt-2">Customer Registration</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5" encType="multipart/form-data">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">First Name</label>
              <input
                type="text"
                name="firstName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.firstName}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="firstName"
              />
              {formik.touched.firstName && formik.errors.firstName && (
                <p className="text-red-400 text-sm">{formik.errors.firstName}</p>
              )}
            </div>
            
            <div>
              <label className="text-sm text-gray-300">Last Name</label>
              <input
                type="text"
                name="lastName"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.lastName}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="lastName"
              />
              {formik.touched.lastName && formik.errors.lastName && (
                <p className="text-red-400 text-sm">{formik.errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="owner@example.com"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-400 text-sm">{formik.errors.email}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-300">Phone</label>
              <input
                type="tel"
                name="phoneNumber"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.phoneNumber}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="+91 1234567890"
              />
              {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                <p className="text-red-400 text-sm">{formik.errors.phoneNumber}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-gray-300">Alternate Phone</label>
              <input
                type="tel"
                name="alternatePhone"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.alternatePhone}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="+91 9876543210"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300">Password</label>
              <input
                type="password"
                name="password"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.password}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Enter Password"
              />
              {formik.touched.password && formik.errors.password && (
                <p className="text-red-400 text-sm">{formik.errors.password}</p>
              )}
            </div>

            <div>
              <label className="text-sm text-gray-300">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                value={formik.values.confirmPassword}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Confirm Password"
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-400 text-sm">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">4-Digit PIN</label>
            <input
              type="password"
              name="pin"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.pin}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="****"
              maxLength={4}
            />
            {formik.touched.pin && formik.errors.pin && (
              <p className="text-red-400 text-sm">{formik.errors.pin}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300">Aadhar Number</label> {/* Changed from Aadhaar Number */}
            <input
              type="text"
              name="aadharNumber" // Changed from aadhaarNumber
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.aadharNumber} // Changed from aadhaarNumber
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="1234 5678 9012"
            />
            {formik.touched.aadharNumber && formik.errors.aadharNumber && ( // Changed from aadhaarNumber
              <p className="text-red-400 text-sm">{formik.errors.aadharNumber}</p> // Changed from aadhaarNumber
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300">Address</label>
            <textarea
              name="address"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.address}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Enter your address"
            ></textarea>
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-400 text-sm">{formik.errors.address}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300">Profile Picture</label>
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              className="w-full bg-gray-700 rounded-lg text-white file:py-2 file:px-4 file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              onChange={(event) => formik.setFieldValue("profilePicture", event.currentTarget.files[0])}
            />
            {formik.touched.profilePicture && formik.errors.profilePicture && (
              <p className="text-red-400 text-sm">{formik.errors.profilePicture}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300">ID Proof Photo Upload</label>
            <input
              type="file"
              name="idProofPhoto"
              accept="image/*,application/pdf"
              className="w-full bg-gray-700 rounded-lg text-white file:py-2 file:px-4 file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              onChange={(event) => formik.setFieldValue("idProofPhoto", event.currentTarget.files[0])}
            />
            {formik.touched.idProofPhoto && formik.errors.idProofPhoto && (
              <p className="text-red-400 text-sm">{formik.errors.idProofPhoto}</p>
            )}
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="termsAccepted"
              checked={formik.values.termsAccepted}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label className="text-sm text-gray-300">
              I agree to the{" "}
              <a href="/TermsAndConditions" className="text-purple-400 hover:underline" target="_blank">
                Terms and Conditions
              </a>{" "}
              and further legal procedures regarding credit repayment
            </label>
          </div>
          {formik.touched.termsAccepted && formik.errors.termsAccepted && (
            <p className="text-red-400 text-sm">{formik.errors.termsAccepted}</p>
          )}

          {/* Server Error Display */}
          {serverError && (
            <p className="text-red-400 text-sm text-center">{serverError}</p>
          )}

          <button 
            type="submit" 
            disabled={formik.isSubmitting}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <UserPlus className="w-5 h-5" />
            <span>{formik.isSubmitting ? "Registering..." : "Register as Customer"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}