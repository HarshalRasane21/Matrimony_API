import express from "express";
import {sendOtp , verifyOtp, resendOtp, loginWithPassword, registerAndSendOtp, setPassword} from "../controllers/authcontroller.js";
import { verifyToken } from "../middleware/jwtMiddleware.js";

const router = express.Router();

//login route
router.post("/otplogin", sendOtp);

//verify-otp route
router.post("/verify-otp", verifyOtp);

//resend-otp route
router.post("/resend-otp", resendOtp);

router.post("/login", loginWithPassword);

router.post("/register/send-otp", registerAndSendOtp);

router.post("/set-password",verifyToken, setPassword);

export default router;