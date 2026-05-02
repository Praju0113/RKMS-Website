const express = require('express');
const { body } = require('express-validator');
const { createDonationOrder, verifyDonationPayment } = require('../controllers/donationController');

const router = express.Router();

// Validation middleware
const donationValidation = [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').trim().notEmpty().withMessage('Phone number is required'),
    body('purpose').trim().notEmpty().withMessage('Donation purpose is required'),
    body('panNumber').trim().notEmpty().withMessage('PAN number is required')
        .isLength({ min: 10, max: 10 })
        .withMessage('PAN number must be exactly 10 characters')
        .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
        .withMessage('Invalid PAN number format (5 letters, 4 digits, 1 letter)'),
    body('address').trim().notEmpty().withMessage('Address is required'),
];

// Create donation order
router.post('/create-order', donationValidation, createDonationOrder);

// Verify donation payment
router.post('/verify-payment', verifyDonationPayment);

module.exports = router;
