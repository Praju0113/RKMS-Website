const nodemailer = require('nodemailer');
const { getSettings } = require('./settingsService');

// Get email configuration dynamically
const getEmailConfig = async () => {
    try {
        const settings = await getSettings();
        return {
            user: settings.emailUser,
            pass: settings.emailPass
        };
    } catch (error) {
        console.error('Error getting email config:', error);
        return null;
    }
};

// Create transporter dynamically
const createTransporter = async () => {
    const emailConfig = await getEmailConfig();
    
    if (!emailConfig || !emailConfig.user || !emailConfig.pass) {
        console.warn('Email configuration not found. Email features will be disabled.');
        return null;
    }

    try {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: emailConfig,
        });
    } catch (error) {
        console.error('Error creating email transporter:', error);
        return null;
    }
};

const sendMembershipConfirmationEmail = async (memberEmail, memberName, membershipId) => {
    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.warn('Skipping membership confirmation email - email not configured');
            return;
        }

        const settings = await getSettings();
        const mailOptions = {
            from: settings.emailUser,
            to: memberEmail,
            subject: 'Welcome to RKS - Membership Confirmation',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Welcome to ${settings.organizationName}!</h2>
                    <p>Dear ${memberName},</p>
                    <p>Thank you for joining ${settings.organizationName}. Your membership has been successfully created.</p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #007bff;">Membership Details:</h3>
                        <p><strong>Membership ID:</strong> ${membershipId}</p>
                        <p><strong>Status:</strong> Active</p>
                    </div>
                    <p>Thank you for being part of our community!</p>
                    <p>Best regards,<br>${settings.organizationName} Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Membership confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending membership confirmation email:', error);
        throw error;
    }
};

const sendPaymentSuccessEmail = async (memberEmail, memberName, amount, type) => {
    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.warn('Skipping payment success email - email not configured');
            return;
        }

        const settings = await getSettings();
        const mailOptions = {
            from: settings.emailUser,
            to: memberEmail,
            subject: `${settings.organizationName} - ${type.charAt(0).toUpperCase() + type.slice(1)} Payment Successful`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #28a745;">Payment Successful!</h2>
                    <p>Dear ${memberName},</p>
                    <p>Your ${type} payment of ₹${amount} has been successfully processed.</p>
                    <div style="background-color: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <h3 style="color: #155724;">Payment Details:</h3>
                        <p><strong>Amount:</strong> ₹${amount}</p>
                        <p><strong>Type:</strong> ${type.charAt(0).toUpperCase() + type.slice(1)}</p>
                        <p><strong>Status:</strong> Completed</p>
                    </div>
                    <p>Thank you for your support!</p>
                    <p>Best regards,<br>${settings.organizationName} Team</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Payment success email sent successfully');
    } catch (error) {
        console.error('Error sending payment success email:', error);
        throw error;
    }
};

module.exports = {
    sendMembershipConfirmationEmail,
    sendPaymentSuccessEmail,
};
