import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js"
import profileRoutes from "./routes/profileRoutes.js";

import errorMiddleware from "./middleware/errorMiddleware.js";



const app = express();

app.use(cors());
app.use(express.json());


// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

//auth
app.use("/auth", authRoutes);

app.use("/profile", profileRoutes);


// error middleware (ALWAYS LAST)
app.use(errorMiddleware);



export default app;