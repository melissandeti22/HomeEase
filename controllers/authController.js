const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const path = require('path');
const multer = require('multer');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// Setup storage for profile images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // folder to store images
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

exports.upload = multer({ storage });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // Your Gmail
    pass: process.env.EMAIL_PASS      // App password 
  }
});



// Register Resident
exports.registerResident = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO residents (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashedPassword]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or bad input' });
  }
};

// Login Resident
exports.loginResident = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM residents WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    if (user.status === 'banned') {
  return res.status(403).json({ error: 'Your account has been banned.' });
}


    const token = jwt.sign({ id: user.id, role: 'resident' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Register Plumber
exports.registerPlumber = async (req, res) => {
  const { name, email, password, location } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
  `INSERT INTO plumbers (name, email, password, location, approval_status)
   VALUES ($1, $2, $3, $4, $5) RETURNING *`,
  [name, email, hashedPassword, location, 'pending']
);

    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists or bad input' });
  }
};

// Login Plumber
exports.loginPlumber = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM plumbers WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const plumber = result.rows[0];

    // ⛔ Approval + active status check
    if (plumber.approval_status !== 'approved' || plumber.status !== 'active') {
      return res.status(403).json({ error: 'Account not approved or banned' });
    }

    const isMatch = await bcrypt.compare(password, plumber.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: plumber.id, role: 'plumber' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


// Login Admin
exports.loginAdmin = async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM admins WHERE username = $1', [username]);
    if (result.rows.length === 0) return res.status(400).json({ error: 'Invalid credentials' });

    const admin = result.rows[0];
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: admin.id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// View all residents
exports.getAllResidents = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email FROM residents');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch residents' });
  }
};

// View plumbers
// View all plumbers (approved + pending)
exports.getAllPlumbers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, email, location, availability, status, approval_status
      FROM plumbers
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plumbers' });
  }
};



// Update Resident Profile
exports.updateResident = async (req, res) => {
  const { name, email } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE residents SET name = $1, email = $2 WHERE id = $3',
      [name, email, id]
    );
    res.json({ message: 'Resident updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update resident' });
  }
};

// Update Plumber Profile
exports.updatePlumber = async (req, res) => {
  const { name, email, location } = req.body;
  const { id } = req.params;

  try {
    await pool.query(
      'UPDATE plumbers SET name = $1, email = $2, location = $3 WHERE id = $4',
      [name, email, location, id]
    );
    res.json({ message: 'Plumber updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update plumber' });
  }
};

exports.changeResidentPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM residents WHERE id = $1', [id]);
    const resident = result.rows[0];
    if (!resident) return res.status(404).json({ error: 'Resident not found' });

    const isMatch = await bcrypt.compare(currentPassword, resident.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE residents SET password = $1 WHERE id = $2', [hashedPassword, id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.changePlumberPassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { id } = req.params;

  try {
    const result = await pool.query('SELECT * FROM plumbers WHERE id = $1', [id]);
    const plumber = result.rows[0];
    if (!plumber) return res.status(404).json({ error: 'Plumber not found' });

    const isMatch = await bcrypt.compare(currentPassword, plumber.password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE plumbers SET password = $1 WHERE id = $2', [hashedPassword, id]);

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.uploadResidentProfileImage = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No image provided' });

  try {
    const imagePath = `/uploads/${file.filename}`;
    await pool.query('UPDATE residents SET profile_image = $1 WHERE id = $2', [imagePath, id]);
    res.json({ message: 'Image uploaded successfully', imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

exports.uploadPlumberProfileImage = async (req, res) => {
  const { id } = req.params;
  const file = req.file;

  if (!file) return res.status(400).json({ error: 'No image provided' });

  try {
    const imagePath = `/uploads/${file.filename}`;
    await pool.query('UPDATE plumbers SET profile_image = $1 WHERE id = $2', [imagePath, id]);
    res.json({ message: 'Image uploaded successfully', imagePath });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to upload image' });
  }
};

exports.deleteResident = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM residents WHERE id = $1', [id]);
    res.json({ message: 'Resident account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete resident account' });
  }
};

exports.deletePlumber = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM plumbers WHERE id = $1', [id]);
    res.json({ message: 'Plumber account deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete plumber account' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  const { email, role } = req.body; // role = 'resident' or 'plumber'
  const table = role === 'plumber' ? 'plumbers' : 'residents';

  try {
    const result = await pool.query(`SELECT * FROM ${table} WHERE email = $1`, [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Email not found' });
    }

    const user = result.rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await pool.query(
      `UPDATE ${table} SET reset_token = $1, reset_expires = $2 WHERE email = $3`,
      [token, expires, email]
    );

    const resetLink = `http://localhost:3000/reset-password/${role}/${token}`; // change domain in prod

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'HomeEase Password Reset',
      html: `<p>You requested a password reset.</p>
             <p><a href="${resetLink}">Click here to reset your password</a></p>
             <p>This link will expire in 15 minutes.</p>`
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error sending reset email' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, role } = req.params;
  const { newPassword } = req.body;
  const table = role === 'plumber' ? 'plumbers' : 'residents';

  try {
    const result = await pool.query(
      `SELECT * FROM ${table} WHERE reset_token = $1 AND reset_expires > NOW()`,
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(
      `UPDATE ${table}
       SET password = $1, reset_token = NULL, reset_expires = NULL
       WHERE reset_token = $2`,
      [hashedPassword, token]
    );

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};

exports.toggleResidentStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE residents SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: `Resident account ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resident status' });
  }
};

exports.togglePlumberStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await pool.query('UPDATE plumbers SET status = $1 WHERE id = $2', [status, id]);
    res.json({ message: `Plumber account ${status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plumber status' });
  }
};

exports.approvePlumber = async (req, res) => {
  const { id } = req.params;
  const { approval_status } = req.body; // expected: 'approved' or 'pending'

  try {
    await pool.query('UPDATE plumbers SET approval_status = $1 WHERE id = $2', [approval_status, id]);
    res.json({ message: `Plumber ${approval_status}` });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update approval status' });
  }
};
