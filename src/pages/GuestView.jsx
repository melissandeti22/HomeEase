import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const GuestView = () => {
  const [plumbers, setPlumbers] = useState([]);

  useEffect(() => {
    const fetchPlumbers = async () => {
      try {
        const res = await axios.get('/api/auth/plumbers'); // Public route
        setPlumbers(res.data);
      } catch (err) {
        console.error('Failed to fetch plumbers:', err);
      }
    };

    fetchPlumbers();
  }, []);

  return (
    <>
      <Navbar />
      <div className="p-8 bg-gray-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-center">Explore Available Plumbers</h2>

        {plumbers.length === 0 ? (
          <p className="text-center text-gray-600">No plumbers available at the moment.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {plumbers.map((plumber) => (
              <div key={plumber.id} className="bg-white p-6 rounded-lg shadow text-center">
                <img
                  src={plumber.profile_image || '/default-avatar.png'}
                  alt={plumber.name}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border"
                />
                <h3 className="text-xl font-semibold text-blue-600">{plumber.name}</h3>
                <p className="text-gray-600">{plumber.email}</p>
                <p className="text-sm text-gray-500">Location: {plumber.location}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Availability: {plumber.availability || 'Unknown'}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <p className="text-gray-700">Want to request a service?</p>
          <a
            href="/register"
            className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Create an Account
          </a>
        </div>
      </div>
    </>
  );
};

export default GuestView;
