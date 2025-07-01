import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Sidebar from './Sidebar';
import axios from 'axios';

export default function SalesRevenueAnalytics() {
  const [creditData, setCreditData] = useState([]);
  const [loading, setLoading] = useState(true);

  const processCreditData = (data) => {
    const map = new Map(data.map(item => [item._id, item.totalAmount]));

    const today = new Date();
    const dayOfWeek = today.getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((dayOfWeek + 6) % 7)); // Adjust to Monday

    const result = [];

    for (let i = 0; i < 7; i++) {
      const current = new Date(startOfWeek);
      current.setDate(startOfWeek.getDate() + i);
      const dateString = current.toISOString().split('T')[0];

      result.push({
        date: dateString,
        creditUsage: map.get(dateString) || 0,
      });
    }

    return result;
  };

  useEffect(() => {
    const fetchCreditUsage = async () => {
      try {
        const token = sessionStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/v1/admin/daily-credit-totals', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const formatted = processCreditData(response.data);
        setCreditData(formatted);
      } catch (error) {
        console.error('Error fetching credit usage:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreditUsage();
  }, []);

  const maxCreditUsage = Math.max(...creditData.map(d => d.creditUsage), 0);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <Sidebar />

      <main className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-purple-500">Weekly Credit Usage</h1>

        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="p-6 bg-gray-800 rounded-lg shadow-md">
            {loading ? (
              <p>Loading credit usage data...</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={creditData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    stroke="#fff"
                    tickFormatter={(dateStr) =>
                      new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
                    }
                  />
                  <YAxis
                    stroke="#fff"
                    domain={[0, Math.ceil(maxCreditUsage * 1.2)]}
                  />
                  <Tooltip
                    labelFormatter={(label) =>
                      new Date(label).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                  />
                  <Legend />
                  <Bar dataKey="creditUsage" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
