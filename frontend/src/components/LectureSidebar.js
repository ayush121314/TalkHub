import React from 'react';
import { 
  FileText, 
  Video, 
  Plus, 
  Trash2, 
  UserCircle, 
  Link as LinkIcon,
  Users,
  Check,
  Clock,
  Download,
  Upload,
  AlertCircle,
  X
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
  uploadingRec,
  openModal
}) => {
  const isUserRegistered = lecture.registeredUsers?.includes(user.id);
  const isRegistrationOpen = lecture.registeredUsers?.length < lecture.capacity &&
    lecture.status === 'scheduled' &&
    new Date(lecture.date) > new Date();
  const isInstructor = user.name === lecture.instructor?.name;
  
  // Check if lecture is past
  const isPastLecture = new Date(lecture.date) < new Date();

  // Function to format countdown time
  const getCountdown = () => {
    if (!lecture.date) return { days: 0, hours: 0, minutes: 0 };
    
    const now = new Date();
    const lectureDate = new Date(lecture.date);
    
    // Parse the time string (assuming format like "10:00 AM")
    const [time, period] = lecture.time.split(' ');
    const [timeHours, timeMinutes] = time.split(':').map(Number);
    const adjustedHours = period === 'PM' && timeHours !== 12 ? timeHours + 12 : timeHours;
    
    // Set the time on the lecture date
    lectureDate.setHours(adjustedHours, timeMinutes, 0, 0);
    
    // Calculate the difference in milliseconds
    let diff = lectureDate - now;
    if (diff < 0) return { days: 0, hours: 0, minutes: 0 };
    
    // Convert to days, hours, minutes
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);
    
    const minutes = Math.floor(diff / (1000 * 60));
    
    return { days, hours, minutes };
  };

  const countdown = getCountdown();

  return (
    <div className="space-y-6">
      {/* Upcoming Lecture Countdown */}
      {!isPastLecture && countdown.days + countdown.hours + countdown.minutes > 0 && (
        <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-100 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Starting In
              </h2>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="text-3xl font-bold text-gray-800">{countdown.days}</div>
                <div className="text-blue-600 text-sm">Days</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="text-3xl font-bold text-gray-800">{countdown.hours}</div>
                <div className="text-blue-600 text-sm">Hours</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <div className="text-3xl font-bold text-gray-800">{countdown.minutes}</div>
                <div className="text-blue-600 text-sm">Minutes</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meeting Link Section */}
      {lecture.mode === 'online' && lecture.meetLink && isUserRegistered && !isPastLecture && (
        <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-100 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-blue-600" />
                Meeting Link
              </h2>
            </div>
            
            <a
              href={lecture.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block text-center px-4 py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 text-white rounded-xl font-medium transition-all shadow-md"
            >
              Join Meeting
            </a>
          </div>
        </div>
      )}

      {/* Registration / Attendance Section */}
      {!isPastLecture ? (
        <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-100 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Registration
              </h2>
            </div>
            
            {/* Capacity bar */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-500">Capacity</span>
                <span className="text-gray-800 font-medium">{lecture.registeredUsers?.length || 0} / {lecture.capacity}</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                  style={{ width: `${Math.min(100, (lecture.registeredUsers?.length || 0) / lecture.capacity * 100)}%` }}
                />
              </div>
            </div>
            
            {isRegistrationOpen ? (
              <button
                onClick={handleRegistration}
                disabled={isUserRegistered || registrationLoading}
                className={`w-full px-4 py-3.5 rounded-xl font-medium text-white flex items-center justify-center gap-2 ${
                  isUserRegistered
                    ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 cursor-default'
                    : registrationLoading
                    ? 'bg-gray-300 cursor-wait'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:opacity-90 shadow-md'
                } transition-all`}
              >
                {registrationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-t-transparent border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : isUserRegistered ? (
                  <>
                    <Check className="w-5 h-5" />
                    Registered
                  </>
                ) : (
                  <>
                    <Users className="w-5 h-5" />
                    Register for Lecture
                  </>
                )}
              </button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-amber-600 mb-1">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Registration Closed</span>
                </div>
                <p className="text-amber-200/80 text-sm">
                  Registration is no longer available for this lecture.
                </p>
              </div>
            )}

            {registrationError && (
              <div className="mt-4 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800/40">
                {registrationError}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100 overflow-hidden relative">
          <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-50 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Attendance
              </h2>
            </div>
            
            <div className="bg-blue-50 rounded-xl p-5">
              <div className="flex flex-col items-center">
                <div className="text-4xl font-bold text-gray-800 mb-1">
                  {lecture.registeredUsers?.length || 0}
                </div>
                <div className="text-blue-600">Live Attendees</div>
              </div>
            </div>
            
            {isUserRegistered && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2 justify-center text-green-600">
                <Check className="w-4 h-4" />
                <span className="font-medium">You attended this lecture</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resources Section */}
      <div className="bg-white shadow-md rounded-xl p-6 border border-blue-100 overflow-hidden relative">
        <div className="absolute -right-20 -top-20 w-40 h-40 bg-blue-50 rounded-full blur-3xl"></div>
        
        <div className="relative space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">Resources</h2>
          </div>

          {/* Document Upload & List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Documents
              </h3>
              {isInstructor && (
                <button
                  onClick={() => document.getElementById('fileUpload').click()}
                  className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors border border-blue-200"
                >
                  <Plus className="w-4 h-4" />
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

            {selectedFile && (
              <div className="bg-white p-4 rounded-lg mb-4 space-y-3 border border-blue-100 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-gray-700">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <button
                    onClick={() => document.getElementById('fileUpload').value = null}
                    className="text-gray-500 hover:text-red-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={handleUploadFile}
                  disabled={uploadingDoc}
                  className="flex items-center justify-center gap-1.5 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-70"
                >
                  {uploadingDoc ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload Document</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="space-y-2.5">
              {uploadedDocuments?.length > 0 ? (
                uploadedDocuments.map((doc) => (
                  <div
                    key={doc._id}
                    className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-blue-100 hover:border-blue-200 transition-all group shadow-sm"
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-2 flex-1 truncate transition-colors"
                    >
                      <FileText className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </a>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          console.log('Download button clicked');
                          console.log('Document URL:', doc.url);
                          console.log('Document object:', doc);
                          try {
                            window.open(doc.url, '_blank');
                          } catch (error) {
                            console.error('Error opening URL:', error);
                          }
                        }}
                        className="text-gray-600 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      {isInstructor && (
                        <button
                          onClick={() => deleteDocument(doc._id)}
                          className="text-gray-600 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No documents uploaded</p>
                </div>
              )}
            </div>
          </div>

          {/* Recording Links */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2">
                <Video className="w-5 h-5 text-green-600" />
                Recordings
              </h3>
              {isInstructor && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors border border-green-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            {isInstructor && isEditing && (
              <div className="bg-white p-4 rounded-lg mb-4 space-y-3 border border-green-100 shadow-sm">
                <input
                  type="text"
                  value={recordingLink}
                  onChange={(e) => setRecordingLink(e.target.value)}
                  placeholder="Enter recording URL"
                  className="w-full bg-white p-3 rounded-md text-gray-700 border border-gray-200 focus:border-green-500 outline-none transition-colors"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleRecordingUpdate}
                    disabled={uploadingRec || !recordingLink}
                    className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-70 disabled:bg-gray-400"
                  >
                    {uploadingRec ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setRecordingLink('');
                    }}
                    className="flex items-center justify-center gap-1.5 flex-1 py-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {uploadedRecordingLink?.length > 0 ? (
                uploadedRecordingLink.map((rec) => (
                  <div
                    key={rec._id}
                    className="flex items-center justify-between bg-white p-3.5 rounded-lg border border-green-100 hover:border-green-200 transition-all group shadow-sm"
                  >
                    <a
                      href={rec.recording.startsWith('http') ? rec.recording : `https://${rec.recording}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 flex items-center gap-2 flex-1 truncate transition-colors"
                    >
                      <Video className="w-4 h-4 flex-shrink-0" />
                      <span>Watch Recording</span>
                    </a>
                    {isInstructor && (
                      <button
                        onClick={() => deleteRecordingLink(rec._id)}
                        className="text-gray-600 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">
                  <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No recordings available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureSidebar;