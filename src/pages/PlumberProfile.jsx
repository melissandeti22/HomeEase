import { useEffect, useState } from 'react';
import axios from 'axios';
import { getUserFromToken } from '../utils/auth';
import Navbar from '../components/Navbar';


const PlumberProfile = () => {
  const user = getUserFromToken();
  const [form, setForm] = useState({ name: '', email: '', location: '' });
  const [loading, setLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`/api/auth/plumbers`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const currentPlumber = res.data.find((p) => p.id === user.id);
        if (currentPlumber) {
          setForm({
            name: currentPlumber.name,
            email: currentPlumber.email,
            location: currentPlumber.location || '',
          });
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };

    fetchProfile();
  }, [user.id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/auth/plumber/${user.id}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
  e.preventDefault();
  if (passwordForm.newPassword !== passwordForm.confirmPassword) {
    alert("New passwords don't match");
    return;
  }

  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `/api/auth/plumber/${user.id}/password`,
      {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    alert('Password changed successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  } catch (err) {
    console.error(err);
    alert('Failed to change password. Check your current password.');
  }
};

const handleImageUpload = async (file) => {
  const formData = new FormData();
  formData.append('profile_image', file);

  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      `/api/auth/plumber/${user.id}/upload-image`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    setForm({ ...form, profile_image: res.data.imagePath });
    alert('Profile image updated!');
  } catch (err) {
    console.error(err);
    alert('Failed to upload image');
  }
};

const handleDeleteAccount = async () => {
  const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
  if (!confirmed) return;

  try {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/auth/${user.role}/${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    alert('Your account has been deleted.');
    localStorage.removeItem('token');
    window.location.href = '/';
  } catch (err) {
    console.error(err);
    alert('Failed to delete account.');
  }
};

  return (
    <>
      <Navbar />
      <div className="p-8 bg-gray-50 min-h-screen text-gray-800">
        <h2 className="text-3xl font-bold mb-6">My Profile</h2>
       {/* ✅ View Profile Summary Card */}
<div className="max-w-md bg-white p-6 rounded-lg shadow mb-6 flex items-center gap-4">
  <img
    src={form.profile_image || '/default-avatar.png'}
    alt="Profile"
    className="w-20 h-20 rounded-full object-cover border"
  />
  <div>
    <h3 className="text-xl font-semibold text-gray-800">{form.name}</h3>
    <p className="text-gray-600">{form.email}</p>
    <p className="text-gray-500">{form.location}</p>
    <p className="text-sm text-gray-400 mt-1">Plumber</p>
  </div>
</div>



        <form
          onSubmit={handleSubmit}
          className="max-w-md bg-white p-6 rounded-lg shadow"
        >
            <div className="mb-4">
  <label className="block mb-1 font-medium">Profile Photo</label>
  <input
    type="file"
    accept="image/*"
    onChange={(e) => handleImageUpload(e.target.files[0])}
    className="block w-full"
  />
</div>

{form.profile_image && (
  <img
    src={form.profile_image}
    alt="Profile"
    className="w-32 h-32 rounded-full object-cover mt-2 border"
  />
)}

          <div className="mb-4">
            <label className="block mb-1 font-medium">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
        <hr className="my-6" />
<h3 className="text-xl font-semibold mb-2">Change Password</h3>

<form
  onSubmit={handlePasswordChange}
  className="max-w-md bg-white p-6 rounded-lg shadow mt-4"
>
  <div className="mb-4">
    <label className="block mb-1 font-medium">Current Password</label>
    <input
      type="password"
      value={passwordForm.currentPassword}
      onChange={(e) =>
        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
      }
      className="w-full p-2 border rounded"
      required
    />
  </div>
  <div className="mb-4">
    <label className="block mb-1 font-medium">New Password</label>
    <input
      type="password"
      value={passwordForm.newPassword}
      onChange={(e) =>
        setPasswordForm({ ...passwordForm, newPassword: e.target.value })
      }
      className="w-full p-2 border rounded"
      required
    />
  </div>
  <div className="mb-4">
    <label className="block mb-1 font-medium">Confirm New Password</label>
    <input
      type="password"
      value={passwordForm.confirmPassword}
      onChange={(e) =>
        setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
      }
      className="w-full p-2 border rounded"
      required
    />
  </div>

  <button
    type="submit"
    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
  >
    Change Password
  </button>
</form>

      </div>
      <hr className="my-6" />
<button
  onClick={handleDeleteAccount}
  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
>
  Delete My Account
</button>

    </>
  );
};

export default PlumberProfile;
