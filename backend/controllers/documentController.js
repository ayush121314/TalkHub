const cloudinary = require("../config/cloudinary");
const Document = require("../models/Document");

// Upload document controller
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { lectureId } = req.body; // Extract lectureId from request body

    if (!lectureId) {
      return res.status(400).json({ error: "Lecture ID is required" });
    }

    // Upload to Cloudinary 
    const result = await cloudinary.uploader.upload_stream(
      { resource_type: "raw" },
      async (error, result) => {
        if (error) return res.status(500).json({ error: "Upload failed" });

        // Save document details to DB
        const document = new Document({
          name: req.file.originalname,
          url: result.secure_url,
          format: result.format,
          lectureId,
        });

        await document.save();
        res.status(201).json(document);
      }
    ).end(req.file.buffer);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Get all uploaded documents
exports.getDocuments = async (req, res) => {
  try {
    const { lectureId } = req.query;
    const query = lectureId ? { lectureId } : {}; // Filter if lectureId exists

    const documents = await Document.find(query);
    res.status(200).json(documents);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// Delete a document
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const document = await Document.findById(id);
    
    if (!document) return res.status(404).json({ error: "Document not found" });

    // Extract Cloudinary Public ID
    const publicId = document.url.split('/').slice(-2).join('/').split('.')[0]; 

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });

    // Remove from MongoDB
    await Document.findByIdAndDelete(id);

    res.status(200).json({ message: "Document deleted successfully", id });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ error: "Server error" });
  }
};


