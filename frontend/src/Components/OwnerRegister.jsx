import React, { useState } from "react";
import { UserPlus } from "lucide-react";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function OwnerRegister() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state

  const formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      alternatePhone: "",
      address: "",
      aadharNumber: "",
      password: "",
      confirmPassword: "",
      profilePicture: null,
      idProofPhoto: null,
    },
    validationSchema: Yup.object({
      firstName: Yup.string().required("First name is required"),
      lastName: Yup.string().required("Last name is required"),
      email: Yup.string().email("Invalid email").required("Email is required"),
      phoneNumber: Yup.string().required("Phone number is required"),
      alternatePhone: Yup.string(),
      address: Yup.string().required("Address is required"),
      aadharNumber: Yup.string()
        .matches(/^\d{12}$/, "Aadhaar number must be exactly 12 digits")
        .required("Aadhaar number is required"),
      password: Yup.string()
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), null], "Passwords must match")
        .required("Confirm Password is required"),
      profilePicture: Yup.mixed().required("Profile photo is required"),
      idProofPhoto: Yup.mixed().required("Aadhaar card is required"),
    }),
    onSubmit: async (values, { setFieldError }) => {
      try {
        setServerError("");
        setLoading(true); // Start loading

        const formData = new FormData();
        formData.append("firstName", values.firstName);
        formData.append("lastName", values.lastName);
        formData.append("email", values.email);
        formData.append("phoneNumber", values.phoneNumber);
        formData.append("alternatePhone", values.alternatePhone);
        formData.append("address", values.address);
        formData.append("aadharNumber", parseInt(values.aadharNumber, 10));
        formData.append("password", values.password);

        if (values.profilePicture instanceof File) {
          formData.append("profilePicture", values.profilePicture);
        }

        if (values.idProofPhoto instanceof File) {
          formData.append("idProofPhoto", values.idProofPhoto);
        }

        await axios.post("http://localhost:5000/api/v1/pump-owner/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setLoading(false); // Stop loading
        navigate("/Login");

      } catch (error) {
        setLoading(false); // Stop loading on error
        const { field, message } = error.response?.data || {};
        if (field && message) {
          setFieldError(field, message);
        } else {
          setServerError(message || "Something went wrong.");
        }
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-lg rounded-2xl text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-400">Petronix</h1>
          <p className="text-gray-400 mt-2">Owner Registration</p>
        </div>

        {/* Server error (non-field specific) */}
        {serverError && (
          <div className="text-red-400 text-sm text-center my-2">{serverError}</div>
        )}

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
                placeholder="First Name"
                disabled={loading} // Disable input during loading
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
                placeholder="Last Name"
                disabled={loading}
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
              disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-red-400 text-sm">{formik.errors.confirmPassword}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-300">Aadhaar Number</label>
            <input
              type="text"
              name="aadharNumber"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.aadharNumber}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="1234 5678 9012"
              disabled={loading}
            />
            {formik.touched.aadharNumber && formik.errors.aadharNumber && (
              <p className="text-red-400 text-sm">{formik.errors.aadharNumber}</p>
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
              disabled={loading}
            ></textarea>
            {formik.touched.address && formik.errors.address && (
              <p className="text-red-400 text-sm">{formik.errors.address}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300">Profile Photo</label>
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              className="w-full bg-gray-700 rounded-lg text-white file:py-2 file:px-4 file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              onChange={(event) => formik.setFieldValue("profilePicture", event.currentTarget.files[0])}
              disabled={loading}
            />
            {formik.touched.profilePicture && formik.errors.profilePicture && (
              <p className="text-red-400 text-sm">{formik.errors.profilePicture}</p>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300">Aadhaar Card Upload</label>
            <input
              type="file"
              name="idProofPhoto"
              accept="image/*,application/pdf"
              className="w-full bg-gray-700 rounded-lg text-white file:py-2 file:px-4 file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
              onChange={(event) => formik.setFieldValue("idProofPhoto", event.currentTarget.files[0])}
              disabled={loading}
            />
            {formik.touched.idProofPhoto && formik.errors.idProofPhoto && (
              <p className="text-red-400 text-sm">{formik.errors.idProofPhoto}</p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2"
            disabled={loading} // Disable button during loading
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <span>Registering...</span>
              </div>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                <span>Register as Owner</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}