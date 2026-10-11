const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    res.status(201).json({
      msg: "User registered",
      newUser: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

const DEMO_USER = {
  id: "660e1f8a8e1b123456789abc",
  name: "Demo Admin",
  email: "admin@example.com",
  password: "admin123",
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const isProd = process.env.NODE_ENV === "production";

  // Check demo credentials fallback
  if (
    email &&
    password &&
    email.trim().toLowerCase() === DEMO_USER.email &&
    password === DEMO_USER.password
  ) {
    const token = jwt.sign(
      { userId: DEMO_USER.id },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      msg: "Login successful",
      user: {
        id: DEMO_USER.id,
        _id: DEMO_USER.id,
        name: DEMO_USER.name,
        email: DEMO_USER.email,
      },
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      msg: "Login successful",
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.logout = async (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  });
  res.status(200).json({ msg: "Logged out successfully" });
};

exports.getMe = async (req, res) => {
  try {
    if (req.user && req.user.userId === DEMO_USER.id) {
      return res.status(200).json({
        user: {
          id: DEMO_USER.id,
          _id: DEMO_USER.id,
          name: DEMO_USER.name,
          email: DEMO_USER.email,
        },
      });
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }
    await User.findByIdAndDelete(id);
    res.status(200).json({ msg: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Server error", error: error.message });
  }
};

// Change password

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ msg: "User not found" });
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Old password incorrect" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();
    res.status(200).json({ msg: "Password updated successfully", user });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ msg: error });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    // if (!name || !email) {
    //   return res.status(400).json({ message: "Name and Email are required" });
    // }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    //console.log(user);

    if (req.file) {
      //console.log(req.file);
      if (user.avatar?.public_id) {
        //console.log("public_id is true");
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }
      user.avatar = {
        url: req.file.path, // multer-cloudinary la path auto cloudinary url
        public_id: req.file.filename, // public id store pannum
      };
    }

    // const updatedUser = await User.findByIdAndUpdate(
    //   req.user.userId,
    //   { name, email },
    //   { new: true }
    // ).select("-password");

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Server error" });
  }
};
