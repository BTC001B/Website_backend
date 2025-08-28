const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/resumes");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Only allow PDFs or Docs
const fileFilter = (req, file, cb) => {
  const allowed = [".pdf", ".doc", ".docx",".png",".jpeg",".jpg"];
  if (allowed.includes(path.extname(file.originalname).toLowerCase())) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF/DOC files are allowed"), false);
  }
};

module.exports = multer({ storage, fileFilter });
