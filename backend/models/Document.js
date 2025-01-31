const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  name: String,
  url: String,
  format: String,
  uploadedAt: { type: Date, default: Date.now },
  lectureId: { type: mongoose.Schema.Types.ObjectId, ref: "Lecture", required: true },
});

module.exports = mongoose.model("Document", DocumentSchema);
