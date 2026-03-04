import db from "../config/db.js";

export const findUserByMobile = async (mobile) => {
  const [rows] = await db.execute(
    "SELECT * FROM users WHERE mobile = ?",
    [mobile]
  );
  return rows[0];
};

export const updateOtp = async (mobile, otp, expiry) => {
  await db.execute(
    "UPDATE users SET otp = ?, otp_expiry = ? WHERE mobile = ?",
    [otp, expiry, mobile]
  );
};


export const createUser = async (fullName, mobile) => {
  const [result] = await db.execute(
    "INSERT INTO users (full_name, mobile) VALUES (?, ?)",
    [fullName, mobile]
  );
  return result.insertId;
};


export const updatePassword = async (mobile, hashedPassword) => {
  const [result] = await db.execute(
    "UPDATE users SET password = ? WHERE mobile = ?",
    [hashedPassword, `+91${mobile}`]
  );
  return result.affectedRows;
};