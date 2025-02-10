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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
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
      onClick={() => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
      }}
      className={`w-full text-left p-4 flex items-center space-x-3 hover:bg-gray-700 rounded-lg transition-colors ${
        activeTab === tab ? 'bg-gray-700' : ''
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-gray-300">{label}</span>
    </button>
  );


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
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-gray-800 p-4 flex justify-between items-center z-40">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-purple-400 transition-colors"
        >
          ☰
        </button>
        <button
          onClick={() => setShowRequestForm(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          ➕ Schedule Talk
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out z-50 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
              <span className="text-white text-3xl">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div className="text-center">
              <h2 className="text-white font-semibold text-lg">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-gray-400 text-sm mt-1">🎓 {user?.rollNumber}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <TabButton icon="📅" label="Upcoming Lectures" tab="upcoming" />
          <TabButton icon="⏰" label="Past Lectures" tab="past" />
          <TabButton icon="👥" label="My Scheduled Talks" tab="scheduled" />
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/30 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-64 p-6 pt-24 md:pt-6">
        {/* Desktop Schedule Button */}
        <div className="hidden md:block mb-8">
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-lg"
          >
            ➕ Schedule New Talk
          </button>
        </div>

        {/* Lecture Grid */}
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

          {/* Empty States */}
          {activeTab === 'upcoming' && upcomingLectures.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No upcoming lectures scheduled
            </div>
          )}
          {activeTab === 'past' && pastLectures.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No past lectures available
            </div>
          )}
          {activeTab === 'scheduled' && scheduledTalks.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              You haven't scheduled any talks yet
            </div>
          )}
        </div>
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button
          onClick={() => setShowRequestForm(true)}
          className="p-4 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
        >
          ➕
        </button>
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
