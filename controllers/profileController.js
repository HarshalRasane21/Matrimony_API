import cloudinary from "../config/cloudinary.js";
import * as profileModel from "../models/profileModel.js";
import upload from "../middleware/uploadMiddleware.js";
import db from "../config/db.js"

export const createUserProfile = async (req, res, next) => {
    try {
        console.log("User:", req.user);
        console.log("Body:", req.body);
        console.log("File:", req.file);


        const user_id = req.user.id;

        
        const {
            name,
            gender,
            dob,
            height,
            religion,
            caste,
            city,
            education,
            occupation,
        } = req.body;

        if (!gender || !dob || !height || !religion || !caste || !city || !name) {
            return res.status(400).json({
                success: false,
                message: "Required fields missing",
            });
        }

        console.log("Authorization Header:", req.headers.authorization);
        console.log("Decoded User:", req.user);


        let imageUrl = null;
        let publicId = null;


        const streamUpload = (buffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "matrimony_profiles" },
                    (error, result) => {
                        if (result) resolve(result);
                        else reject(error);
                    }
                );
                stream.end(buffer);
            });
        };

        // Upload image to Cloudinary
        if (req.file) {
            const result = await streamUpload(req.file.buffer);
            imageUrl = result.secure_url;
            publicId = result.public_id;
            console.log(imageUrl);
            console.log(publicId);
        }

        await profileModel.createProfile({
            user_id,
            gender,
            dob,
            height,
            religion,
            caste,
            city,
            education,
            occupation,
            profile_pic_url: imageUrl,
            profile_pic_public_id: publicId,
            name
        });

        return res.json({
            success: true,
            message: "Profile created successfully",
        });

    } catch (error) {
        console.error("PROFILE ERROR:", error);
        return res.status(500).json({
            success: false,
            message: "Server error",

        });
    }
};


export const checkUserProfile = async (req, res) => {
    try {
        console.log("=== CHECK PROFILE START ===");

        // Log the user object from JWT
        console.log("req.user from verifyToken:", req.user);


        if (!req.user || !req.user.id) {
            console.log("❌ No user ID found in JWT!");
            return res.status(401).json({ message: "Unauthorized", hasProfile: false });
        }

        const user_id = req.user.id;
        console.log("User ID to check profile:", user_id);

        // Execute query
        const [rows] = await db.execute(
            "SELECT id FROM user_profiles WHERE user_id = ?",
            [user_id]
        );

        console.log("Database query result:", rows);

        const hasProfile = rows.length > 0;
        console.log("Does user have a profile?", hasProfile);

        console.log("=== CHECK PROFILE END ===\n");
        return res.json({ hasProfile });

    } catch (err) {
        console.error("❌ PROFILE CHECK ERROR:", err);
        return res.status(500).json({ hasProfile: false });
    }
};