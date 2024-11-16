import express from "express";
import { generateToken, User } from "../models/user.js";
import bcrypt from "bcrypt";
import { getUserByEmail } from "../controllers/user.js";
import nodemailer from "nodemailer";
const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    let user = await getUserByEmail(req.body.email);
    if (user) {
      return res.status(400).json({ error: "user already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    user = await new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    }).save();
    const token = generateToken(user._id);
    res.status(201).json({ message: "successfully created", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const user = await getUserByEmail(req.body.email);
    if (!user) {
      return res.status(400).json({ error: "invalid credentials" });
    }
    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    if (!validatePassword) {
      return res.status(400).json({ error: "invalid credentials" });
    }
    const token = generateToken(user._id);
    res.status(200).json({ message: "logged in successfully", token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
});

router.post("/resetpassword", async (req, res) => {
  const user = await getUserByEmail(req.body.email);
  if (!user) {
    return res.status(400).json({ error: "invalid credentials" });
  }
  const token = Math.random().toString(36).slice(-8);
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 360000000;
  await user.save();
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
    port: 465,
    secure: true,
    auth: {
      user: "silviya.prince16@zohomail.in",
      pass: "83Gs kRML 0EPZ",
    },
  });
  const resetLink = `https://zingy-dango-eaccb4.netlify.app/user/resetpassword/${token}`;
  const message = {
    from: "silviya.prince16@zohomail.in",
    to: user.email,
    subject: "PASSWORD RESET REQUEST",
    text: `You are receiving this email because you requested for password reset of your account.\n\n.Use the following link  ${resetLink}  to reset password.`,
  };

  await transporter.sendMail(message, (err, info) => {
    if (err) {
      console.error("Error sending email:", err);
      res.status(500).json({ error: "Error sending email" });
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Password reset email sent" });
    }
  });
});

router.get("/resetpassword/:token", async (req, res) => {
  const { token } = req.params;

  // Find the user by the token and ensuring it's still valid
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // Token not expired
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired token." });
  }

  // If token is valid, proceed with showing the reset password form
  res
    .status(200)
    .json({ message: "Token valid. You can now reset your password." });
});

router.post("/resetpassword/update", async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // Token not expired
  });

  if (!user) {
    return res.status(400).json({ error: "Invalid or expired token." });
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  res.status(200).json({ message: "Password has been reset successfully!" });
});

export const userRouter = router;
