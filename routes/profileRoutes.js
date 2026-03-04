// routes/profileRoutes.js

import express from "express";
import { createUserProfile, checkUserProfile} from "../controllers/profileController.js";
import { verifyToken } from "../middleware/jwtMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/create",
  verifyToken,
  upload.single("profilePic"),
  createUserProfile
);

router.get("/check",verifyToken, checkUserProfile);

export default router;