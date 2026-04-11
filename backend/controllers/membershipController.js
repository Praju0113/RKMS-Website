const { validationResult } = require('express-validator');
const pool = require('../database/mysql');
const { createOrder, verifyPayment } = require('../services/paymentServiceSimulated');
const { sendMembershipConfirmationEmail } = require('../services/emailService');
const { getSettings } = require('../services/settingsService');
const { generateMembershipId } = require('../utils/idGenerator');

// Create simulated order for membership
const createMembershipOrder = async (req, res) => {
  try {
    const { name, email, phone, dateOfBirth, address, city, state, pincode, aadharNumber } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const [existingMember] = await pool.query('SELECT id FROM members WHERE email = ? LIMIT 1', [email]);
    if (existingMember.length) {
      return res.status(400).json({ message: 'Member with this email already exists' });
    }

    const settings = await getSettings();
    const membershipFee = settings.membershipFee;
    const orderResult = await createOrder(membershipFee, 'membership', { name, email, phone });

    if (!orderResult.success) {
      return res.status(500).json({ message: orderResult.error || 'Unable to create order' });
    }

    res.status(200).json({
      success: true,
      order: orderResult.order,
      razorpayKeyId: 'SIMULATED_KEY',
      memberData: { name, email, phone, dateOfBirth, address, city, state, pincode, aadharNumber },
      amount: membershipFee
    });
  } catch (error) {
    console.error('Error creating membership order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify simulated payment and create membership
const verifyMembershipPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      phone,
      dateOfBirth,
      address,
      city,
      state,
      pincode,
      aadharNumber
    } = req.body;

    const settings = await getSettings();
    const verification = await verifyPayment({
      order_id: razorpay_order_id,
      payment_id: razorpay_payment_id,
      signature: razorpay_signature,
      amount: settings.membershipFee
    });

    if (!verification.success) {
      return res.status(400).json({ message: verification.error || 'Payment verification failed' });
    }

    const membership_id = await generateMembershipId();

    const [memberResult] = await pool.query(
      `INSERT INTO members
      (name, email, phone, membership_id, date_of_birth, address, city, state, pincode, aadhar_number, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, membership_id, dateOfBirth, address, city, state, pincode, aadharNumber || null, true]
    );

    const memberId = memberResult.insertId;

    await pool.query(
      `INSERT INTO payments (member_id, type, amount, status, payment_id, order_id, donor_name, donor_email, donor_phone)
       VALUES (?, 'membership', ?, 'completed', ?, ?, ?, ?, ?)`,
      [memberId, settings.membershipFee, verification.payment.id, verification.payment.order_id, name, email, phone]
    );

    try {
      await sendMembershipConfirmationEmail(email, name, membership_id);
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Membership created successfully',
      membership_id,
      member: { name, email, membership_id }
    });
  } catch (error) {
    console.error('Error verifying membership payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
    createMembershipOrder,
    verifyMembershipPayment,
};
