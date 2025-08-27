import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserFromToken } from '../utils/auth';
import Navbar from '../components/Navbar';

const ResidentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const user = getUserFromToken();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/bookings/resident/${user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch resident bookings:', err);
      }
    };

    fetchBookings();
  }, [user.id]);

  const getStatusStyle = (status) => {
    const base = 'px-3 py-1 rounded-full text-white text-sm font-semibold capitalize';
    switch (status.toLowerCase()) {
      case 'pending':
        return `${base} bg-yellow-500`;
      case 'in progress':
        return `${base} bg-blue-500`;
      case 'completed':
        return `${base} bg-green-600`;
      case 'cancelled':
        return `${base} bg-red-500`;
      default:
        return `${base} bg-gray-500`;
    }
  };

  return (
<>
<Navbar/>

    <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
      <h2 className="text-3xl font-bold mb-6">My Plumbing Bookings</h2>

      {bookings.length === 0 ? (
        <p>You haven’t made any bookings yet.</p>
      ) : (
        <table className="w-full border shadow-sm rounded-lg bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">Booking ID</th>
              <th className="p-3 text-left">Plumber</th>
              <th className="p-3 text-left">Issue</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-b hover:bg-gray-100">
                <td className="p-3">{b.id}</td>
                <td className="p-3">{b.plumber_name || 'Assigned Soon'}</td>
                <td className="p-3">{b.issue}</td>
                <td className="p-3">{b.service_date}</td>
                <td className="p-3">{b.service_time}</td>
                <td className="p-3">
                  <span className={getStatusStyle(b.status)}>{b.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button
  onClick={() => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }}
  className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
>
  Logout
</button>

    </div>
    </>
    
  );
};

export default ResidentBookings;
