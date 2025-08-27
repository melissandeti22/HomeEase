import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserFromToken } from '../utils/auth';
import { useNavigate } from 'react-router-dom';

const BookingForm = () => {
  const [plumbers, setPlumbers] = useState([]);
  const [form, setForm] = useState({
    plumber_id: '',
    issue: '',
    service_date: '',
    service_time: ''
  });
  const navigate = useNavigate();
  const user = getUserFromToken();

  useEffect(() => {
    const fetchPlumbers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/auth/plumbers', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setPlumbers(res.data);
      } catch (err) {
        console.error('Error fetching plumbers:', err);
        alert('Failed to fetch plumbers');
      }
    };
    fetchPlumbers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const bookingData = {
        ...form,
        resident_id: user.id
      };

      await axios.post('/api/bookings', bookingData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      alert('Booking successful!');
      navigate('/resident/dashboard');
    } catch (err) {
      console.error('Booking error:', err);
      alert('Booking failed.');
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen flex items-start justify-center text-gray-800">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-8">
        <h2 className="text-3xl font-bold mb-6 text-center">
          Book a Plumbing Service
        </h2>

        <form onSubmit={handleBooking} className="space-y-5">
          {/* Select Plumber */}
          <div>
            <label className="block mb-1 font-medium">Select Plumber:</label>
            <select
              name="plumber_id"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded p-2"
            >
              <option value="">-- Select a Plumber --</option>
              {plumbers.map((plumber) => (
                <option key={plumber.id} value={plumber.id}>
                  {plumber.name} – {plumber.location}
                </option>
              ))}
            </select>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block mb-1 font-medium">Issue Description:</label>
            <textarea
              name="issue"
              placeholder="e.g. leaking pipe in bathroom"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block mb-1 font-medium">Date:</label>
            <input
              type="date"
              name="service_date"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block mb-1 font-medium">Time:</label>
            <input
              type="time"
              name="service_time"
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded p-2"
            />
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            >
              Book Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;
