import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import twilioClient from "../config/twilio.js"
import * as userModel from "../models/userModel.js";

import dotenv from "dotenv";

dotenv.config();


// Login (Check password + Send otp)
export const sendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile || mobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid mobile number"
      });
    }

    const formattedPhone = `+91${mobile}`;
    const user = await userModel.findUserByMobile(formattedPhone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Mobile number not registered. Please register first."
      });
    }


    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: "sms",
      });

    return res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    return next(error);
  }
};




//verify otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        message: "Mobile and OTP required"
      });
    }

    const formattedPhone = `+91${mobile}`;

    const verificationCheck = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: formattedPhone,
        code: otp,
      });

    console.log("Twilio Status:", verificationCheck.status);
    const now = new Date().toLocaleString();
    console.log("Messaging SID:", process.env.TWILIO_MESSAGING_SERVICE_SID);

    //if approved send sms to user using twilio message create
    if (verificationCheck.status === "approved") {
      await twilioClient.messages.create({
        body: `Login successful on ${now}. If this wasn't you, contact support immediately.`,
        messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
        to: formattedPhone,
      }).catch(err => console.error("SMS Error:", err));

    }

    // Find user
    const user = await userModel.findUserByMobile(formattedPhone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        mobile: user.mobile
      }
    });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    return next(error);
  }
};


//resend otp
export const resendOtp = async (req, res, next) => {
  try {
    const { mobile } = req.body;

    if (!mobile) {
      return res.status(400).json({
        success: false,
        message: "Mobile number required"
      });
    }

    const formattedPhone = `+91${mobile}`;
    const user = await userModel.findUserByMobile(formattedPhone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    

    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: "sms",
      });

    return res.json({
      success: true,
      message: "OTP resent successfully"
    });

  } catch (error) {
    console.error("Resend OTP Error:", error);
    return next(error);
  }
};


export const loginWithPassword = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    // Validate input
    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile and password are required"
      });
    }

    const formattedPhone = `+91${mobile}`;
    // Check if user exists
    const user = await userModel.findUserByMobile(formattedPhone);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found. Please register first."
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid mobile number or password"
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Send response
    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        mobile: user.mobile
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return next(error);
  }
};



export const registerAndSendOtp = async (req, res, next) => {
  try {
    const { fullName, mobile, countryCode } = req.body;

    if (!fullName || !mobile) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const formattedPhone = `${countryCode}${mobile}`;
    console.log("Formatted Phone:", formattedPhone);

    // Check if user already exists
    const existingUser = await userModel.findUserByMobile(formattedPhone);

    console.log("Existing user:", existingUser);

    if (existingUser != undefined) {
      return res.status(400).json({
        success: false,
        message: "User already registered. Please login."
      });
    }

    // Create user
    await userModel.createUser(fullName, formattedPhone);

    // Send OTP using Twilio Verify
    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: formattedPhone,
        channel: "sms",
      });

    return res.json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    console.error("Register Error:", error);
    next(error);
  }
};



export const setPassword = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    if (!mobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Mobile and password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters"
      });
    }

    // 1️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2️⃣ Update DB
    const updated = await userModel.updatePassword(mobile, hashedPassword);

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      { mobile },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      message: "Password set successfully",
      token
    });

  } catch (error) {
    console.error("Set Password Error:", error);
    next(error);
  }
};


