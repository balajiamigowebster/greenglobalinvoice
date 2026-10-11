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

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["https://mern-invoice-create.vercel.app", "http://localhost:5173"],
    //origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/invoices", invoiceRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/analytics", analyticRoute);
app.use("/api/settings", settingRoutes);

app.listen(PORT, () => {
  console.log(`Server Connected ${PORT}`);
  connectDB();
});
