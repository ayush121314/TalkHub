
const Recording = require("../models/Recording");

// Upload rec controller
exports.uploadRecording = async (req, res) => {
    try {
        const { lectureId } = req.body;  // Get lectureId from URL
        const { recordingLink } = req.body;    // Get recording link from request body

        if (!recordingLink) {
            return res.status(400).json({ message: 'Recording link is required' });
        }
        if (!lectureId) {
            return res.status(400).json({ error: "Lecture ID is required" });
        }

        const recorLink = new Recording({
            recording: recordingLink,
            lectureId:lectureId
        });

        await recorLink.save();

        res.status(200).json(recorLink);

    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all uploaded rec links
exports.getRecordings = async (req, res) => {
    try {
        const { lectureId } = req.query;
        const query = lectureId ? { lectureId } : {}; // Filter by lectureId if provided

        const recordings = await Recording.find(query);
        res.status(200).json(recordings);
    } catch (error) {
        res.status(500).json({ error: "Server error", message: error.message });
    }
};

exports.deleteRecording = async (req, res) => {
    try {
        const { recordingId } = req.params; // Get recordingId from URL
        console.log('Deleting recording with ID:', recordingId); // Debugging log

        const recording = await Recording.findById(recordingId);

        if (!recording) {
            console.log('Recording not found');
            return res.status(404).json({ message: 'Recording link not found' });
        }

        // Delete the recording
        await recording.deleteOne();
        console.log('Recording deleted successfully');

        res.status(200).json({ message: 'Recording link deleted successfully' });
    } catch (error) {
        console.error('Error deleting the recording link:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

