import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import useLectureData from './useLectureData';
import LectureHeader from './LectureHeader';
import LectureContent from './LectureContent';
import LectureSidebar from './LectureSidebar';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Users, 
  BookOpen,
  X
} from 'lucide-react';

const LectureDetails = () => {
  const { lectureId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordingLink, setRecordingLink] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  
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
    const trimmedLink = recordingLink.trim();
    if (!trimmedLink) return;
    
    const success = await handleRecordingLinkUpdate(trimmedLink);
    if (success) {
      setRecordingLink('');
      setIsEditing(false);
    }
  };

  const openModal = (content) => {
    setModalContent(content);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  // Format date to display day of week, month and date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isPastLecture = lecture && new Date(lecture.date) < new Date();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="p-8 rounded-full bg-blue-100 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-md text-red-600 p-8 rounded-xl max-w-md text-center border border-red-100">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-50 flex items-center justify-center">
            <X className="h-10 w-10 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Error Loading Lecture</h3>
          <p className="mb-6 text-red-600">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-all shadow-md"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!lecture) return null;

  const lectureStatusColor = {
    scheduled: 'from-blue-500 to-indigo-600',
    ongoing: 'from-green-500 to-emerald-600',
    completed: 'from-blue-400 to-indigo-500',
    cancelled: 'from-red-500 to-red-600'
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 text-gray-800">
      {/* Back button and breadcrumb */}
      <div className="sticky top-0 z-50 backdrop-blur-md bg-white/70 border-b border-blue-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft size={18} /> 
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 mix-blend-multiply" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="relative">
            {/* Status badge */}
            <div className="inline-flex mb-4">
              <span className={`px-4 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${lectureStatusColor[lecture.status]} text-white shadow-md`}>
                {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
              </span>
            </div>
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-800 mb-6 leading-tight">
              {lecture.title}
            </h1>
            
            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white shadow-md border border-blue-100 rounded-xl p-4 flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Date</p>
                  <p className="text-gray-800 font-semibold">{formatDate(lecture.date)}</p>
                </div>
              </div>
              
              <div className="bg-white shadow-md border border-blue-100 rounded-xl p-4 flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Time</p>
                  <p className="text-gray-800 font-semibold">{lecture.time} ({lecture.duration} minutes)</p>
                </div>
              </div>
              
              <div className="bg-white shadow-md border border-blue-100 rounded-xl p-4 flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  {lecture.mode === 'online' ? (
                    <Video className="h-6 w-6 text-blue-600" />
                  ) : (
                    <MapPin className="h-6 w-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Location</p>
                  <p className="text-gray-800 font-semibold">{lecture.mode === 'online' ? 'Online Session' : lecture.venue}</p>
                </div>
              </div>
              
              <div className="bg-white shadow-md border border-blue-100 rounded-xl p-4 flex items-start space-x-4">
                <div className="bg-blue-100 rounded-lg p-3">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-medium">Attendance</p>
                  <p className="text-gray-800 font-semibold">
                    {isPastLecture 
                      ? `${lecture.registeredUsers?.length || 0} attendees` 
                      : `${lecture.registeredUsers?.length || 0} / ${lecture.capacity} registered`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left/Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            <LectureContent 
              lecture={lecture} 
              openModal={openModal}
            />
          </div>

          {/* Right Sidebar Column */}
          <div>
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
              openModal={openModal}
            />
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 md:p-8 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-xl border border-blue-100">
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={24} />
            </button>
            <div className="p-8">
              {modalContent}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LectureDetails;