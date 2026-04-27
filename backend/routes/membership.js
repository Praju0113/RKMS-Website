const express = require('express');
const { body } = require('express-validator');
const { createMembershipOrder, verifyMembershipPayment } = require('../controllers/membershipController');
const { uploadMemberPhoto } = require('../middlewares/upload');

const router = express.Router();

// Validation middleware
const membershipValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('guardianName').trim().notEmpty().withMessage('Guardian name is required'),
    body('gotraName').trim().notEmpty().withMessage('Gotra name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phone').notEmpty().withMessage('Phone number is required'),
    body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
    body('educationalQualification').trim().notEmpty().withMessage('Educational qualification is required'),
    body('profession').trim().notEmpty().withMessage('Profession is required'),
    body('maritalStatus').trim().notEmpty().withMessage('Marital status is required'),
    body('bloodGroup').trim().notEmpty().withMessage('Blood group is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('city').trim().notEmpty().withMessage('City is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('pincode').trim().notEmpty().withMessage('Pincode is required'),
    body('aadharNumber')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ min: 12, max: 12 })
        .withMessage('Aadhar number must be 12 digits'),
];

// Create membership order
router.post('/create-order', membershipValidation, createMembershipOrder);

// Verify membership payment
router.post('/verify-payment', uploadMemberPhoto, verifyMembershipPayment);

module.exports = router;
