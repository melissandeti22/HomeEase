import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserFromToken } from '../utils/auth';
import Navbar from '../components/Navbar';
import {
  UsersIcon,
  WrenchScrewdriverIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [residents, setResidents] = useState([]);
  const [plumbers, setPlumbers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [sortBy, setSortBy] = useState('date');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPlumberReviews, setSelectedPlumberReviews] = useState([]);

  const user = getUserFromToken();
  const totalResidents = residents.length;
  const totalPlumbers = plumbers.length;
  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status.toLowerCase() === 'completed').length;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const [resRes, plumbRes, bookingRes] = await Promise.all([
          axios.get('/api/auth/residents', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/auth/plumbers', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/bookings/all', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setResidents(resRes.data);
        setPlumbers(plumbRes.data);
        setBookings(bookingRes.data);
      } catch (err) {
        console.error('Admin fetch error:', err);
      }
    };
    fetchData();
  }, []);

  const pendingPlumbers = plumbers.filter(p => p.approval_status === 'pending');
  const approvedPlumbers = plumbers.filter(p => p.approval_status === 'approved');

  const sortedBookings = [...bookings].sort((a, b) => {
    if (sortBy === 'date') {
      const dateA = new Date(`${a.service_date}T${a.service_time}`);
      const dateB = new Date(`${b.service_date}T${b.service_time}`);
      return dateA - dateB;
    }
    return a.id - b.id;
  });

  const filteredBookings = sortedBookings.filter((b) => {
    const resident = b.resident_name?.toLowerCase() || '';
    const plumber = b.plumber_name?.toLowerCase() || '';
    const matchesSearch = resident.includes(searchTerm.toLowerCase()) || plumber.includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const updateResidentStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/auth/resident/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResidents((prev) => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (err) {
      console.error('Error updating resident status:', err);
    }
  };

  const updatePlumberStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/auth/plumber/${id}/status`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlumbers((prev) => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    } catch (err) {
      console.error('Error updating plumber status:', err);
    }
  };

  const handleApprovalChange = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/auth/plumber/${id}/approve`, { approval_status: status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPlumbers((prev) => prev.map(p => p.id === id ? { ...p, approval_status: status } : p));
    } catch (err) {
      console.error('Failed to update plumber approval status:', err);
    }
  };

  const viewPlumberReviews = async (plumberId) => {
    try {
      const res = await axios.get(`/api/reviews/plumber/${plumberId}`);
      setSelectedPlumberReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
        <h2 className="text-3xl font-bold mb-6">Welcome, Admin!</h2>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div onClick={() => document.getElementById('residents')?.scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer bg-white p-6 rounded-lg shadow hover:scale-[1.01] transition flex items-center gap-4">
            <UsersIcon className="w-10 h-10 text-blue-500" />
            <div>
              <h4 className="text-sm text-gray-600">Total Residents</h4>
              <p className="text-3xl font-bold text-blue-600">{totalResidents}</p>
            </div>
          </div>

          <div onClick={() => document.getElementById('plumbers')?.scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer bg-white p-6 rounded-lg shadow hover:scale-[1.01] transition flex items-center gap-4">
            <WrenchScrewdriverIcon className="w-10 h-10 text-green-500" />
            <div>
              <h4 className="text-sm text-gray-600">Total Plumbers</h4>
              <p className="text-3xl font-bold text-green-600">{totalPlumbers}</p>
            </div>
          </div>

          <div onClick={() => document.getElementById('bookings')?.scrollIntoView({ behavior: 'smooth' })} className="cursor-pointer bg-white p-6 rounded-lg shadow hover:scale-[1.01] transition flex items-center gap-4">
            <ClipboardDocumentListIcon className="w-10 h-10 text-purple-500" />
            <div>
              <h4 className="text-sm text-gray-600">Total Bookings</h4>
              <p className="text-3xl font-bold text-purple-600">{totalBookings}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow flex items-center gap-4">
            <CheckCircleIcon className="w-10 h-10 text-emerald-600" />
            <div>
              <h4 className="text-sm text-gray-600">Completed Bookings</h4>
              <p className="text-3xl font-bold text-emerald-600">{completedBookings}</p>
            </div>
          </div>
        </div>

        {/* Residents Table */}
        <h3 id="residents" className="text-xl font-semibold mb-2">All Registered Residents</h3>
        <table className="w-full border shadow-sm rounded-lg mb-10 bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Account</th>
            </tr>
          </thead>
          <tbody>
            {residents.map(r => (
              <tr key={r.id} className="border-b hover:bg-gray-100">
                <td className="p-3">{r.id}</td>
                <td className="p-3">{r.name}</td>
                <td className="p-3">{r.email}</td>
                <td className="p-3">
                  <select value={r.status} onChange={(e) => updateResidentStatus(r.id, e.target.value)} className={`p-1 rounded ${r.status === 'banned' ? 'bg-red-200' : 'bg-green-200'}`}>
                    <option value="active">active</option>
                    <option value="banned">banned</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Approved Plumbers */}
        <h3 id="plumbers" className="text-xl font-semibold mb-2">All Registered Plumbers</h3>
        <table className="w-full border shadow-sm rounded-lg mb-10 bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Availability</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Reviews</th>
            </tr>
          </thead>
          <tbody>
            {approvedPlumbers.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-100">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">{p.location}</td>
                <td className="p-3">{p.availability || 'N/A'}</td>
                <td className="p-3">
                  <select value={p.status} onChange={(e) => updatePlumberStatus(p.id, e.target.value)} className={`p-1 rounded ${p.status === 'banned' ? 'bg-red-200' : 'bg-green-200'}`}>
                    <option value="active">active</option>
                    <option value="banned">banned</option>
                  </select>
                </td>
                <td className="p-3">
                  <button onClick={() => viewPlumberReviews(p.id)} className="text-blue-600 hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {selectedPlumberReviews.length > 0 && (
          <div className="bg-white p-6 rounded shadow-md mb-8">
            <h4 className="text-xl font-semibold mb-2">Plumber Reviews</h4>
            {selectedPlumberReviews.map((r) => (
              <div key={r.id} className="border-b py-2">
                <p><strong>{r.resident_name}</strong> rated <strong>{r.rating}/5</strong></p>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
        )}

        {/* Pending Plumbers */}
        <h3 className="text-xl font-semibold mt-8 mb-2">Pending Plumbers</h3>
        <table className="w-full border shadow-sm rounded-lg mb-10 bg-white">
          <thead className="bg-yellow-100">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Location</th>
              <th className="p-3 text-left">Approval</th>
            </tr>
          </thead>
          <tbody>
            {pendingPlumbers.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-100">
                <td className="p-3">{p.id}</td>
                <td className="p-3">{p.name}</td>
                <td className="p-3">{p.email}</td>
                <td className="p-3">{p.location}</td>
                <td className="p-3">
                  <select value={p.approval_status} onChange={(e) => handleApprovalChange(p.id, e.target.value)} className="p-1 rounded bg-yellow-200">
                    <option value="pending">pending</option>
                    <option value="approved">approved</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Bookings Section */}
        <h3 id="bookings" className="text-xl font-semibold mb-2">All Bookings</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          <select className="p-2 border rounded" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date">Sort by Date</option>
            <option value="id">Sort by ID</option>
          </select>
          <input type="text" placeholder="Search by name" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border rounded flex-1" />
          <select className="p-2 border rounded" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <table className="w-full border shadow-sm rounded-lg bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Resident</th>
              <th className="p-3 text-left">Plumber</th>
              <th className="p-3 text-left">Issue</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Time</th>
              <th className="p-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(b => (
              <tr key={b.id} className="border-b hover:bg-gray-100">
                <td className="p-3">{b.id}</td>
                <td className="p-3">{b.resident_name} (ID: {b.resident_id})</td>
                <td className="p-3">{b.plumber_name} (ID: {b.plumber_id})</td>
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
      </div>
    </>
  );
};

export default AdminDashboard;
