const pool = require('../config/db');

// Resident submits review
exports.createReview = async (req, res) => {
  const { rating, comment, plumber_id, booking_id } = req.body;
  const resident_id = req.user.id;

  try {
    const existing = await pool.query(
      'SELECT * FROM reviews WHERE booking_id = $1',
      [booking_id]
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'You already reviewed this booking.' });
    }

    await pool.query(
      `INSERT INTO reviews (resident_id, plumber_id, booking_id, rating, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [resident_id, plumber_id, booking_id, rating, comment]
    );

    res.json({ message: 'Review submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

exports.getPlumberReviews = async (req, res) => {
  const plumberId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT r.*, res.name AS resident_name
       FROM reviews r
       JOIN residents res ON r.resident_id = res.id
       WHERE r.plumber_id = $1
       ORDER BY r.created_at DESC`,
      [plumberId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

exports.getResidentReviews = async (req, res) => {
  const residentId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT r.*, p.name AS plumber_name
       FROM reviews r
       JOIN plumbers p ON r.plumber_id = p.id
       WHERE r.resident_id = $1
       ORDER BY r.created_at DESC`,
      [residentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};
