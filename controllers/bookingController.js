const pool = require('../config/db');

// Create a booking

exports.createBooking = async (req, res) => {
    console.log('Received body:', req.body);
  const { resident_id, plumber_id, issue, service_date, service_time } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO bookings (resident_id, plumber_id, issue, service_date, service_time)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [resident_id, plumber_id, issue, service_date, service_time]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create booking' });
  }
};

// View bookings for a plumber
exports.getPlumberBookings = async (req, res) => {
  const { plumberId } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM bookings WHERE plumber_id = $1 ORDER BY service_date`,
      [plumberId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

// View bookings for a resident
exports.getResidentBookings = async (req, res) => {
  const { residentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT bookings.*, plumbers.name AS plumber_name, plumbers.location AS plumber_location
       FROM bookings
       JOIN plumbers ON bookings.plumber_id = plumbers.id
       WHERE bookings.resident_id = $1
       ORDER BY bookings.service_date`,
      [residentId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch bookings for resident:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};


exports.updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const result = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Status updated successfully', booking: result.rows[0] });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};



exports.getAllBookings = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        bookings.id,
        bookings.issue,
        bookings.service_date,
        bookings.service_time,
        bookings.status,
        r.name AS resident_name,
        r.id AS resident_id,
        p.name AS plumber_name,
        p.id AS plumber_id
      FROM bookings
      JOIN residents r ON bookings.resident_id = r.id
      JOIN plumbers p ON bookings.plumber_id = p.id
      ORDER BY bookings.service_date DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Failed to fetch all bookings:', err);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

exports.cancelBooking = async (req, res) => {
  const { bookingId } = req.params;

  try {
    const result = await pool.query('SELECT status FROM bookings WHERE id = $1', [bookingId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const currentStatus = result.rows[0].status.toLowerCase();
    if (currentStatus !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be cancelled' });
    }

    const update = await pool.query(
      'UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *',
      ['cancelled', bookingId]
    );

    res.json({ message: 'Booking cancelled', booking: update.rows[0] });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


