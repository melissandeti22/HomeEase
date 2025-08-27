import { useState } from 'react';
import axios from 'axios';

const ReviewForm = ({ bookingId, plumberId }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const submitReview = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/reviews', {
        booking_id: bookingId,
        plumber_id: plumberId,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSubmitted(true);
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting review');
    }
  };

  if (submitted) return <p className="text-green-600">Review submitted ✅</p>;

  return (
    <div className="p-4 bg-gray-100 rounded mt-2">
      <h4 className="font-semibold mb-1">Leave a Review</h4>
      <div className="flex items-center gap-2 mb-2">
        <label>Rating:</label>
        <select value={rating} onChange={(e) => setRating(e.target.value)} className="border rounded p-1">
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <textarea
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border rounded p-2 mb-2"
      />
      <button onClick={submitReview} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
        Submit
      </button>
    </div>
  );
};

export default ReviewForm;
