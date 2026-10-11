const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const cloudinary = require("cloudinary").v2;

router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No image file uploaded" });
  }

  // Upload buffer to Cloudinary
  const stream = cloudinary.uploader.upload_stream(
    {
      folder: "invoice-products",
      resource_type: "image",
    },
    (error, result) => {
      if (error) {
        console.error("Cloudinary upload failed:", error);
        return res
          .status(500)
          .json({ message: "Image upload failed", error: error.message });
      }
      res.json({ url: result.secure_url });
    }
  );

  stream.end(req.file.buffer);
});

module.exports = router;
