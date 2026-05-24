const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});


transporter.verify((error, success) => {
  if (error) {
    console.log("Email transporter error:", error.message);
    console.log("Code:", error.code);
  } else {
    console.log("Email transporter ready and authenticated");
  }
});


const sendOTPEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP for Password Reset - Chasing Horizons",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(135deg, #003366 0%, #001a33 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Chasing Horizons</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Reset Your Password</p>
          </div>
          
          <div style="background-color: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; margin-bottom: 20px;">
              Hello,<br><br>
              You requested to reset your password. Use the OTP code below to proceed:
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0; border: 2px solid #003366;">
              <div style="font-size: 36px; font-weight: bold; color: #003366; letter-spacing: 2px; font-family: 'Courier New', monospace;">
                ${otp}
              </div>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-bottom: 20px;">
              This OTP will expire in <strong>5 minutes</strong>
            </p>
            
            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px; margin-bottom: 20px;">
              <p style="margin: 0; color: #92400e; font-size: 13px;">
                <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Chasing Horizons will never ask for your OTP via email.
              </p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-bottom: 30px;">
              If you didn't request this password reset, please ignore this email or contact our support team immediately.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin: 0;">
              © 2026 Chasing Horizons. All rights reserved.<br>
              <a href="#" style="color: #003366; text-decoration: none;">Contact Support</a> | 
              <a href="#" style="color: #003366; text-decoration: none;">Privacy Policy</a>
            </p>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`EMAIL SENT SUCCESSFULLY to ${email}`);
    console.log(`   OTP: ${otp}`);
    console.log(`   Message ID: ${info.messageId}`);
    return { success: true, message: "OTP sent to your email successfully" };
  } catch (error) {
    console.error("\n❌ EMAIL FAILED TO SEND");
    console.error(`Error Code: ${error.code}`);
    console.error(`Error Message: ${error.message}`);
    console.error(`To: ${email}`);
    console.error(`OTP: ${otp}\n`);
    

    return { 
      success: false, 
      message: `Email failed: ${error.message}. Check your Gmail credentials or use console OTP: ${otp}` 
    };
  }
};

module.exports = { sendOTPEmail, transporter };
