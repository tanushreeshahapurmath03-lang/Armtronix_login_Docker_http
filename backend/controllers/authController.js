require('dotenv').config();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Counter = require('../models/Counter');
const User = require('../models/User');
const nodemailer = require('nodemailer');



// Configure Gmail SMTP Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// Use environment variables consistently
const JWT_SECRET = process.env.VITE_JWT_SECRET;
const FRONTEND_URL = process.env.VITE_FRONTEND_URL;

// Verify JWT_SECRET exists
if (!JWT_SECRET) {
  console.error('WARNING: JWT_SECRET is not defined in environment variables');
}


exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      requirePasswordChange: user.requirePasswordChange,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

async function getNextEmpId() {
  const lastUser = await User.find({ empId: { $exists: true } })
    .sort({ empId: -1 })
    .limit(1);

  let lastEmpId = 0;

  if (lastUser.length > 0) {
    // Extract number from "EMP123" (ignore prefix)
    const match = lastUser[0].empId.match(/\d+$/);
    if (match) {
      lastEmpId = parseInt(match[0], 10);
    }
  }

  const newEmpId = lastEmpId + 1;
  return `${newEmpId}`;
}


// exports.register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const empId = await getNextEmpId();
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'Email already registered' });
//     }
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//       empId: `${empId}`, 
//       role: role || 'employee',
//       requirePasswordChange: true
//     });

//     await newUser.save();

//     res.status(201).json({
//       message: 'User registered successfully',
//       user: {
//         id: newUser._id,
//         name: newUser.name,
//         empId: newUser.empId,
//         email: newUser.email,
//         role: newUser.role
//       }
//     });
//   } catch (error) {
//     console.error('Register error:', error);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


exports.register = async (req, res) => {
  try {
    const { name, email, password, role, employeeId } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Check if empId already exists
    const existingEmp = await User.findOne({ empId: employeeId });
    if (existingEmp) {
      return res.status(400).json({ message: 'Employee ID already registered' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      empId: employeeId, // Use manually entered ID
      role: role || 'employee',
      requirePasswordChange: true
    });

    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        empId: newUser.empId,
        email: newUser.email,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    req.user.password = hashedPassword;
    req.user.requirePasswordChange = false;

    if (!req.user.name) {
      req.user.name = 'Unknown';
    }

    await req.user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log("Received Forgot Password request for:", email);

  try {
    // Check if JWT_SECRET exists
    if (!JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: 'Server configuration error' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.error("User not found:", email);
      // For security, don't reveal whether a user exists or not
      return res.status(200).json({ message: 'If your email is registered, you will receive a reset link shortly' });
    }

    console.log("User found:", user.email);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    console.log("Generated token:", token);

    const resetLink = `${FRONTEND_URL}/reset-password/${token}`;
    console.log("Reset link:", resetLink);

    // const mailOptions = {
    //   from: process.env.GMAIL_USER,
    //   to: email,
    //   subject: 'Password Reset',
    //   html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    // };

    const mailOptions = {
      from: `" Armtronix Support Team" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: '🔐 Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; font-size: 14px; color: #000 !important; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #1e3a8a; text-align: center;">Password Reset Request</h2>
          <p>Dear ${user.name || "User"},</p>
          <p>We received a request to reset your password. Please click the button below to reset it.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" 
               style="background-color: #1e3a8a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-size: 16px;">
              Reset My Password
            </a>
          </div>

          <p>If the button above doesn't work, you can also copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 5px;">
            <a href="${resetLink}" style="color: #1e3a8a;">${resetLink}</a>
          </p>

          <p><strong>Note:</strong> This link is valid for <strong>1 hour</strong>. If you did not request this change, you can ignore this email.</p>
          
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 14px; text-align: center; color: #333;">
            Regards,<br>
            <strong>Armtronix IoT Pvt.Ltd.</strong><br>
            📩 info@armtronix.in | 📞 +91 98803 10042
          </p>
        </div>
      `,
    };

    console.log("Sending email...");
    // Email disabled for local development
    console.log(`Email disabled: Would send password reset email to ${email}`);
    // await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");

    res.json({ message: 'Reset link sent to email' });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
};


