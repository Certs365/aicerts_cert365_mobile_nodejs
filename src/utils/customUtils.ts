import dotenv from 'dotenv';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

dotenv.config();

// Define the mail options object type
const mailOptions: SendMailOptions = {
    from: {
        name: 'AICerts Admin',
        address: process.env.USER_MAIL || '',
    },
    to: '',
    subject: '',
    text: '',
};

const transporter: Transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.USER_NAME,
        pass: process.env.MAIL_PWD,
    },
});

const sendEmail = async (name: string, email: string, otp: number): Promise<void> => {
    try {
        mailOptions.to = email;
        mailOptions.subject = `Your Authentication OTP`;
        mailOptions.text = `Hi ${name},
  
  Your one-time password (OTP) is ${otp}. Please enter this code to complete your authentication process.
  
  If you did not request this code, please ignore this message.
          
  Best regards,
  The AICerts Team`;
        transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

const sendWelcomeMail = async (name: string, email: string) => {
    try {
      mailOptions.to = email;
      mailOptions.subject = `Welcome to AICerts`;
      mailOptions.text = `Hi ${name},
  
  Welcome to the AICerts Portal, Your registration is now complete.
  
  Your account details will be reviewed and approved by our admin team. Once your account has been approved, you will receive a notification with further instructions.
  
  Thank you for joining us.
  
  Best regards,
  The AICerts Team.`;
      transporter.sendMail(mailOptions);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

const generateOTP = async () => {
    try {
        // Generate a random 6-digit number
        const otp = Math.floor(100000 + Math.random() * 900000);
        return otp;
    } catch (error) {
        console.error("Error generating OTP:", error);
        throw error;
    }
};

export {
    sendEmail,
    sendWelcomeMail,
    generateOTP
};