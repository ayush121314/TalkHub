// Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import RequestClassForm from './RequestClassForm';
import LectureCard from './LectureCard';

const Dashboard = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [pastLectures, setPastLectures] = useState([]);
  const [scheduledTalks, setScheduledTalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';

  useEffect(() => {
    fetchLectureData();
  }, []);

  const fetchLectureData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
  
      const [upcomingRes, pastRes, scheduledRes] = await Promise.all([
        fetch(`${apiUrl}/api/lectures/upcoming`, { headers }),
        fetch(`${apiUrl}/api/lectures/past`, { headers }),
        fetch(`${apiUrl}/api/lectures/scheduled`, { headers })
      ]);

      if (!upcomingRes.ok || !pastRes.ok || !scheduledRes.ok) {
        throw new Error('Failed to fetch lecture data');
      }

      const [upcoming, past, scheduled] = await Promise.all([
        upcomingRes.json(),
        pastRes.json(),
        scheduledRes.json()
      ]);

      setUpcomingLectures(upcoming);
      setPastLectures(past);
      setScheduledTalks(scheduled);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      showNotification('Error loading lecture data');
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotificationMessage(message);
    setTimeout(() => setNotificationMessage(''), 3000);
  };

  const handleLectureClick = (lectureId) => {
    navigate(`/lecture/${lectureId}`);
  };

  const TabButton = ({ icon, label, tab }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`text-white p-3 flex items-center justify-center gap-2 rounded-xl transition-colors ${
        activeTab === tab ? 'bg-purple-600' : 'hover:bg-gray-700'
      }`}
    >
      {icon} {label}
    </button>
  );

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
          <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-8">
              <div className="w-32 h-32 rounded-full bg-gray-800 p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-6xl">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                <div className="flex flex-wrap gap-4 text-gray-300">
                  <span className="flex items-center">✉️ {user?.email}</span>
                  <span className="flex items-center">📚 {user?.department}</span>
                  <span className="flex items-center">🎓 {user?.rollNumber}</span>
                </div>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <button
              onClick={() => setShowRequestForm(true)}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl flex items-center justify-center font-semibold hover:opacity-90 transition-opacity"
            >
              ➕ Schedule a Talk
            </button>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-3 gap-4 bg-gray-800 p-1 rounded-xl mb-6">
              <TabButton icon="📅" label="Upcoming Lectures" tab="upcoming" />
              <TabButton icon="⏰" label="Past Lectures" tab="past" />
              <TabButton icon="👥" label="My Scheduled Talks" tab="scheduled" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'upcoming' && upcomingLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={false} onClick={handleLectureClick} />
              ))}
              {activeTab === 'past' && pastLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={true} onClick={handleLectureClick} />
              ))}
              {activeTab === 'scheduled' && scheduledTalks.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={false} onClick={handleLectureClick} />
              ))}

              {/* Empty State Messages */}
              {activeTab === 'upcoming' && upcomingLectures.length === 0 && (
                <div className="lg:col-span-3 text-center py-12 text-gray-400">
                  No upcoming lectures available at the moment.
                </div>
              )}
              {activeTab === 'past' && pastLectures.length === 0 && (
                <div className="lg:col-span-3 text-center py-12 text-gray-400">
                  No past lectures found.
                </div>
              )}
              {activeTab === 'scheduled' && scheduledTalks.length === 0 && (
                <div className="lg:col-span-3 text-center py-12 text-gray-400">
                  You haven't scheduled any talks yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notificationMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in">
          {notificationMessage}
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <RequestClassForm
          onClose={() => setShowRequestForm(false)}
          onSubmit={(newTalk) => {
            setScheduledTalks(prev => [...prev, newTalk]);
            setShowRequestForm(false);
            showNotification('Talk request submitted successfully!');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;