const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const sequelize = require("./config/db"); // Sequelize config
const jobRoutes=require("./Routes/jobRoutes");
const applicationRoutes = require("./Routes/applicationRoutes");
const adminAuthRoutes=require("./Routes/adminAuthRoutes");



dotenv.config();
const app = express();

// ✅ Middleware
app.use(cors({ origin: "*" }));
app.use(express.json()); // handles JSON bodies
app.use(express.urlencoded({ extended: true })); // handles form submissions


app.use("/api/job",jobRoutes);
app.use("/api/admin",adminAuthRoutes);
app.use("/api/applications", applicationRoutes);



// Root
app.get("/", (req, res) => {
  res.send("🚀 Server is running...");
});

// Sync DB and Start server
const PORT = process.env.PORT || 3000;
sequelize
  .sync({alter:true})
  .then(() => {
    console.log("✅ Database connected & synced");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err);
  });   
