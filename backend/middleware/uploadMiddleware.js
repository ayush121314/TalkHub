const multer = require("multer");

const storage = multer.memoryStorage(); // Store in memory before upload
const upload = multer({ storage });

module.exports = upload;
