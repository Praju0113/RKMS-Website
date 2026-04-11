const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const { 
    adminLogin, 
    getDashboard, 
    getMembers, 
    getPayments,
    getEventRegistrations
} = require('../controllers/adminController');

const router = express.Router();

// Validation middleware
const loginValidation = [
    body('username').trim().notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
];

// Public routes
router.post('/login', loginValidation, adminLogin);

// Protected routes (require authentication)
router.use(protect); // Apply auth middleware to all routes below

router.get('/dashboard', getDashboard);
router.get('/members', getMembers);
router.get('/payments', getPayments);
router.get('/event-registrations', getEventRegistrations);

module.exports = router;
