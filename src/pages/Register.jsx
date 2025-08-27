import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon, MapPinIcon, UsersIcon } from '@heroicons/react/24/outline';

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'resident',
    location: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const endpoint =
      form.role === 'plumber'
        ? '/api/auth/register/plumber'
        : '/api/auth/register/resident';

    try {
      await axios.post(endpoint, form);
      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 text-gray-800">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-700">Join HomeEase</h2>
        <form onSubmit={handleRegister} className="space-y-5">

          <div>
            <label className="block mb-1 font-semibold">Name</label>
            <div className="flex items-center border rounded px-2 bg-white shadow-sm">
              <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="text"
                name="name"
                onChange={handleChange}
                required
                className="w-full p-2 outline-none"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Email</label>
            <div className="flex items-center border rounded px-2 bg-white shadow-sm">
              <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="email"
                name="email"
                onChange={handleChange}
                required
                className="w-full p-2 outline-none"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Password</label>
            <div className="flex items-center border rounded px-2 bg-white shadow-sm">
              <LockClosedIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input
                type="password"
                name="password"
                onChange={handleChange}
                required
                className="w-full p-2 outline-none"
                placeholder="********"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Role</label>
            <div className="flex items-center border rounded px-2 bg-white shadow-sm">
              <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
              <select
                name="role"
                onChange={handleChange}
                className="w-full p-2 outline-none"
              >
                <option value="resident">Resident</option>
                <option value="plumber">Plumber</option>
              </select>
            </div>
          </div>

          {form.role === 'plumber' && (
            <div>
              <label className="block mb-1 font-semibold">Location</label>
              <div className="flex items-center border rounded px-2 bg-white shadow-sm">
                <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="location"
                  placeholder="e.g. Nairobi"
                  onChange={handleChange}
                  required
                  className="w-full p-2 outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-200"
          >
            Create Account
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <a href="/login" className="text-blue-600 font-medium hover:underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
