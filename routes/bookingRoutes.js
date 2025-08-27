const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { verifyToken, restrictToRole } = require('../middleware/authMiddleware');

// Routes
router.post('/', verifyToken, bookingController.createBooking);
router.get('/plumber/:plumberId', verifyToken, bookingController.getPlumberBookings);
router.get('/resident/:residentId', verifyToken, bookingController.getResidentBookings);
router.get('/all', verifyToken, restrictToRole('admin'), bookingController.getAllBookings);
router.put('/status/:bookingId', verifyToken, restrictToRole('plumber'), bookingController.updateBookingStatus);
router.put('/cancel/:bookingId', verifyToken, restrictToRole('resident'), bookingController.cancelBooking);
router.put('/update-status/:id', verifyToken, bookingController.updateBookingStatus);

module.exports = router;
