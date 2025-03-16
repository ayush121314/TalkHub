/**
 * Middleware for handling file uploads using express-fileupload
 * Replaces the previous multer implementation
 */
const fileUploadMiddleware = (req, res, next) => {
  console.log("Upload middleware triggered");
  
  // Check if content-type includes multipart/form-data
  const contentType = req.headers['content-type'] || '';
  const isMultipart = contentType.includes('multipart/form-data');
  
  console.log(`Request content type: ${contentType}`);
  console.log(`Is multipart form data: ${isMultipart}`);

  // If no files were uploaded, it might be an update without a file change
  if (!req.files || Object.keys(req.files).length === 0) {
    console.log("No files detected in request, proceeding without file validation");
    return next();
  }

  console.log("Files in request:", Object.keys(req.files).join(', '));

  // Determine which field name is being used - 'file' or 'profileImage'
  const fileField = req.files.file 
    ? 'file' 
    : (req.files.profileImage ? 'profileImage' : null);

  if (!fileField) {
    console.log("No recognized file field found in request");
    return res.status(400).json({ 
      success: false,
      message: 'File field is required (either "file" or "profileImage").'
    });
  }

  const file = req.files[fileField];
  console.log(`Processing file: ${file.name}, type: ${file.mimetype}, size: ${file.size} bytes`);

  // Check file type based on mimetype
  if (file.mimetype.startsWith('image/')) {
    // For image uploads, set a flag for downstream controllers
    req.isImageFile = true;
    console.log("File validated as image");
  } else if (file.mimetype === 'application/pdf' || 
             file.mimetype === 'application/msword' ||
             file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
             file.mimetype === 'application/vnd.ms-powerpoint' ||
             file.mimetype === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
    // For document uploads, set a flag for downstream controllers
    req.isDocumentFile = true;
    console.log("File validated as document");
  } else {
    console.log(`File rejected: invalid mimetype ${file.mimetype}`);
    return res.status(400).json({ 
      success: false,
      message: 'Invalid file type. Please upload valid document or image files.'
    });
  }

  // Store the file object in a consistent place for controllers
  req.processedFile = file;
  console.log("File validation passed, proceeding to next middleware");
  
  // If everything is fine, proceed to the next middleware/controller
  next();
};

module.exports = fileUploadMiddleware;