import { useEffect, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import ONavbar from "./ONavbar";
import OFooter from "./OFooter";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function ManagePumps() {
  const [pumps, setPumps] = useState([]);
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate()

  useEffect(() => {
    fetchPumps();
  }, []);

  const fetchPumps = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/v1/pump-owner/pumps", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPumps(response.data.pumps || []);
    } catch (error) {
      console.error("Error fetching pumps:", error);
      setPumps([]);
    }
  };

  const handleSubscription = (pumpId) => {
    console.log("Subscribe clicked for Pump ID:", pumpId);
    navigate(`/pump-subscription/${pumpId}`); // Navigate to subscription page
  };

  const formik = useFormik({
    initialValues: {
      pumpName: "",
      location: "",
      city: "",
      district: "",
      licenseNumber: "",
      proofOfLicense: null,
      managerName: "",
      managerPhone: "",
      managerIdProof: null,
    },
    validationSchema: Yup.object({
      pumpName: Yup.string().min(2, "Must be at least 2 characters").required("Required"),
      location: Yup.string().required("Required"),
      city: Yup.string().required("Required"),
      district: Yup.string().required("Required"),
      licenseNumber: Yup.string().matches(/^[A-Za-z0-9-]+$/, "Invalid license number format").required("Required"),
      proofOfLicense: Yup.mixed()
        .required("Proof of license is required")
        .test("fileSize", "File size too large (max 5MB)", (value) =>
          value ? value.size <= 5 * 1024 * 1024 : true
        )
        .test("fileType", "Only PDF or images allowed", (value) =>
          value ? ["application/pdf", "image/jpeg", "image/png"].includes(value.type) : true
        ),
      managerName: Yup.string().min(2, "Must be at least 2 characters").required("Required"),
      managerPhone: Yup.string().matches(/^[0-9]{10}$/, "Must be a valid 10-digit phone number").required("Required"),
      managerIdProof: Yup.mixed()
        .required("Manager ID proof is required")
        .test("fileSize", "File size too large (max 5MB)", (value) =>
          value ? value.size <= 5 * 1024 * 1024 : true
        )
        .test("fileType", "Only PDF or images allowed", (value) =>
          value ? ["application/pdf", "image/jpeg", "image/png"].includes(value.type) : true
        ),
    }),
    onSubmit: async (values, { resetForm }) => {
      try {
        setSubmitError(null);
        const token = sessionStorage.getItem("token");
        const formData = new FormData();
        Object.keys(values).forEach((key) => {
          formData.append(key, values[key]);
        });

        await axios.post("http://localhost:5000/api/v1/pump", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        await fetchPumps();
        resetForm();
      } catch (error) {
        console.error("Error adding pump:", error);
        setSubmitError(error.response?.data?.message || "Failed to add pump");
      }
    },
  });

  const formatLabel = (key) =>
    key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .replace("Id", "ID");

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <ONavbar />
      <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Manage Pumps</h1>
        <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">Add, edit, or remove your pumps from here.</p>
      </header>
      <main className="flex flex-col items-center p-10 space-y-8 flex-1">
        <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-xl p-8 space-y-6">
          <div className="bg-gradient-to-tr from-purple-700 to-indigo-800 p-8 rounded-xl shadow-md">
            <h2 className="text-3xl font-semibold mb-6 text-white text-center">Add New Pump</h2>
            <form onSubmit={formik.handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6" encType="multipart/form-data">
              {Object.keys(formik.initialValues).map((key) => (
                <div className="flex flex-col" key={key}>
                  <label className="text-white mb-1">{formatLabel(key)}</label>
                  {["proofOfLicense", "managerIdProof"].includes(key) ? (
                    <input
                      type="file"
                      name={key}
                      onChange={(event) => formik.setFieldValue(key, event.currentTarget.files[0])}
                      onBlur={formik.handleBlur}
                      accept=".pdf,image/jpeg,image/png"
                      className="p-3 bg-gray-700 rounded-lg w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-black hover:file:bg-yellow-500"
                    />
                  ) : (
                    <input
                      type="text"
                      name={key}
                      value={formik.values[key]}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className={`p-3 bg-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-400 ${formik.touched[key] && formik.errors[key] ? "border border-red-500" : ""
                        }`}
                    />
                  )}
                  {formik.touched[key] && formik.errors[key] && (
                    <p className="text-red-400 text-sm mt-1">{formik.errors[key]}</p>
                  )}
                </div>
              ))}
              {submitError && <div className="col-span-2 text-red-400 text-center">{submitError}</div>}
              <button
                type="submit"
                disabled={formik.isSubmitting}
                className={`p-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg col-span-2 transition duration-300 ${formik.isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
              >
                {formik.isSubmitting ? "Adding..." : "Add Pump"}
              </button>
            </form>
          </div>

          <div className="overflow-y-auto max-h-[500px] bg-gray-700 p-6 rounded-xl shadow-md">
  <h2 className="text-2xl font-semibold mb-4 text-white text-center">Added Pumps</h2>
  {pumps.length > 0 ? (
    <table className="min-w-full border border-gray-600 text-white">
      <thead>
        <tr className="bg-gray-800">
          <th className="p-3 border border-gray-600">Pump Name</th>
          <th className="p-3 border border-gray-600">Location</th>
          <th className="p-3 border border-gray-600">City</th>
          <th className="p-3 border border-gray-600">District</th>
          <th className="p-3 border border-gray-600">Manager Name</th>
          <th className="p-3 border border-gray-600">Manager Phone</th>
          <th className="p-3 border border-gray-600">Status</th>
        </tr>
      </thead>
      <tbody>
        {pumps.map((pump, index) => (
          <tr key={index} className="bg-gray-800 odd:bg-gray-750">
            <td className="p-3 border border-gray-600">{pump.pumpName}</td>
            <td className="p-3 border border-gray-600">{pump.locationName || pump.location}</td>
            <td className="p-3 border border-gray-600">{pump.city || "N/A"}</td>
            <td className="p-3 border border-gray-600">{pump.district || "N/A"}</td>
            <td className="p-3 border border-gray-600">{pump.managerName || "N/A"}</td>
            <td className="p-3 border border-gray-600">{pump.managerPhone || "N/A"}</td>
            <td className="p-3 border border-gray-600 capitalize text-center">
              {pump.isSubscribed === true ?<button
                  className="bg-green-400 hover:bg-green-500 cursor-not-allowed text-black font-semibold px-4 py-2 rounded-lg transition duration-300"
                  disabled
                >
                  Subscribed
                </button>: pump.status === "approved" ? (
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-4 py-2 rounded-lg transition duration-300"
                  onClick={() => handleSubscription(pump._id)}
                >
                  Subscribe
                </button>
              ) : (
                pump.status || "Pending"
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <p className="text-center text-gray-300">No pumps found.</p>
  )}
</div>


        </div>
      </main>
      <OFooter />
    </div>
  );
}
