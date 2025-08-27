const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { verifyToken, restrictToRole } = require('../middleware/authMiddleware');

// Add a new review
router.post('/', verifyToken, restrictToRole('resident'), reviewController.createReview);

// Get all reviews for a plumber
router.get('/plumber/:id', reviewController.getPlumberReviews);

// (Optional) Get reviews made by a resident
router.get('/resident/:id', reviewController.getResidentReviews);

module.exports = router;
