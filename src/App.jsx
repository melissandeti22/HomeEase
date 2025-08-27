import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ResidentDashboard from './pages/ResidentDashboard';
import PlumberDashboard from './pages/PlumberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import BookingForm from './pages/BookingForm';
import ResidentBookings from './pages/ResidentBookings';
import LandingPage from './pages/LandingPage';
import ResidentProfile from './pages/ResidentProfile';
import PlumberProfile from './pages/PlumberProfile';
import GuestView from './pages/GuestView';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import 'leaflet/dist/leaflet.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/resident/bookings" element={<ResidentDashboard />} />
        <Route path="/plumber/dashboard" element={<PlumberDashboard />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/resident/book" element={<BookingForm />} />
        <Route path="/resident/dashboard" element={<ResidentBookings />} />
        <Route path="/home" element={<LandingPage />} />
        <Route path="/resident/profile" element={<ResidentProfile />} />
        <Route path="/plumber/profile" element={<PlumberProfile />} />
        <Route path="/guest-view" element={<GuestView />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
       <Route path="/reset-password/:role/:token" element={<ResetPassword />} />

      </Routes>
    </Router>
  );
}

export default App;

