const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Setup storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Save to an uploads folder locally (ensure this exists or is created)
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: (req, file, cb) => {
    // Generate unique random string for filename
    const uuid = crypto.randomBytes(16).toString('hex');
    cb(null, `${uuid}${path.extname(file.originalname)}`);
  },
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    // Allowed ext
    const filetypes = /jpeg|jpg|png|gif|mp4|mp3|wav|m4a|pdf|docx|txt/;
    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images, Audio, Video, and Docs Only!'));
    }
  },
});

module.exports = upload;
