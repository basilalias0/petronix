import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import CNavbar from "./CNavbar";
import CFooter from "./CFooter";
import { fetchNearbyPumps } from "../services/customerService";

export default function FindPetrolPumps() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pumps, setPumps] = useState([]);

  const mapContainerStyle = {
    width: '100%',
    height: '400px',
  };

  const center = location ? { lat: location.lat, lng: location.lng } : { lat: 0, lng: 0 };

  useEffect(() => {
    setLoading(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(coords);
          loadNearbyPumps(coords.lat, coords.lng);
        },
        () => {
          setError("Failed to retrieve location. Please enable GPS.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  }, []);

  const loadNearbyPumps = async (lat, lng) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      setError("No token found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const data = await fetchNearbyPumps(lat, lng, token);
      if (Array.isArray(data)) {
        setPumps(data);
      } else {
        setError("Unexpected response format.");
      }
    } catch {
      setError("Failed to fetch nearby pumps.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen flex flex-col">
      <CNavbar />

      <header className="text-center py-20 bg-gradient-to-r from-purple-700 via-indigo-800 to-blue-900 shadow-xl">
        <h2 className="text-5xl font-extrabold text-white drop-shadow-lg">Find Petrol Pumps</h2>
        <p className="text-gray-300 mt-3 text-lg max-w-2xl mx-auto">
          Locate nearby partner petrol pumps using geolocation.
        </p>
      </header>

      <section className="flex flex-col items-center p-10 space-y-10">
        <div className="w-full max-w-6xl bg-gray-800 shadow-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-purple-400 text-center mb-6">Your Location</h2>
          <div className="mb-6">
            {location && (
              <LoadScript googleMapsApiKey="AIzaSyCCjMH2phgm_m-otrCtMLv3nQ9V71SD-oA">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={center}
                  zoom={12}
                >
                  <Marker position={center} label="You" />
                  {pumps.map((pump) => (
                    <Marker
                      key={pump.id}
                      position={{ lat: pump.lat, lng: pump.lng }}
                      label={pump.name}
                    />
                  ))}
                </GoogleMap>
              </LoadScript>
            )}
          </div>
        </div>

        <div className="w-full max-w-6xl bg-gray-800 shadow-lg rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-purple-400 text-center mb-6">Nearby Petrol Pumps</h2>

          {pumps.length > 0 ? (
            <ul className="space-y-4">
              {pumps.map((pump) => (
                <li key={pump.id} className="p-4 bg-gray-700 rounded-lg flex justify-between items-center shadow-md">
                  <div>
                    <p className="text-lg font-bold">{pump.name}</p>
                    <p className="text-gray-400">{pump.distance} away</p>
                  </div>
                  <button className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-md text-sm font-bold">
                    View on Map
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">No petrol pumps found.</p>
          )}
        </div>
      </section>

      <CFooter />
    </div>
  );
}
