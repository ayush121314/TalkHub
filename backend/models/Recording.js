const mongoose = require("mongoose");

const RecordingSchema = new mongoose.Schema({
    recording: String,
    uploadedAt: { type: Date, default: Date.now },
    lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
});

module.exports = mongoose.model("Recording", RecordingSchema);
