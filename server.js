import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import userRouter from "./routes/userRouter.js";
import productRouter from "./routes/productRouter.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import cors from "cors";
import orderRouter from "./routes/orderRouter.js";

dotenv.config();

let app = express();

// --- UPDATED CORS CONFIGURATION ---
// This allows your Vercel frontend to talk to your VPS backend
app.use(
  cors({
    origin: "*", // For testing with Quick Tunnels, '*' is easiest.
    // Later, change '*' to 'https://your-app.vercel.app' for better security.
    credentials: true,
  }),
);

app.use(bodyParser.json());

app.use((req, res, next) => {
  let token = req.header("Authorization");
  if (token != null) {
    token = token.replace("Bearer ", "");
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (!err) {
        req.user = decoded;
      }
    });
  }
  next();
});

let mongoUrl = process.env.MONGO_URL;

// Added error handling for MongoDB to help you debug on the VPS
mongoose
  .connect(mongoUrl)
  .then(() => console.log("MongoDB connection established"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

// Use port from .env or default to 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
