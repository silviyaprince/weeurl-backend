import express from "express";
import { generateToken, User } from "../models/user.js";
import bcrypt from "bcrypt";
import { getUserByEmail } from "../controllers/user.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
const router = express.Router();

router.post("/signupregistration", async (req, res) => {
  try {
    let user = await getUserByEmail(req.body.email);
    if (user) {
      return res.status(400).json({ error: "user already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const activationToken = crypto.randomBytes(32).toString("hex");

    user = await new User({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      password: hashedPassword,
      isActive: false,
      activationToken,
      activationTokenExpires: Date.now() + 3600000,
    }).save();
    const activationLink = `http://localhost:8030/user/activate/${activationToken}`;

    const sendActivationEmail = (email, link) => {
      const transporter = nodemailer.createTransport({
        host: "smtp.zoho.in",
        port: 587,              // Standard SMTP port
  secure: false,  
        auth: {
          user: "silviya.prince16@zohomail.in",
          pass: process.env.PASS_KEY,
        },
      });
    
      const mailOptions = {
        from: "silviya.prince16@zohomail.in",
        to: email,
        subject: "Activate your account",
        html: `<p>Click <a href="${link}">here</a> to activate your account.</p>`,
      };
    
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error("Error sending email:", err);
        } else {
          console.log("Email sent:", info.response);
        }
      });
    };

  sendActivationEmail(req.body.email, activationLink);

    // const token = generateToken(user._id);
    res.status(201).json({ message: "Signup successful! Please check your email to activate your account." });
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

    if (!user.isActive) {
      return res.status(403).json({ message: "Account is not activated. Please activate your account." });
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
      pass: process.env.PASS_KEY,
    },
  });
  const resetLink = `http://localhost:3000/user/resetpassword/${token}`;
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

router.get("/activate/:token", async (req, res) => {
  const { token } = req.params;
  const user = await User.findOne({ 
    activationToken: token, 
    activationTokenExpires: { $gt: Date.now() } 
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid or expired activation link." });
  }

  user.isActive = true;
  user.activationToken = undefined;
  user.activationTokenExpires = undefined;

  await user.save();

  res.status(200).json({ message: "Account activated successfully. You can now log in." });
});



export const userRouter = router;
