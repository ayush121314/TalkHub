import React from 'react';
import { 
  FileText, 
  Video, 
  Plus, 
  Trash2, 
  UserCircle, 
  Link as LinkIcon 
} from 'lucide-react';

const LectureSidebar = ({
  lecture,
  user,
  uploadedDocuments,
  uploadedRecordingLink,
  handleRegistration,
  registrationLoading,
  registrationError,
  selectedFile,
  handleFileChange,
  handleUploadFile,
  deleteDocument,
  recordingLink,
  setRecordingLink,
  handleRecordingUpdate,
  deleteRecordingLink,
  isEditing,
  setIsEditing,
  uploadingDoc,
  uploadingRec
}) => {
  const isUserRegistered = lecture.registeredUsers?.includes(user.id);
  const isRegistrationOpen = lecture.registeredUsers?.length < lecture.capacity &&
    lecture.status === 'scheduled' &&
    new Date(lecture.date) > new Date();
  const isInstructor = user.name === lecture.instructor?.name;

  return (
    <div className="space-y-6">
      {/* Instructor Profile Card */}
      {/* <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700 shadow-lg">
        <div className="flex items-center space-x-4 mb-4">
          <UserCircle 
            className="w-12 h-12 text-purple-500" 
            strokeWidth={1.5} 
          />
          <div>
            <h3 className="text-xl font-semibold text-white">
              {lecture.instructor?.name}
            </h3>
            <p className="text-gray-400 text-sm">
              {lecture.instructor?.title}
            </p>
          </div>
        </div>
      </div> */}

      {/* Registration & Meeting Section */}
      <div className="space-y-6">
        {lecture.mode === 'online' && lecture.meetLink && isUserRegistered && (
          <div className="bg-blue-900/30 backdrop-blur-md rounded-2xl p-5 border border-blue-800/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">Meeting Link</h2>
              <LinkIcon className="w-5 h-5 text-blue-400" />
            </div>
            <a
              href={lecture.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center px-4 py-3 bg-blue-600/80 hover:bg-blue-600 text-white rounded-xl transition-colors"
            >
              Join Meeting
            </a>
          </div>
        )}

        <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-5 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Registration</h2>
          </div>
          {isRegistrationOpen ? (
            <button
              onClick={handleRegistration}
              disabled={isUserRegistered || registrationLoading}
              className={`w-full px-4 py-3 rounded-xl font-semibold text-white flex items-center justify-center space-x-2 ${
                isUserRegistered
                  ? 'bg-green-600/80 cursor-not-allowed'
                  : registrationLoading
                  ? 'bg-gray-600/80 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600/80 to-blue-600/80 hover:opacity-90'
              }`}
            >
              {registrationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : isUserRegistered ? (
                '✓ Registered'
              ) : (
                'Register for Lecture'
              )}
            </button>
          ) : (
            <p className="text-yellow-400 text-center">
              Registration is not available
            </p>
          )}
        </div>
      </div>

      {/* Resources Section */}
      <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl p-6 border border-gray-700 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Resources</h2>
        </div>

        {/* Document Upload & List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-400" />
              Documents
            </h3>
            {isInstructor && (
              <button
                onClick={() => document.getElementById('fileUpload').click()}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {isInstructor && (
            <input
              id="fileUpload"
              type="file"
              accept=".pdf,.ppt,.pptx,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          )}

          {selectedFile && isInstructor && (
            <div className="flex items-center justify-between bg-gray-700 p-3 rounded-lg mb-4">
              <span className="text-white text-sm truncate max-w-[200px]">
                {selectedFile.name}
              </span>
              <button
                onClick={handleUploadFile}
                disabled={uploadingDoc}
                className="text-blue-400 hover:text-blue-300"
              >
                {uploadingDoc ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          )}

          <div className="space-y-2">
            {uploadedDocuments?.length > 0 ? (
              uploadedDocuments.map((doc) => (
                <div
                  key={doc._id}
                  className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg"
                >
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    {doc.name}
                  </a>
                  {isInstructor && (
                    <button
                      onClick={() => deleteDocument(doc._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">No documents uploaded</p>
            )}
          </div>
        </div>

        {/* Recording Links */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white flex items-center">
              <Video className="w-5 h-5 mr-2 text-green-400" />
              Recordings
            </h3>
            {isInstructor && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-green-400 hover:text-green-300 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {isInstructor && isEditing && (
            <div className="bg-gray-700/50 p-3 rounded-lg mb-4 space-y-3">
              <input
                type="text"
                value={recordingLink}
                onChange={(e) => setRecordingLink(e.target.value)}
                placeholder="Enter recording URL"
                className="w-full bg-gray-800 p-2 rounded-md text-white"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleRecordingUpdate}
                  disabled={uploadingRec || !recordingLink}
                  className="px-3 py-2 bg-green-600/80 text-white rounded-lg flex-1"
                >
                  {uploadingRec ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setRecordingLink('');
                  }}
                  className="px-3 py-2 bg-red-600/80 text-white rounded-lg flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {uploadedRecordingLink?.length > 0 ? (
              uploadedRecordingLink.map((rec) => (
                <div
                  key={rec._id}
                  className="flex items-center justify-between bg-gray-700/50 p-3 rounded-lg"
                >
                  <a
                    href={rec.recording.startsWith('http') ? rec.recording : `https://${rec.recording}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:underline flex items-center"
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Recording Link
                  </a>
                  {isInstructor && (
                    <button
                      onClick={() => deleteRecordingLink(rec._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center">No recordings available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureSidebar;