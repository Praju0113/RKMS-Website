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

const sendDonationReceiptEmail = async (memberEmail, memberName, amount, purpose, transactionId, receiptInfo) => {
    try {
        const transporter = await createTransporter();
        if (!transporter) {
            console.warn('Skipping donation receipt email - email not configured');
            return;
        }

        const settings = await getSettings();
        
        // Prepare email options
        const mailOptions = {
            from: settings.emailUser,
            to: memberEmail,
            subject: `${settings.organizationName} - Donation Receipt #${transactionId}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #0A6C87, #085569); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
                        <h1 style="margin: 0; font-size: 28px;">🙏 Thank You for Your Donation!</h1>
                        <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">Your generous contribution makes a real difference</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e0e0e0; border-top: none;">
                        <p style="font-size: 16px; color: #333; margin-bottom: 25px;">Dear ${memberName},</p>
                        
                        <p style="font-size: 16px; color: #555; margin-bottom: 20px;">
                            We're incredibly grateful for your generous donation of <strong style="color: #28a745; font-size: 18px;">₹${parseFloat(amount).toLocaleString('en-IN')}</strong> towards <strong style="color: #0A6C87;">${purpose.charAt(0).toUpperCase() + purpose.slice(1)}</strong>. Your support helps us continue our mission to empower women and strengthen communities.
                        </p>
                        
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #0A6C87;">
                            <h3 style="color: #0A6C87; margin-top: 0;">Donation Details:</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;">
                                <div>
                                    <strong style="color: #666;">Receipt Number:</strong><br>
                                    <span style="color: #333;">#${transactionId}</span>
                                </div>
                                <div>
                                    <strong style="color: #666;">Date:</strong><br>
                                    <span style="color: #333;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div>
                                    <strong style="color: #666;">Amount:</strong><br>
                                    <span style="color: #28a745; font-weight: bold; font-size: 16px;">₹${parseFloat(amount).toLocaleString('en-IN')}</span>
                                </div>
                                <div>
                                    <strong style="color: #666;">Purpose:</strong><br>
                                    <span style="color: #0A6C87; font-weight: bold;">${purpose.charAt(0).toUpperCase() + purpose.slice(1)}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;">
                            <h4 style="color: #155724; margin-top: 0;">📄 Your Official Receipt</h4>
                            <p style="color: #155724; margin-bottom: 15px;">
                                Your official tax receipt is attached to this email as a PDF document. This receipt is valid for tax deduction under Section 80G of the Income Tax Act, 1961.
                            </p>
                            <ul style="color: #155724; margin: 0; padding-left: 20px;">
                                <li>Save the PDF for your records</li>
                                <li>Use it for tax filing purposes</li>
                                <li>Reference number: #${transactionId}</li>
                            </ul>
                        </div>
                        
                        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
                            <p style="color: #856404; margin: 0;">
                                <strong>📧 Need Help?</strong><br>
                                If you have any questions about your donation or need additional documentation, please don't hesitate to contact us.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                            <p style="color: #666; margin: 0; font-size: 14px;">
                                With heartfelt gratitude,<br>
                                <strong style="color: #0A6C87;">${settings.organizationName} Team</strong>
                            </p>
                            <p style="color: #999; margin: 15px 0 0 0; font-size: 12px;">
                                📧 ${settings.emailUser || 'contact@rkms.org'} | 🌐 www.rkms.org
                            </p>
                        </div>
                    </div>
                </div>
            `,
        };

        // Add PDF attachment if available
        if (receiptInfo && receiptInfo.success && receiptInfo.filePath) {
            const fs = require('fs');
            if (fs.existsSync(receiptInfo.filePath)) {
                mailOptions.attachments = [{
                    filename: receiptInfo.filename,
                    path: receiptInfo.filePath,
                    contentType: 'application/pdf'
                }];
            }
        }

        await transporter.sendMail(mailOptions);
        console.log('Donation receipt email sent successfully with PDF attachment');
    } catch (error) {
        console.error('Error sending donation receipt email:', error);
        throw error;
    }
};

module.exports = {
    sendMembershipConfirmationEmail,
    sendPaymentSuccessEmail,
    sendDonationReceiptEmail,
};
