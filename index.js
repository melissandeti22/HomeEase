const express = require('express');
const http = require('http'); //  
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

const { verifyToken, restrictToRole } = require('./middleware/authMiddleware');

dotenv.config();

const app = express();
const server = http.createServer(app); // Wrap express with HTTP server
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000', // Change if your frontend runs on another domain
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

//  Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

// ✅ Public route
app.get('/', (req, res) => {
  res.send('HomeEase API is running!');
});

// ✅ Auth-protected sample routes
app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.role}, you are authenticated!` });
});
app.get('/api/admin-only', verifyToken, restrictToRole('admin'), (req, res) => {
  res.json({ message: 'Welcome, Admin! This is a restricted area.' });
});
app.get('/api/plumber-only', verifyToken, restrictToRole('plumber'), (req, res) => {
  res.json({ message: 'Welcome, Plumber! This is your dashboard.' });
});
app.get('/api/resident-only', verifyToken, restrictToRole('resident'), (req, res) => {
  res.json({ message: 'Welcome, Resident! View your bookings here.' });
});

// ✅ Socket.IO setup
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (bookingId) => {
    socket.join(bookingId);
    console.log(`Socket joined room ${bookingId}`);
  });

  socket.on('sendMessage', (data) => {
    io.to(data.bookingId).emit('receiveMessage', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

