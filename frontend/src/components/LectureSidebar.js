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
      <div className="lg:col-span-1">
        {/* Instructor Info */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Instructor</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-white text-2xl">
                {lecture.instructor?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{lecture.instructor?.name}</h3>
              <p className="text-gray-400">{lecture.instructor?.title}</p>
            </div>
          </div>
        </div>
  
        {/* Meeting Link for Online Lectures */}
        {lecture.mode === 'online' && lecture.meetLink && isUserRegistered && (
          <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
            <h2 className="text-2xl font-semibold text-white mb-4">Meeting Link</h2>
            <a
              href={lecture.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors text-center"
            >
              Join Meeting
            </a>
            <p className="mt-4 text-sm text-gray-400">
              The meeting link will be active 15 minutes before the scheduled time.
            </p>
          </div>
        )}
  
        {/* Registration Section */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Registration</h2>
          {isRegistrationOpen ? (
            <>
              <button
                onClick={handleRegistration}
                disabled={isUserRegistered || registrationLoading}
                className={`w-full px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${
                  isUserRegistered
                    ? 'bg-green-600 cursor-not-allowed'
                    : registrationLoading
                    ? 'bg-gray-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:opacity-90'
                }`}
              >
                {registrationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing...
                  </>
                ) : isUserRegistered ? (
                  '✓ Registered'
                ) : (
                  'Register for Lecture'
                )}
              </button>
              {registrationError && (
                <p className="mt-2 text-sm text-red-400">{registrationError}</p>
              )}
            </>
          ) : (
            <p className="text-yellow-400">Registration is not available</p>
          )}
        </div>
  
        {/* Resources Section */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Resources</h2>
          
          {/* Document Upload Section */}
          {isInstructor && (
            <div className="mb-4">
              <label className="text-gray-300 block mb-2">Upload Document</label>
              <input
                type="file"
                accept=".pdf,.ppt,.pptx,.doc,.docx"
                onChange={handleFileChange}
                className="w-full p-2 bg-gray-700 text-white rounded"
              />
              <button
                onClick={handleUploadFile}
                disabled={uploadingDoc || !selectedFile}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {uploadingDoc ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          )}
  
          {/* Documents List */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-2">Documents</h3>
            {uploadedDocuments?.length > 0 ? (
              <ul className="space-y-2">
                {uploadedDocuments.map((doc) => (
                  <li key={doc._id} className="flex justify-between items-center">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      {doc.name}
                    </a>
                    {isInstructor && (
                      <button
                        onClick={() => deleteDocument(doc._id)}
                        className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No documents uploaded yet</p>
            )}
          </div>
  
          {/* Recording Links Section */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">Recording Links</h3>
              {isInstructor && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Add Link
                </button>
              )}
            </div>
  
            {isInstructor && isEditing && (
              <div className="mb-4">
                <input
                  type="text"
                  value={recordingLink}
                  onChange={(e) => setRecordingLink(e.target.value)}
                  placeholder="Enter recording URL"
                  className="w-full p-2 mb-2 bg-gray-700 text-white rounded"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRecordingUpdate}
                    disabled={uploadingRec || !recordingLink}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    {uploadingRec ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setRecordingLink('');
                    }}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
  
            {uploadedRecordingLink?.length > 0 ? (
              <ul className="space-y-2">
                {uploadedRecordingLink.map((rec) => (
                  <li key={rec._id} className="flex justify-between items-center">
                    <a
                      href={rec.recording.startsWith('http') ? rec.recording : `https://${rec.recording}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      Recording Link
                    </a>
                    {isInstructor && (
                      <button
                        onClick={() => deleteRecordingLink(rec._id)}
                        className="ml-2 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No recording links available</p>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  export default LectureSidebar;