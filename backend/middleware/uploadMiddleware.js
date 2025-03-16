/**
 * Middleware for handling file uploads using express-fileupload
 * Replaces the previous multer implementation
 */
const fileUploadMiddleware = (req, res, next) => {
  // If no files were uploaded, it might be an update without a file change
  if (!req.files || Object.keys(req.files).length === 0) {
    // Allow the request to proceed even without files for some routes
    return next();
  }

  // Determine which field name is being used - 'file' or 'profileImage'
  const fileField = req.files.file 
    ? 'file' 
    : (req.files.profileImage ? 'profileImage' : null);

  if (!fileField) {
    return res.status(400).json({ 
      success: false,
      message: 'File field is required (either "file" or "profileImage").'
    });
  }

  const file = req.files[fileField];

  // Check file type based on mimetype
  if (file.mimetype.startsWith('image/')) {
    // For image uploads, set a flag for downstream controllers
    req.isImageFile = true;
  } else if (file.mimetype === 'application/pdf' || 
             file.mimetype === 'application/msword' ||
             file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             file.mimetype === 'application/vnd.ms-powerpoint' ||
             file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    // For document uploads, set a flag for downstream controllers
    req.isDocumentFile = true;
  } else {
    return res.status(400).json({ 
      success: false,
      message: 'Invalid file type. Please upload valid document or image files.'
    });
  }

  // If everything is fine, proceed to the next middleware/controller
  next();
};

module.exports = fileUploadMiddleware;