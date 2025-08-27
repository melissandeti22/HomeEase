import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const Login = () => {
  const [role, setRole] = useState('resident');
  const [form, setForm] = useState({ email: '', username: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginEndpoint = `/api/auth/login/${role}`;
    const payload =
      role === 'admin'
        ? { username: form.username, password: form.password }
        : { email: form.email, password: form.password };

    try {
      const res = await axios.post(loginEndpoint, payload);
      localStorage.setItem('token', res.data.token);

      if (role === 'resident') navigate('/resident/dashboard');
      else if (role === 'plumber') navigate('/plumber/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 text-gray-800">
      <div className="bg-white p-10 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-700">
          Login to HomeEase
        </h2>

        <div className="mb-6">
          <label className="block mb-1 font-semibold">Login as:</label>
          <div className="flex items-center border rounded px-2 bg-white shadow-sm">
            <UsersIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-2 outline-none"
            >
              <option value="resident">Resident</option>
              <option value="plumber">Plumber</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {role === 'admin' ? (
            <div>
              <label className="block mb-1 font-semibold">Username</label>
              <div className="flex items-center border rounded px-2 bg-white shadow-sm">
                <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="text"
                  name="username"
                  onChange={handleChange}
                  required
                  className="w-full p-2 outline-none"
                  placeholder="Admin username"
                />
              </div>
            </div>
          ) : (
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
          )}

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

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-200"
          >
            Login
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <a href="/register" className="text-blue-600 font-medium hover:underline">
            Register
          </a>
        </p>

        <p className="text-sm text-center mt-2">
          <a href="/forgot-password" className="text-blue-600 hover:underline">
            Forgot Password?
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
