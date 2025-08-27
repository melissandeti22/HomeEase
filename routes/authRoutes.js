const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { getAllResidents, getAllPlumbers } = require('../controllers/authController');
const { verifyToken, restrictToRole } = require('../middleware/authMiddleware');
const { upload } = require('../controllers/authController');



router.get('/residents', verifyToken, restrictToRole('admin'), getAllResidents);
router.get('/plumbers', getAllPlumbers); 




router.post('/register/resident', authController.registerResident);
router.post('/login/resident', authController.loginResident);
router.post('/register/plumber', authController.registerPlumber);
router.post('/login/plumber', authController.loginPlumber);
router.post('/login/admin', authController.loginAdmin);
router.put('/resident/:id', verifyToken, restrictToRole('resident'), authController.updateResident);
router.put('/plumber/:id', verifyToken, restrictToRole('plumber'), authController.updatePlumber);
router.put('/resident/:id/password', verifyToken, restrictToRole('resident'), authController.changeResidentPassword);
router.put(
  '/plumber/:id/password',
  verifyToken,
  restrictToRole('plumber'),
  authController.changePlumberPassword
);
router.post(
  '/resident/:id/upload-image',
  verifyToken,
  restrictToRole('resident'),
  upload.single('profile_image'),
  authController.uploadResidentProfileImage
);
router.post(
  '/plumber/:id/upload-image',
  verifyToken,
  restrictToRole('plumber'),
  upload.single('profile_image'),
  authController.uploadPlumberProfileImage
);
router.delete(
  '/resident/:id',
  verifyToken,
  restrictToRole('resident'),
  authController.deleteResident
);

router.delete(
  '/plumber/:id',
  verifyToken,
  restrictToRole('plumber'),
  authController.deletePlumber
);
router.post('/forgot-password', authController.requestPasswordReset);
router.put('/reset-password/:role/:token', authController.resetPassword);
router.put('/resident/:id/status', verifyToken, restrictToRole('admin'), authController.toggleResidentStatus);
router.put('/plumber/:id/status', verifyToken, restrictToRole('admin'), authController.togglePlumberStatus);
router.put('/plumber/:id/approve', verifyToken, restrictToRole('admin'), authController.approvePlumber);



module.exports = router;
