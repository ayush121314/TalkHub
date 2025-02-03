import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import useLectureData from './useLectureData';
import LectureHeader from './LectureHeader';
import LectureContent from './LectureContent';
import LectureSidebar from './LectureSidebar';

const LectureDetails = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordingLink, setRecordingLink] = useState('');
  
  const {
    lecture,
    loading,
    error,
    uploadedDocuments,
    uploadedRecordingLink,
    handleRegistration,
    registrationLoading,
    registrationError,
    handleFileUpload,
    handleRecordingLinkUpdate,
    deleteDocument,
    deleteRecordingLink,
    isEditing,
    setIsEditing,
    uploadingDoc,
    uploadingRec
  } = useLectureData(lectureId);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadFile = async () => {
    if (!selectedFile) {
      return;
    }
    const success = await handleFileUpload(selectedFile);
    if (success) {
      setSelectedFile(null);
    }
  };

  const handleRecordingUpdate = async () => {
    // Trim the link to remove any whitespace
    const trimmedLink = recordingLink.trim();
  
    // Validate link is not empty and looks like a valid URL
    if (!trimmedLink) {
      // Optional: set an error message for the user
      return;
    }
  
    // Optional: basic URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    if (!urlPattern.test(trimmedLink)) {
      // Optional: set an error message about invalid URL format
      return;
    }
  
    const success = await handleRecordingLinkUpdate(trimmedLink);
    if (success) {
      setRecordingLink('');
      setIsEditing(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-900">
      <LectureHeader lecture={lecture} navigate={navigate} />
      <div className="max-w-7xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <LectureContent lecture={lecture} />
          <LectureSidebar
            lecture={lecture}
            user={user}
            uploadedDocuments={uploadedDocuments}
            uploadedRecordingLink={uploadedRecordingLink}
            handleRegistration={handleRegistration}
            registrationLoading={registrationLoading}
            registrationError={registrationError}
            selectedFile={selectedFile}
            handleFileChange={handleFileChange}
            handleUploadFile={handleUploadFile}
            deleteDocument={deleteDocument}
            recordingLink={recordingLink}
            setRecordingLink={setRecordingLink}
            handleRecordingUpdate={handleRecordingUpdate}
            deleteRecordingLink={deleteRecordingLink}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            uploadingDoc={uploadingDoc}
            uploadingRec={uploadingRec}
          />
        </div>
      </div>
    </div>
  );
};

export default LectureDetails;