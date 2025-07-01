import { useDispatch } from 'react-redux';
import { loginSuccess } from '../redux/slice/authslice';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { useState } from 'react';
import { adminLoginAPI } from '../services/adminServices';

export default function AdminLogin() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validate: (values) => {
      const errors = {};
      if (!values.email) {
        errors.email = 'Email is required';
      }
      if (!values.password) {
        errors.password = 'Password is required';
      }
      return errors;
    },
    onSubmit: async (values) => {
      setLoading(true);
      setApiError('');
      try {
        const response = await adminLoginAPI(values); // Call backend API

        dispatch(loginSuccess({ token: response.token, user: response }));

        // ✅ Save token in sessionStorage instead of localStorage
        sessionStorage.setItem('token', response.token);

        navigate('/AdminDashboard');
      } catch (error) {
        setApiError(error.response?.data?.message || 'Login failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 shadow-lg rounded-2xl text-white">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-purple-500">Petronix Admin</h1>
          <p className="text-gray-400 mt-2">Login to your account</p>
        </div>

        <form className="mt-6" onSubmit={formik.handleSubmit}>
          {apiError && <p className="text-red-400 text-center mb-4">{apiError}</p>}

          {/* Email Field */}
          <div className="mt-4">
            <label className="block mb-2 text-sm text-gray-300">Email Address</label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="admin@petronix.com"
              />
              {formik.errors.email && <p className="text-red-400 text-sm mt-1">{formik.errors.email}</p>}
            </div>
          </div>

          {/* Password Field */}
          <div className="mt-4">
            <label className="block mb-2 text-sm text-gray-300">Password</label>
            <div className="relative">
              <input
                type="password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                className="w-full px-4 py-2 bg-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
              {formik.errors.password && <p className="text-red-400 text-sm mt-1">{formik.errors.password}</p>}
            </div>
          </div>

          <div className="flex justify-between items-center mt-4 text-sm">
            <a href="#" className="text-blue-400 hover:underline">Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
