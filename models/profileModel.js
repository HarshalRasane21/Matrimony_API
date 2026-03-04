import db from "../config/db.js";

export const createProfile = async (data) => {
  const {
    user_id,
    gender,
    dob,
    height,
    religion,
    caste,
    city,
    education,
    occupation,
    profile_pic_url,
    profile_pic_public_id,
    name
  } = data;

  await db.execute(
    `INSERT INTO user_profiles
    (user_id, gender, dob, height, religion, caste, city, education, occupation, profile_pic_url, profile_pic_public_id, name)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user_id,
      gender,
      dob,
      height,
      religion,
      caste,
      city,
      education,
      occupation,
      profile_pic_url,
      profile_pic_public_id,
      name
    ]
  );
};


export const getIdfromMobile = async (userMobile) => {
  const [rows] = await db.execute(
    "SELECT id FROM users WHERE mobile = ?",
    [`+91${userMobile}`]
  );
  return rows;   // return full rows array
};