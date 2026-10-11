const mongoose = require("mongoose");
const Setting = require("../models/setting");

let memorySetting = {
  _id: "6acb0274051f5cd539a39863",
  businessName: "Green Global Landscape",
  businessNumber: "GGL-2026",
  address: "Solipalayam, Solavaram, Chennai, Tamil Nadu 600067, India",
  phone: "+91 76038 92417",
  email: "greengloballandscape@gmail.com",
  logo: "",
};

const isDbAvailable = () => mongoose.connection.readyState === 1;

exports.createOrUpdatesSetting = async (req, res) => {
  try {
    const { businessName, businessNumber, address, phone, email } = req.body;
    const logoUrl = req.file ? req.file.path : null;

    if (isDbAvailable()) {
      let setting = await Setting.findOne();

      if (setting) {
        setting.businessName = businessName || setting.businessName;
        setting.businessNumber = businessNumber || setting.businessNumber;
        setting.phone = phone || setting.phone;
        setting.email = email || setting.email;

        if (logoUrl) setting.logo = logoUrl;
        if (address) {
          setting.address = address;
        }
        await setting.save();
        return res.json({
          success: true,
          message: "Setting updated successfully",
          data: setting,
        });
      } else {
        const newSetting = new Setting({
          businessName,
          businessNumber,
          address,
          phone,
          email,
          logo: logoUrl,
        });
        await newSetting.save();
        return res.status(201).json({ success: true, data: newSetting });
      }
    }
  } catch (error) {
    console.log("DB update setting failed, using memory:", error.message);
  }

  // Memory fallback
  const { businessName, businessNumber, address, phone, email } = req.body;
  memorySetting = {
    ...memorySetting,
    ...(businessName && { businessName }),
    ...(businessNumber && { businessNumber }),
    ...(address && { address }),
    ...(phone && { phone }),
    ...(email && { email }),
    ...(req.file?.path && { logo: req.file.path }),
  };

  res.json({
    success: true,
    message: "Setting updated successfully",
    data: memorySetting,
  });
};

exports.getSettings = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const setting = await Setting.findOne();
      if (setting) {
        return res.json({
          success: true,
          data: setting,
        });
      }
    }
  } catch (error) {
    console.log("DB getSettings failed, using memory fallback:", error.message);
  }

  res.json({
    success: true,
    data: memorySetting,
  });
};

exports.deleteSetting = async (req, res) => {
  try {
    if (isDbAvailable()) {
      const setting = await Setting.findOne();
      if (setting) {
        await Setting.findByIdAndDelete(setting._id);
        return res.json({
          success: true,
          message: "Setting deleted successfully",
        });
      }
    }
  } catch (error) {
    console.log("DB deleteSetting failed:", error.message);
  }

  res.json({
    success: true,
    message: "Setting deleted successfully",
  });
};
