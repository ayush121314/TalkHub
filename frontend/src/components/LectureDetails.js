import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const LectureDetails = () => {
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);


  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [recordingLink, setRecordingLink] = useState('');
  const [uploadedRecordingLink, setUploadedRecordingLink] = useState([]);
  const [isEditing, setIsEditing] = useState(false);


  const { lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user.id;
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';

  //console.log(user);

  useEffect(() => {
    const savedDocuments = localStorage.getItem("documents");
    const savedLinks = localStorage.getItem("links");

    if (savedLinks) {
      setUploadedRecordingLink(JSON.parse(savedLinks)); // ✅ Parse JSON before setting state
    } else {
      const fetchLinks = async () => {
        try {
          const response = await fetch(`${apiUrl}/api/recordings/fetch`);
          if (!response.ok) throw new Error("Failed to fetch Recordings");

          const data = await response.json();
          console.log(data);

          setUploadedRecordingLink(data);
          localStorage.setItem("links", JSON.stringify(data));  // ✅ Store as JSON
        } catch (error) {
          console.error("Error fetching recordings:", error);
        }
      };

      fetchLinks();
    }



    if (savedDocuments) {
      const parsedDocuments = JSON.parse(savedDocuments);
      setUploadedDocuments(parsedDocuments); // Load from localStorage

    } else {
      const fetchDocuments = async () => {
        try {
          const response = await fetch(`${apiUrl}/api/docs/documents`);
          if (!response.ok) throw new Error("Failed to fetch documents");

          const data = await response.json();
          console.log(data);

          setUploadedDocuments(data);
          localStorage.setItem("documents", JSON.stringify(data));  // Save to localStorage
        } catch (error) {
          console.error("Error fetching documents:", error);
        }
      };

      fetchDocuments();
    }
  }, []);



  const fetchLectureDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/lectures/${lectureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch lecture details');
      }
      const data = await response.json();
      setLecture(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };
  const [selectedLectureId, setSelectedLectureId] = useState("");
  useEffect(() => {
    fetchLectureDetails();
    setSelectedLectureId(lectureId);
  }, [lectureId]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingRec, setUploadingRec] = useState(false);


  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };


  /*const uploadFile = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload.');
      return alert("Please select a file.");
    }

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setUploadingDoc(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/docs/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file.');
      }
      const data = await response.json();
      setUploadedDocuments([...uploadedDocuments, data]);
      setUploadedDocuments((prevDocs) => [...prevDocs, data]);

      setSelectedFile(null);
      fetchLectureDetails();

      alert("Upload successful!");
    } catch (err) {
      setError(err.message);
      alert("Upload failed. Try again.");
    } finally {
      setUploadingDoc(false);
    }
  };*/

  const uploadFile = async () => {
    if (!selectedFile) return alert("Please select a file.");
    if (!selectedLectureId) return alert("Please select a lecture."); // Ensure a lecture is selected

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append('lectureId', selectedLectureId);
    // Send lectureId

    try {
      setUploadingDoc(true);

      const response = await fetch(`${apiUrl}/api/docs/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();

      // Update the state and localStorage
      setUploadedDocuments((prevDocs) => {
        const newDocs = [...prevDocs, data];
        localStorage.setItem("documents", JSON.stringify(newDocs)); // Save to localStorage
        return newDocs;
      });

      alert("Upload successful!");
    } catch (error) {
      alert("Upload failed. Try again.");
    } finally {
      setUploadingDoc(false);
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      console.log("Deleting document:", documentId);

      // Send DELETE request to backend first
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/docs/delete/${documentId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to delete:", data);
        throw new Error(data.message || "Failed to delete the document");
      }

      // ✅ Backend deletion successful, now update localStorage
      let storedDocs = JSON.parse(localStorage.getItem("documents")) || [];
      storedDocs = storedDocs.filter(doc => doc._id !== documentId);
      localStorage.setItem("documents", JSON.stringify(storedDocs));

      // ✅ Update UI state
      setUploadedDocuments(storedDocs);

      console.log("Deleted successfully:", data.message);
    } catch (err) {
      console.error("Error deleting the document:", err.message);
      alert("Error deleting the document");
    }
  };





  const updateRecordingLink = async () => {
    if (!recordingLink) {
      setError('Please enter a valid link.');
      return;
    }

    if (!lectureId) {
      setError('Lecture ID is missing.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setError('User is not authenticated.');
      return;
    }

    try {
      setUploadingRec(true);
      setError(null);

      const response = await fetch(`${apiUrl}/api/recordings/upload`, { // Check this route
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lectureId: lectureId,
          recordingLink: recordingLink  // Ensure key matches backend expectations
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update recording link.');
      }
      const recData = await response.json();
      setUploadedRecordingLink((prevRecs) => {
        const newRecs = [...prevRecs, recData];
        localStorage.setItem("links", JSON.stringify(newRecs)); // Save to localStorage
        return newRecs;
      });

      setRecordingLink('');
      fetchLectureDetails();
    } catch (err) {
      setError(err.message);
    } finally {
      setUploadingRec(false);
    }
  };

  const deleteRecordingLink = async (recordingId) => {
    try {
      console.log("Deleting recording:", recordingId);

      // Send DELETE request to backend first
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/recordings/delete/${recordingId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Failed to delete:", data);
        throw new Error(data.message || "Failed to delete the recording link");
      }

      // ✅ Backend deletion successful, now update localStorage
      let storedLinks = JSON.parse(localStorage.getItem("links")) || [];
      storedLinks = storedLinks.filter(link => link._id !== recordingId);
      localStorage.setItem("links", JSON.stringify(storedLinks));

      // ✅ Update UI state
      setUploadedRecordingLink(storedLinks);

      console.log("Deleted successfully:", data.message);
    } catch (err) {
      console.error("Error deleting the recording link:", err.message);
      alert("Error deleting the recording link");
    }
  };








  const handleRegistration = async () => {
    if (lecture.registeredUsers?.includes(user?._id)) {
      setRegistrationError('You are already registered for this lecture');
      return;
    }

    try {
      setRegistrationLoading(true);
      setRegistrationError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/lectures/${lectureId}/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message === 'Already registered for this lecture') {
          setLecture(prev => ({
            ...prev,
            registeredUsers: prev.registeredUsers ?
              [...prev.registeredUsers, user.id] :
              [user.id]
          }));
          return;
        }
        throw new Error(data.message || 'Failed to register for the lecture');
      }

      setLecture(data);
      setRegistrationError(null);
    } catch (err) {
      setRegistrationError(err.message);
    } finally {
      setRegistrationLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-500',
      ongoing: 'bg-green-500',
      completed: 'bg-purple-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 text-red-200 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Lecture</h3>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!lecture) return null;

  const isUserRegistered = lecture.registeredUsers?.includes(user.id);
  console.log(isUserRegistered);

  const isRegistrationOpen = lecture.registeredUsers?.length < lecture.capacity &&
    lecture.status === 'scheduled' &&
    new Date(lecture.date) > new Date();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
            <h1 className="text-4xl font-bold text-white">{lecture.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm text-white ${getStatusBadgeColor(lecture.status)} w-fit`}>
              {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-300">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              {new Date(lecture.date).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">⏰</span>
              {lecture.time} ({lecture.duration} minutes)
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{lecture.mode === 'online' ? '🎥' : '📍'}</span>
              {lecture.mode === 'online' ? 'Online Session' : lecture.venue}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              {lecture.registeredUsers?.length || 0}/{lecture.capacity} registered
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">About this Lecture</h2>
              <p className="text-gray-300 mb-6 whitespace-pre-wrap">{lecture.description}</p>

              {lecture.prerequisites?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">📚</span>
                    Prerequisites
                  </h3>
                  <ul className="list-disc list-inside text-gray-300 space-y-2">
                    {lecture.prerequisites.map((prereq, index) => (
                      <li key={index}>{prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {lecture.tags?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">🏷️</span>
                    Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {lecture.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-900/50 text-purple-200 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {lecture.status === 'cancelled' && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
                  <div className="flex items-center gap-2 text-red-300 mb-2">
                    <span className="text-xl">⚠️</span>
                    <h3 className="text-lg font-semibold">Lecture Cancelled</h3>
                  </div>
                  <p className="text-red-200">This lecture has been cancelled. Please check other available lectures.</p>
                </div>
              )}

              {lecture.recording && lecture.status === 'completed' && (
                <div>
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                    <span className="text-xl">📹</span>
                    Recording
                  </h3>
                  <a
                    href={lecture.recording}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-700 rounded-lg text-blue-400 hover:bg-gray-600 transition-colors"
                  >
                    Watch Recording
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
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

            <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Registration</h2>
              {isRegistrationOpen ? (
                <>
                  <button
                    onClick={handleRegistration}
                    disabled={isUserRegistered || registrationLoading}
                    className={`w-full px-6 py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 ${isUserRegistered
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
                      <>
                        ✓ Registered
                      </>
                    ) : (
                      'Register for Lecture'
                    )}
                  </button>
                  {registrationError && (
                    <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      {registrationError}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-gray-400">
                    {lecture.capacity - (lecture.registeredUsers?.length || 0)} spots remaining
                  </p>
                </>
              ) : (
                <div className="text-yellow-400 flex items-center gap-2">
                  <span className="text-xl">⚠️</span>
                  <p>
                    {lecture.status === 'completed'
                      ? 'This lecture has ended'
                      : lecture.status === 'cancelled'
                        ? 'This lecture has been cancelled'
                        : 'Registration is closed'}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
              <h2 className="text-2xl font-semibold text-white mb-4">Talk Resources</h2>
              {user.name == lecture.instructor.name ? (
                <>
                  <div className="mb-4">
                    <label className="text-gray-300 block mb-2">Upload Document (PDF, PPT, DOCX)</label>
                    <input
                      type="file"
                      accept=".pdf,.ppt,.pptx,.doc,.docx"
                      onChange={handleFileChange}
                      className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <button
                      onClick={uploadFile}
                      disabled={uploadingDoc}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {uploadingDoc ? 'Uploading...' : 'Upload'}
                    </button>
                  </div>
                  {/* Uploaded Documents List */}
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-white mb-4">Uploaded Documents : </p>
                    {uploadedDocuments.length > 0 && uploadedDocuments.some(doc => doc.lectureId === lectureId) ? (
                      <ul className="list-disc pl-5 text-gray-300">
                        {uploadedDocuments.filter(doc => doc.lectureId === lectureId).map((doc, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                              {doc.name}
                            </a>
                            {user.name === lecture.instructor.name && (
                              <button
                                onClick={() => deleteDocument(doc._id)}
                                className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-300">No documents uploaded yet.</p>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Uploaded Documents List */}
                  <div className="mb-4">
                    <p className="text-lg font-semibold text-white mb-4">Uploaded Documents : </p>
                    {uploadedDocuments.length > 0 && uploadedDocuments.some(doc => doc.lectureId === lectureId) ? (
                      <ul className="list-disc pl-5 text-gray-300">
                        {uploadedDocuments.filter(doc => doc.lectureId === lectureId).map((doc, index) => (
                          <li key={index} className="flex justify-between items-center">
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                              {doc.name}
                            </a>
                            {user.name === lecture.instructor.name && (
                              <button
                                onClick={() => deleteDocument(doc._id)}
                                className="ml-4 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-300">No documents uploaded yet.</p>
                    )}
                  </div>
                </>
              )}

              {/* Recording Link Section */}
              <div className="mb-4">
                {/* Title and Add Link button aligned */}
                <div className="flex justify-between items-center mb-2">
                  <label className="text-lg font-semibold text-white">Recording Link :</label>
                  {user.name === lecture.instructor.name && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                    >
                      Add Link
                    </button>
                  )}
                </div>

                {user.name === lecture.instructor.name && isEditing ? (
                  <>
                    <input
                      type="text"
                      value={recordingLink}
                      onChange={(e) => setRecordingLink(e.target.value)}
                      placeholder="Enter recording URL"
                      className="w-full p-2 bg-gray-700 text-white rounded"
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => {
                          updateRecordingLink();
                          setIsEditing(false);
                        }}
                        disabled={uploadingRec}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        {uploadingRec ? "Updating..." : "Save Link"}
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {uploadedRecordingLink.length > 0 &&
                      uploadedRecordingLink.some((rec) => rec.lectureId === lectureId) ? (
                      <ul className="list-disc pl-5 text-gray-300">
                        {uploadedRecordingLink
                          .filter((rec) => rec.lectureId === lectureId)
                          .map((rec, index) => (
                            <li
                              key={index}
                              className="flex justify-between items-center w-full"
                            >
                              <a
                                href={rec.recording.startsWith("http") ? rec.recording : `https://${rec.recording}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:underline"
                              >
                                Talk Link {index + 1}
                              </a>

                              <button
                                onClick={() => deleteRecordingLink(rec._id)}
                                className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                              >
                                Delete
                              </button>
                            </li>
                          ))}
                      </ul>
                    ) : (
                      <p className="text-gray-300">No link uploaded yet.</p>
                    )}
                  </>
                )}
              </div>

              {error && <p className="text-red-400">{error}</p>}

            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureDetails;