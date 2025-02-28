const userModel = require('../models/userModel');
const cloudinary = require('../helper/cloudinary');
const fs = require('fs');
const sendMail = require('../helper/email');
const jwt = require('jsonwebtoken');
const signUp = require('../helper/signup');
const bcrypt = require('bcryptjs');
const LOCK = process.env.LOCK;

exports.createUser = async (req, res) => {
  try {
    const { fullName, address, email, password, role, phoneNumber } = req.body;

    // Ensure that a file has been uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Upload image with async/await
    const uploadImage = await cloudinary.uploader.upload(req.file.path);

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const userData = {
      fullName,
      address,
      email,
      password: hash,
      phoneNumber,
      role,
      userImageUrl: uploadImage.secure_url,
      userImageId: uploadImage.public_id
    };

    // Delete the file after upload
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("File deletion error:", err.message);
      } else {
        console.log("File uploaded and removed successfully");
      }
    });

    const newUser = await userModel.create(userData);

    const token = jwt.sign({ id: newUser._id }, LOCK, { expiresIn: '10mins' });
    const link = `${req.protocol}://${req.get('host')}/mail/${newUser._id}/${token}`;

    const subject = `Welcome to this platform, ${fullName}`;
    sendMail({ subject, email: newUser.email, html: signUp(link, newUser.fullName) });

    return res.status(201).json({
      message: 'User created successfully',
      data: newUser
    });

  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const checkUser = await userModel.findById(id);
    
    if (!checkUser) {
      return res.status(404).json({ message: "No User Found" });
    }

    if (checkUser.isVerified) {
      return res.status(400).json({
        message: "Email has already been verified"
      });
    }

    try {
      await jwt.verify(req.params.token, LOCK);
    } catch (error) {
      return res.status(404).json({ message: "Email Link Has Expired" });
    }

    await userModel.findByIdAndUpdate(id, { isVerified: true });
    return res.status(200).json({
      message: "Email Verified Successfully"
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

exports.userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const checkEmail = await userModel.findOne({ email });

    if (!checkEmail) {
      return res.status(404).json({
        message: "Email not found"
      });
    }

    const checkPassword = await bcrypt.compare(password, checkEmail.password);

    if (!checkPassword) {
      return res.status(404).json({
        message: "Invalid Password"
      });
    }

    if (!checkEmail.isVerified) {
      return res.status(400).json({
        message: "Email not verified"
      });
    }

    const newData = {
      fullName: checkEmail.fullName,
      email: checkEmail.email,
      id: checkEmail._id
    };

    const token = jwt.sign({ id: checkEmail._id }, LOCK, { expiresIn: "24hrs" });

    return res.status(200).json({
      message: "Login successful",
      data: newData,
      token
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Unable to Login: " + error.message
    });
  }
};
exports.forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      // Handle password reset logic here, e.g., generate token, send email, etc.
      res.status(200).json({
        message: "Password reset link sent to your email."
      });
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };
  exports.changePassword = async (req, res) => {
    try {
      const { id } = req.params;
      const { oldPassword, newPassword } = req.body;
  
      const findUser = await userModel.findById(id);
      if (!findUser) {
        return res.status(404).json({ message: "User Not Found" });
      }
  
      const isOldPasswordValid = await bcrypt.compare(oldPassword, findUser.password);
      if (!isOldPasswordValid) {
        return res.status(400).json({ message: "Incorrect old password" });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedNewPassword = await bcrypt.hash(newPassword, salt);
  
      await userModel.findByIdAndUpdate(id, { password: hashedNewPassword });
  
      return res.status(200).json({ message: "Password changed successfully" });
  
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error: " + error.message });
    }
  };
  
  
  
exports.changeDP = async (req, res) => {
  try {
    const { id } = req.params;
    const findUser = await userModel.findById(id);

    if (!findUser) {
      return res.status(404).json({
        message: "User Not Found"
      });
    }

    // Ensure that a file has been uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    // Upload the new image to Cloudinary
    const cloudImage = await cloudinary.uploader.upload(req.file.path);

    const newPhoto = {
      userImageUrl: cloudImage.secure_url,
      userImageId: cloudImage.public_id
    };

    // Delete old image from Cloudinary
    await cloudinary.uploader.destroy(findUser.userImageId);

    // Delete the file from the local server after upload
    fs.unlink(req.file.path, (err) => {
      if (err) {
        console.log("File deletion error:", err.message);
      } else {
        console.log("Previous File Removed Successfully");
      }
    });

    // Update the user profile with the new photo
    await userModel.findByIdAndUpdate(id, newPhoto, { new: true });

    return res.status(200).json({
      message: "Image Successfully Updated"
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message: "Internal Server Error: " + err.message
    });
  }
};

exports.getallUser = async (req, res) => {
  try {
    const findallUser = await userModel.find();
    return res.status(200).json({
      message: "All Users in Database",
      data: findallUser
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
};

exports.getOneUser = async (req, res) => {
  try {
    const { id } = req.params;
    const findUser = await userModel.findById(id);

    if (!findUser) {
      return res.status(404).json({
        message: "User not found"
      });
    } else {
      return res.status(200).json({
        message: "User found",
        data: findUser
      });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: error.message
    });
  }
};
