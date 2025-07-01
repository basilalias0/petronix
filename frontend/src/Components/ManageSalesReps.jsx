import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader } from "lucide-react";
import ONavbar from "./ONavbar";
import OFooter from "./OFooter";
import axios from "axios";

export default function ManageSalesReps() {
  const [salesReps, setSalesReps] = useState([]);
  const [pumps, setPumps] = useState([]);
  const [newRep, setNewRep] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    altPhone: "",
    gender: "",
    aadharNumber: "",
    address: "",
    idProof: null,
    password: "",
    confirmPassword: "",
    pump: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSalesReps();
    fetchPumps();
  }, []);

  const fetchSalesReps = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/v1/salesRep", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSalesReps(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching sales representatives:", error);
      setSalesReps([]);
    }
  };

  const fetchPumps = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/v1/pump/owner/pumps", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPumps(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error fetching pumps:", error);
      setPumps([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewRep({ ...newRep, [name]: value });
    if (name === "password" || name === "confirmPassword") {
      setPasswordError("");
    }
  };

  const handleFileChange = (e) => {
    setNewRep({ ...newRep, idProof: e.target.files[0] });
  };

  const validatePasswords = () => {
    if (newRep.password !== newRep.confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    if (newRep.password.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    return true;
  };

  const handleAddRep = async (e) => {
    e.preventDefault();
    if (!validatePasswords()) return;

    setLoading(true);
    try {
      const token = sessionStorage.getItem("token");
      const formData = new FormData();
      Object.keys(newRep).forEach((key) => {
        if (key !== "confirmPassword") {
          formData.append(key, newRep[key]);
        }
      });

      await axios.post("http://localhost:5000/api/v1/salesRep/add", formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
      });

      fetchSalesReps();
      setNewRep({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        altPhone: "",
        gender: "",
        aadharNumber: "",
        address: "",
        idProof: null,
        password: "",
        confirmPassword: "",
        pump: "",
      });
      setPasswordError("");
    } catch (error) {
      console.error("Error adding sales representative:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRep = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sales representative?")) return;

    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/v1/pump-owner/deleteSalesRep/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSalesReps();
    } catch (error) {
      console.error("Error deleting sales rep:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <ONavbar />
      <header className="text-center py-10 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-lg">
        <h1 className="text-5xl font-extrabold text-white drop-shadow-lg">Manage Sales Representatives</h1>
        <p className="text-gray-300 mt-3 text-lg max-w-xl mx-auto">Add, edit, or remove your sales representatives from here.</p>
      </header>
      <main className="flex flex-col items-center p-10 space-y-8 flex-1">
        <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-xl p-6 space-y-6">
          <form onSubmit={handleAddRep} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["firstName", "lastName", "email", "phoneNumber", "altPhone", "aadharNumber", "address"].map((name) => (
              <div key={name} className="flex flex-col">
                <label className="text-gray-400 mb-1">
                  {name.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </label>
                <input
                  type={name === "email" ? "email" : "text"}
                  name={name}
                  value={newRep[name]}
                  onChange={handleChange}
                  placeholder={name}
                  className="p-3 bg-gray-700 rounded-lg"
                  required
                />
              </div>
            ))}
            <div className="flex flex-col">
              <label className="text-gray-400 mb-1">Gender</label>
              <select name="gender" value={newRep.gender} onChange={handleChange} className="p-3 bg-gray-700 rounded-lg" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* ✅ Only Approved Pumps */}
            <div className="flex flex-col">
              <label className="text-gray-400 mb-1">Pump</label>
              <select
                name="pump"
                value={newRep.pump}
                onChange={handleChange}
                className="p-3 bg-gray-700 text-white rounded-lg"
                required
              >
                <option value="">Select Pump</option>
                {pumps
                  .filter((pump) => pump.status === "approved")
                  .map((pump) => (
                    <option key={pump._id} value={pump._id} className="text-black">
                      {pump.pumpName || "Unnamed Pump"}
                    </option>
                  ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-gray-400 mb-1">ID Proof</label>
              <input type="file" name="idProof" onChange={handleFileChange} className="p-3 bg-gray-700 rounded-lg" required />
            </div>

            {["password", "confirmPassword"].map((name) => (
              <div key={name} className="flex flex-col relative">
                <label className="text-gray-400 mb-1">{name === "password" ? "Password" : "Confirm Password"}</label>
                <input
                  type={(name === "password" ? showPassword : showConfirmPassword) ? "text" : "password"}
                  name={name}
                  value={newRep[name]}
                  onChange={handleChange}
                  placeholder={name === "password" ? "Password" : "Confirm Password"}
                  className="p-3 bg-gray-700 rounded-lg w-full pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => name === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-10 text-gray-400 hover:text-white"
                >
                  {(name === "password" ? showPassword : showConfirmPassword) ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            ))}
            {passwordError && (
              <div className="col-span-2 text-red-500 text-sm text-center">
                {passwordError}
              </div>
            )}
            <button
              type="submit"
              className="p-3 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg col-span-2 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="animate-spin mr-2" size={20} />
                  Adding...
                </>
              ) : (
                "Add Sales Rep"
              )}
            </button>
          </form>
        </div>

        {/* Sales Representatives List */}
        <div className="w-full max-w-5xl bg-gray-800 rounded-2xl shadow-xl p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-white mb-4">Current Sales Representatives</h2>
          {salesReps.length === 0 ? (
            <p className="text-gray-400">No sales representatives found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-white">
                    <th className="p-3">Name</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">Gender</th>
                    <th className="p-3">Pump</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {salesReps.map((rep) => (
                    <tr key={rep._id} className="border-b border-gray-600 hover:bg-gray-700 transition">
                      <td className="p-3">{rep.firstName} {rep.lastName}</td>
                      <td className="p-3">{rep.email}</td>
                      <td className="p-3">{rep.phoneNumber}</td>
                      <td className="p-3">{rep.gender}</td>
                      <td className="p-3">{rep.pump?.pumpName || "N/A"}</td>
                      <td className="p-3 text-center space-x-2">
                        <button className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-md text-sm font-semibold">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRep(rep._id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-semibold"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <OFooter />
    </div>
  );
}
