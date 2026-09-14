const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
        "Only JPG, JPEG, PNG, WEBP and AVIF image files are allowed"
      )
    );
  }
};

const staffStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "salon-booking/staff",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "avif"
    ],
    resource_type: "image"
  }
});

const salonStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "salon-booking/salons",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "avif"
    ],
    resource_type: "image"
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