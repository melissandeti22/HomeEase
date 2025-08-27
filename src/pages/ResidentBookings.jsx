import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserFromToken } from '../utils/auth';
import Navbar from '../components/Navbar';
import ChatBox from '../components/Chatbox';

const ResidentBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [reviewForm, setReviewForm] = useState({});
  const [activeChatBookingId, setActiveChatBookingId] = useState(null);
  const user = getUserFromToken();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/bookings/resident/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
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
      case 'pending': return `${base} bg-yellow-500`;
      case 'in progress': return `${base} bg-blue-500`;
      case 'completed': return `${base} bg-green-600`;
      case 'cancelled': return `${base} bg-red-500`;
      default: return `${base} bg-gray-500`;
    }
  };

  const handleCancelBooking = async (bookingId) => {
    const confirm = window.confirm('Are you sure you want to cancel this booking?');
    if (!confirm) return;

    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/bookings/cancel/${bookingId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
      );
      alert('Booking cancelled.');
    } catch (err) {
      alert('Cancellation failed.');
      console.error(err.response?.data || err.message);
    }
  };

  const handleReviewChange = (bookingId, field, value) => {
    setReviewForm((prev) => ({
      ...prev,
      [bookingId]: {
        ...prev[bookingId],
        [field]: value
      }
    }));
  };

  const handleSubmitReview = async (bookingId, plumberId) => {
    const review = reviewForm[bookingId];
    if (!review || !review.rating || !review.comment) {
      return alert('Please fill out both rating and comment.');
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/reviews', {
        booking_id: bookingId,
        resident_id: user.id,
        plumber_id: plumberId,
        rating: review.rating,
        comment: review.comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Review submitted!');
      setReviewForm((prev) => ({ ...prev, [bookingId]: {} }));
    } catch (err) {
      alert('Failed to submit review.');
      console.error(err.response?.data || err.message);
    }
  };

  return (
    <>
      <Navbar />

      <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
        <div className="flex justify-between mb-6">
          <a
            href="/resident/book"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Book a Plumbing Service
          </a>
          <a
            href="/resident/profile"
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            View/Edit Profile
          </a>
        </div>

        <h2 className="text-3xl font-bold mb-6">My Plumbing Bookings</h2>

        {bookings.length === 0 ? (
          <p className="text-lg text-gray-600">You haven’t made any bookings yet.</p>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className="mb-6 bg-white rounded shadow">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <div>
                  <p className="font-semibold">Booking #{b.id} - {b.issue}</p>
                  <p className="text-sm text-gray-600">
                    {b.service_date} at {b.service_time}
                  </p>
                  <p className="text-sm text-gray-600">
                    Plumber: {b.plumber_name || 'Assigned Soon'}
                  </p>
                  <span className={getStatusStyle(b.status)}>{b.status}</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {b.status.toLowerCase() === 'pending' && (
                    <button
                      onClick={() => handleCancelBooking(b.id)}
                      className="text-red-600 hover:underline"
                    >
                      Cancel
                    </button>
                  )}

                  {b.plumber_id && (
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() =>
                        setActiveChatBookingId(activeChatBookingId === b.id ? null : b.id)
                      }
                    >
                      {activeChatBookingId === b.id ? 'Hide Chat' : 'Chat with Plumber'}
                    </button>
                  )}
                </div>
              </div>

              {/* ChatBox */}
              {activeChatBookingId === b.id && b.plumber_id && (
                <div className="p-4 border-t bg-gray-50">
                  <ChatBox roomId={b.id.toString()} senderName={user.name} />
                </div>
              )}
            </div>
          ))
        )}

        {/* ✅ Review section below */}
        {bookings.filter(b => b.status === 'completed' && b.plumber_id).map((b) => (
          <div key={b.id} className="mt-6 bg-white p-4 rounded shadow-sm">
            <h4 className="text-lg font-semibold mb-2">
              Leave a Review for Plumber: {b.plumber_name}
            </h4>
            <div className="flex flex-col md:flex-row gap-4 items-start">
              <select
                value={reviewForm[b.id]?.rating || ''}
                onChange={(e) => handleReviewChange(b.id, 'rating', e.target.value)}
                className="border p-2 rounded"
              >
                <option value="">Select Rating</option>
                {[1, 2, 3, 4, 5].map((r) => (
                  <option key={r} value={r}>
                    {r} Star{r > 1 && 's'}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Write your comment"
                value={reviewForm[b.id]?.comment || ''}
                onChange={(e) => handleReviewChange(b.id, 'comment', e.target.value)}
                className="border p-2 rounded flex-1"
              />
              <button
                onClick={() => handleSubmitReview(b.id, b.plumber_id)}
                className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
              >
                Submit Review
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default ResidentBookings;
