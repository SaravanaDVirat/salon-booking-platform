const multer = require("multer");
const path = require("path");
const fs = require("fs");

const staffUploadPath = path.join(__dirname, "../uploads/staff");
const salonUploadPath = path.join(__dirname, "../uploads/salons");

if (!fs.existsSync(staffUploadPath)) {
  fs.mkdirSync(staffUploadPath, { recursive: true });
}

if (!fs.existsSync(salonUploadPath)) {
  fs.mkdirSync(salonUploadPath, { recursive: true });
}


const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/avif"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG and WEBP image files are allowed"
      )
    );
  }
};

const staffStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, staffUploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});

const salonStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, salonUploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  }
});


const staffUpload = multer({
  storage: staffStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

const salonUpload = multer({
  storage: salonStorage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 10
  }
});

module.exports = {
  staffUpload,
  salonUpload
};