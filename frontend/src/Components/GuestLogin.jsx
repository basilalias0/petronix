import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/slice/authslice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email").required("Email is required"),
      password: Yup.string().required("Password is required"),
    }),
    onSubmit: async (values) => {
      setError("");

      try {
        const response = await axios.post("http://localhost:5000/api/v1/auth/login", values);
        const { token, userType } = response.data;

        const decoded = jwtDecode(token);

        // Store in Redux & sessionStorage
        dispatch(loginSuccess({ token, user: decoded }));
        sessionStorage.setItem("token", token);          // ✅ Updated
        sessionStorage.setItem("role", userType);        // ✅ Updated

        // Redirect based on userType
        if (userType === "pumpOwner") {
          navigate("/PumpOwnerDashboard");
        } else if (userType === "customer") {
          navigate("/CustomerDashboard");
        } else if (userType === "salesRep") {
          navigate("/SalesRepDashboard");
        } else {
          setError("Unknown user role.");
        }

      } catch (err) {
        setError("Invalid credentials. Please check your email and password.");
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-lg rounded-2xl text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-yellow-400">Petronix</h1>
          <p className="text-gray-400 mt-2">Login to continue...</p>
        </div>

        <form onSubmit={formik.handleSubmit} className="mt-6 space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.email}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your email"
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-red-400 text-sm mt-1">{formik.errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              value={formik.values.password}
              className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter your password"
            />
            {formik.touched.password && formik.errors.password && (
              <p className="text-red-400 text-sm mt-1">{formik.errors.password}</p>
            )}
          </div>

          {/* Error Message */}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Login Button */}
          <button
            type="submit"
            className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-2 px-4 rounded-lg"
          >
            Login
          </button>
        </form>

        {/* Registration Links */}
        <div className="mt-6 text-center space-y-2 text-sm">
          <p className="text-gray-400">Don't have an account? Register as:</p>
          <div className="flex flex-col space-y-1">
            <Link to="/OwnerRegister" className="text-blue-400 hover:underline">
              Owner
            </Link>
            <Link to="/CustomerRegister" className="text-blue-400 hover:underline">
              Customer
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
