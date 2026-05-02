const { validationResult } = require('express-validator');
const pool = require('../database/mysql');
const { createOrder, verifyPayment } = require('../services/paymentServiceSimulated');
const { sendPaymentSuccessEmail, sendDonationReceiptEmail } = require('../services/emailService');
const { getSettings } = require('../services/settingsService');
const { generateDonationReceipt } = require('../services/pdfReceiptService');

// Create simulated order for donation
const createDonationOrder = async (req, res) => {
    try {
        const { amount, name, email, phone, purpose, panNumber, address } = req.body;
        
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const orderResult = await createOrder(amount, 'donation', { 
            donorName: name, 
            donorEmail: email,
            donorPhone: phone,
            purpose,
            panNumber,
            address
        });
        if (!orderResult.success) {
            return res.status(500).json({ message: orderResult.error || 'Unable to create donation order' });
        }

        res.status(200).json({
            success: true,
            order: orderResult.order,
            razorpayKeyId: 'SIMULATED_KEY',
            donorData: { amount, name, email, phone, purpose, panNumber, address }
        });
    } catch (error) {
        console.error('Error creating donation order:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Verify donation payment
const verifyDonationPayment = async (req, res) => {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            amount, 
            name, 
            email,
            phone,
            purpose,
            panNumber,
            address
        } = req.body;

        const verification = await verifyPayment({
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            signature: razorpay_signature,
            amount
        });

        if (!verification.success) {
            return res.status(400).json({ message: verification.error || 'Payment verification failed' });
        }

        await getSettings(); // keeps settings seeded/ready

        // Generate transaction ID
        const transactionId = 'TXN' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();

        // Insert payment record
        await pool.query(
            `INSERT INTO payments (type, amount, status, payment_id, order_id, donor_name, donor_email, donor_phone, purpose, pan_number, address)
             VALUES ('donation', ?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?)`,
            [amount, verification.payment.id, verification.payment.order_id, name, email, phone, purpose, panNumber, address]
        );

        // Generate PDF receipt
        let receiptInfo = null;
        try {
            receiptInfo = await generateDonationReceipt({
                name,
                email,
                phone,
                amount,
                purpose,
                panNumber,
                address,
                transactionId,
                date: new Date()
            });
        } catch (pdfError) {
            console.error('Error generating PDF receipt:', pdfError);
            // Continue even if PDF generation fails
        }

        // Send confirmation email with PDF attachment
        try {
            await sendDonationReceiptEmail(email, name, amount, purpose, transactionId, receiptInfo);
        } catch (emailError) {
            console.error('Error sending donation confirmation email:', emailError);
            // Continue even if email fails
        }

        res.status(201).json({
            success: true,
            message: 'Donation processed successfully',
            payment: {
                amount,
                type: 'donation',
                status: 'completed'
            },
            receipt: receiptInfo ? {
                downloadUrl: receiptInfo.downloadUrl,
                filename: receiptInfo.filename
            } : null
        });
    } catch (error) {
        console.error('Error verifying donation payment:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    createDonationOrder,
    verifyDonationPayment,
};
