const express = require("express");
const { uploadRecording, getRecordings, deleteRecording } = require('../controllers/recordingController');

const router = express.Router();

// Route to upload recording link
router.post("/upload", uploadRecording);

// Route to get all rec links
router.get("/fetch", getRecordings);

// Route to delete a recording link
router.delete("/delete/:recordingId", deleteRecording);

module.exports = router;
