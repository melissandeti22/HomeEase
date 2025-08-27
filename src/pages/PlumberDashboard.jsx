import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserFromToken } from '../utils/auth';
import Navbar from '../components/Navbar';
import ChatBox from '../components/Chatbox';
import {
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

const PlumberDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [chatVisibleId, setChatVisibleId] = useState(null); // for toggling chat visibility
  const user = getUserFromToken();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/bookings/plumber/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setBookings(res.data);
      } catch (err) {
        console.error('Failed to fetch plumber bookings:', err);
      }
    };

    fetchBookings();
  }, [user.id]);

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/bookings/update-status/${bookingId}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(prev =>
        prev.map(b => b.id === bookingId ? { ...b, status: newStatus } : b)
      );
      alert('Status updated');
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const getAvailableStatusOptions = (currentStatus) => {
    if (currentStatus === 'pending') return ['in progress', 'completed'];
    if (currentStatus === 'in progress') return ['completed'];
    return [];
  };

  const getStatusStyle = (status) => {
    const base = 'px-3 py-1 rounded-full text-white text-sm font-semibold capitalize';
    switch (status.toLowerCase()) {
      case 'pending': return `${base} bg-yellow-500`;
      case 'in progress': return `${base} bg-blue-500`;
      case 'completed': return `${base} bg-green-600`;
      case 'cancelled': return `${base} bg-red-500`;
      default: return `${base} bg-gray-500`;
    }
  };

  const totalBookings = bookings.length;
  const completedJobs = bookings.filter(b => b.status.toLowerCase() === 'completed').length;
  const activeJobs = bookings.filter(
    b => ['pending', 'in progress'].includes(b.status.toLowerCase())
  ).length;

  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/reviews/plumber/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setReviews(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchReviews();
  }, []);

  return (
    <>
      <Navbar />
      <a
        href="/plumber/profile"
        className="inline-block mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        View/Edit Profile
      </a>

      <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Welcome, Plumber!</h2>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <ClipboardDocumentListIcon className="w-10 h-10 text-blue-500" />
            <div>
              <h4 className="text-gray-600 text-sm">Total Assigned Bookings</h4>
              <p className="text-3xl font-bold text-blue-600">{totalBookings}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
            <div>
              <h4 className="text-gray-600 text-sm">Completed Jobs</h4>
              <p className="text-3xl font-bold text-green-600">{completedJobs}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
            <BriefcaseIcon className="w-10 h-10 text-purple-600" />
            <div>
              <h4 className="text-gray-600 text-sm">Active Bookings</h4>
              <p className="text-3xl font-bold text-purple-600">{activeJobs}</p>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <h3 className="text-xl font-semibold mb-2">My Assigned Bookings</h3>
        {bookings.length === 0 ? (
          <p>No bookings assigned to you yet.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="bg-white shadow mb-6 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-100">
                <div>
                  <p className="font-semibold">Booking #{b.id} - {b.issue}</p>
                  <p className="text-sm text-gray-600">Resident: {b.resident_name}</p>
                  <p className="text-sm text-gray-600">Date: {b.service_date} | Time: {b.service_time}</p>
                  <span className={getStatusStyle(b.status)}>{b.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  {['pending', 'in progress'].includes(b.status.toLowerCase()) && (
                    <select
                      value={b.status}
                      onChange={(e) => updateBookingStatus(b.id, e.target.value)}
                      className="p-1 border rounded"
                    >
                      <option value={b.status}>{b.status}</option>
                      {getAvailableStatusOptions(b.status).map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  )}
                  <button
                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                    onClick={() => setChatVisibleId(chatVisibleId === b.id ? null : b.id)}
                  >
                    <ChatBubbleLeftRightIcon className="w-5 h-5" />
                    {chatVisibleId === b.id ? 'Hide Chat' : 'Chat'}
                  </button>
                </div>
              </div>
              {chatVisibleId === b.id && (
                <div className="p-4">
                  <ChatBox roomId={b.id.toString()} senderName={user.name} />
                </div>
              )}
            </div>
          ))
        )}

        {/* Reviews */}
        <h3 className="text-xl font-semibold mt-10 mb-2">Resident Feedback</h3>
        {reviews.length === 0 ? (
          <p>No reviews yet.</p>
        ) : (
          <ul className="space-y-3">
            {reviews.map(r => (
              <li key={r.id} className="p-4 bg-white shadow rounded">
                <p className="font-semibold">{r.resident_name} rated {r.rating}/5</p>
                <p className="text-gray-700">{r.comment}</p>
                <p className="text-sm text-gray-500">{new Date(r.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
};

export default PlumberDashboard;

