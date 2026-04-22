const express = require("express");
const { register, login, verifyOTP, forgotPassword , resetPassword, getCurrentUser } = require("../controllers/user");

const userRouter = express.Router();

const verifyToken = require("../middleware/auth");
userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/verify-otp", verifyOTP); 

userRouter.post("/forgot-password", forgotPassword);
userRouter.post("/reset-password", resetPassword);

userRouter.get("/me", verifyToken, getCurrentUser);

module.exports = userRouter;