import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const useLectureData = (lectureId) => {
  const [lecture, setLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [registrationError, setRegistrationError] = useState(null);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadedRecordingLink, setUploadedRecordingLink] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingRec, setUploadingRec] = useState(false);

  const { user } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';

  // Fetch lecture details and resources when lectureId changes
  useEffect(() => {
    if (lectureId) {
      fetchLectureDetails();
      loadDocumentsAndLinks();
    }
  }, [lectureId]);

  const fetchLectureDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/lectures/${lectureId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch lecture details');
      const data = await response.json();
      setLecture(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const loadDocumentsAndLinks = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch documents
      const docsResponse = await fetch(`${apiUrl}/api/docs/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!docsResponse.ok) throw new Error('Failed to fetch documents');
      const docsData = await docsResponse.json();
      setUploadedDocuments(docsData.filter(doc => doc.lectureId === lectureId));

      // Fetch recording links
      const recsResponse = await fetch(`${apiUrl}/api/recordings/fetch`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!recsResponse.ok) throw new Error('Failed to fetch recordings');
      const recsData = await recsResponse.json();
      setUploadedRecordingLink(recsData.filter(rec => rec.lectureId === lectureId));
    } catch (error) {
      console.error("Error loading documents and links:", error);
      setError(error.message);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) {
      setError('Please select a file to upload.');
      return false;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('lectureId', lectureId);

    try {
      setUploadingDoc(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/docs/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload file.');
      }

      const data = await response.json();
      setUploadedDocuments(prevDocs => [...prevDocs, data]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleRecordingLinkUpdate = async (recordingLink) => {
    if (!recordingLink) {
      setError('Please enter a valid link.');
      return false;
    }

    try {
      setUploadingRec(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/recordings/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lectureId,
          recording: recordingLink
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update recording link.');
      }

      const data = await response.json();
      setUploadedRecordingLink(prevRecs => [...prevRecs, data]);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setUploadingRec(false);
    }
  };

  const deleteDocument = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/docs/delete/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete document');
      }

      setUploadedDocuments(prevDocs => prevDocs.filter(doc => doc._id !== documentId));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const deleteRecordingLink = async (recordingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/recordings/delete/${recordingId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete recording link');
      }

      setUploadedRecordingLink(prevRecs => prevRecs.filter(rec => rec._id !== recordingId));
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const handleRegistration = async () => {
    if (lecture.registeredUsers?.includes(user?.id)) {
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

  return {
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
  };
};

export default useLectureData;