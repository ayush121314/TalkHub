const express = require("express");
const fileUploadMiddleware = require("../middleware/uploadMiddleware");
const { uploadDocument, getDocuments, deleteDocument } = require("../controllers/documentController");

const router = express.Router();

// Route to upload document
router.post("/upload", fileUploadMiddleware, uploadDocument);

// Route to get all documents
router.get("/documents", getDocuments);

// Route to delete a document
router.delete("/delete/:id", deleteDocument);

module.exports = router;
