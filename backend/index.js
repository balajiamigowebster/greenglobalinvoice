const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const invoiceRoutes = require("./routes/invoiceRoutes");
const authRoutes = require("./routes/authRoutes.js");
const uploadRoute = require("./routes/uploadRoute");
const analyticRoute = require("./routes/invoiceAnalyticRoute.js");
const settingRoutes = require("./routes/settingRoutes");

const app = express();
const PORT = process.env.PORT || 4000;

// Connect DB
connectDB();

app.use(express.json());
app.use(cookieParser());

// Allow CORS from any Vercel deployment or localhost
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.endsWith(".vercel.app") ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Green Global Invoice API is running" });
});

app.use("/api/invoices", invoiceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/analytics", analyticRoute);
app.use("/api/settings", settingRoutes);

if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server Connected ${PORT}`);
  });
}

module.exports = app;
