const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;


    if (!username?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }
    

    const newUser = new User({ username, email, password });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: { id: newUser._id, username: newUser.username, email: newUser.email }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Email or username is already in use" });
    }
    res.status(500).json({ success: false, message: "server error", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }


    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ success: false, message: "Incorrect email address or password " });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(403).json({ success: false, message: "Incorrect email address or password" });
    }

    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    user.otp = otpCode;
    user.otpExpires = Date.now() + 1 * 60 * 1000; 
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Verification code to access my smart wallet",
      text: `Hello ${user.username}, your verification code is: ${otpCode}. It is valid for ONE minute.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: "Verification code (OTP) has been sent to your email",
      email: user.email 
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "server error", error: error.message });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "Your verification has expired, please log in again." });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "You have been logged in successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "server error", error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -otp -otpExpires');
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; 
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Reset Password Code",
      text: `Your verification code to reset your password is: ${otp}\nValid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "Verification code sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid verification code." });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "The verification code has expired, please request a new one." });
    }

    user.password = newPassword;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
      token,
      user: { id: user._id, username: user.username, email: user.email }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = { register, login, verifyOTP, getCurrentUser, forgotPassword, resetPassword };