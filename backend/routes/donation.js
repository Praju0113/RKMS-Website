const express = require('express');
const { body } = require('express-validator');
const { createDonationOrder, verifyDonationPayment } = require('../controllers/donationController');

const router = express.Router();

// Validation middleware
const donationValidation = [
    body('amount').isNumeric().withMessage('Amount must be a number'),
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

// Create donation order
router.post('/create-order', donationValidation, createDonationOrder);

// Verify donation payment
router.post('/verify-payment', verifyDonationPayment);

module.exports = router;
