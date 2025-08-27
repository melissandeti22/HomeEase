// src/components/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { getUserFromToken } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow px-6 py-3 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-blue-600">HomeEase</h1>
      <div className="space-x-4">
        {user?.role === 'resident' && (
          <>
            <Link to="/resident/dashboard" className="text-gray-700 hover:text-blue-600">
              Dashboard
            </Link>
            <Link to="/resident/book" className="text-gray-700 hover:text-blue-600">
              Book Service
            </Link>
          </>
        )}

        {user?.role === 'plumber' && (
          <Link to="/plumber/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
        )}

        {user?.role === 'admin' && (
          <Link to="/admin/dashboard" className="text-gray-700 hover:text-blue-600">
            Dashboard
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
