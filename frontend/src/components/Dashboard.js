import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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

  const RequestClassForm = () => {
    const [mode, setMode] = useState('online');
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      date: '',
      time: '',
      duration: '60',
      venue: '',
      meetLink: '',
      capacity: '',
      prerequisites: '',
      materials: '',
      department: '',
      tags: ''
    });

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

   

    const handleSubmit = async (e) => {
      e.preventDefault();
      
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/lectures/request`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...formData,
            mode,
            tags: formData.tags.split(',').map(tag => tag.trim())
          })
        });

        if (!response.ok) {
          throw new Error('Failed to submit talk request');
        }

        const newTalk = await response.json();
        setScheduledTalks(prev => [...prev, newTalk]);
        setShowRequestForm(false);
        showNotification('Talk request submitted successfully!');
      } catch (err) {
        showNotification('Failed to submit talk request');
      }
    };

    const FormField = ({ label, name, type, value, error, ...props }) => (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-300">{label}</label>
        {type === 'textarea' ? (
          <textarea
            name={name}
            value={value}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white ${
              error ? 'border-red-500 ring-1 ring-red-500' : ''
            }`}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            name={name}
            value={value}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white ${
              error ? 'border-red-500 ring-1 ring-red-500' : ''
            }`}
            {...props}
          >
            {props.children}
          </select>
        ) : (
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleInputChange}
            className={`w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white ${
              error ? 'border-red-500 ring-1 ring-red-500' : ''
            }`}
            {...props}
          />
        )}
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
            <h3 className="text-2xl font-bold text-white">Schedule a Talk</h3>
            <p className="text-blue-100">Share your knowledge with peers</p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <FormField
                label="Title"
                name="title"
                type="text"
                value={formData.title}
                error={errors.title}
                required
              />

              <FormField
                label="Description"
                name="description"
                type="textarea"
                value={formData.description}
                error={errors.description}
                rows="3"
                required
              />

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Mode</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setMode('online')}
                    className={`p-3 rounded-xl ${mode === 'online' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    💻 Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('offline')}
                    className={`p-3 rounded-xl ${mode === 'offline' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                  >
                    🏛️ Offline
                  </button>
                </div>
              </div>

              {mode === 'offline' ? (
                <FormField
                  label="Venue"
                  name="venue"
                  type="text"
                  value={formData.venue}
                  error={errors.venue}
                  required
                />
              ) : (
                <FormField
                  label="Meeting Link"
                  name="meetLink"
                  type="url"
                  value={formData.meetLink}
                  error={errors.meetLink}
                  required
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  error={errors.date}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
                <FormField
                  label="Time"
                  name="time"
                  type="time"
                  value={formData.time}
                  error={errors.time}
                  required
                />
              </div>

              <FormField
                label="Department"
                name="department"
                type="select"
                value={formData.department}
                error={errors.department}
                required
              >
                <option value="">Select Department</option>
                <option value="CSE">Computer Science</option>
                <option value="ECE">Electronics</option>
                <option value="MME">Mechanical</option>
                <option value="CCE">Communication</option>
              </FormField>

              <FormField
                label="Prerequisites"
                name="prerequisites"
                type="text"
                value={formData.prerequisites}
                error={errors.prerequisites}
                placeholder="Comma-separated list"
                required
              />

              <FormField
                label="Tags"
                name="tags"
                type="text"
                value={formData.tags}
                error={errors.tags}
                placeholder="Comma-separated tags"
                required
              />

              <FormField
                label="Capacity"
                name="capacity"
                type="number"
                value={formData.capacity}
                error={errors.capacity}
                min="1"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="flex-1 py-3 bg-gray-800 text-gray-200 rounded-xl hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    );
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

  const LectureCard = ({ lecture, isPast }) => (
    <div 
      onClick={() => handleLectureClick(lecture.id)}
      className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-750 transition-colors"
    >
      <div className="relative h-48 bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-white">{lecture.title}</h3>
            <span className={`px-3 py-1 rounded-full text-sm ${
              lecture.mode === 'online' ? 'bg-green-500' : 'bg-blue-500'
            } text-white`}>
              {lecture.mode === 'online' ? '💻 Online' : '🏛️ Offline'}
            </span>
          </div>
          <div className="space-y-1 text-gray-200">
            <p>👤 {lecture.instructor}</p>
            <p>📅 {new Date(lecture.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</p>
            <p>⏰ {lecture.time}</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex flex-wrap gap-2">
          {lecture.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="space-y-2 text-gray-400">
          <p>{lecture.description}</p>
          {lecture.venue && <p>📍 {lecture.venue}</p>}
          {lecture.meetLink && <p>🔗 {lecture.meetLink}</p>}
          <div className="flex justify-between items-center text-sm">
            <span>Capacity: {lecture.registeredCount}/{lecture.capacity}</span>
            <span className={lecture.registeredCount >= lecture.capacity ? 'text-red-500' : 'text-green-500'}>
              {lecture.registeredCount >= lecture.capacity ? 'Full' : 'Available'}
            </span>
          </div>
        </div>

        {isPast && lecture.recording && (
          <a
            href={lecture.recording}
            className="block w-full py-2 text-center bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            Watch Recording
          </a>
        )}
      </div>
    </div>
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
                  <span className="flex items-center">
                    ✉️ {user?.email}
                  </span>
                  <span className="flex items-center">
                    📚 {user?.department}
                  </span>
                  <span className="flex items-center">
                    🎓 {user?.rollNumber}
                  </span>
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
          {/* Schedule Talk Button */}
          <div className="lg:col-span-3">
            <button
              onClick={() => setShowRequestForm(true)}
              className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl flex items-center justify-center font-semibold hover:opacity-90 transition-opacity"
            >
              ➕ Schedule a Talk
            </button>
          </div>

          {/* Tabs and Content */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-3 gap-4 bg-gray-800 p-1 rounded-xl mb-6">
              <TabButton 
                icon="📅"
                label="Upcoming Lectures"
                tab="upcoming"
              />
              <TabButton
                icon="⏰"
                label="Past Lectures"
                tab="past"
              />
              <TabButton
                icon="👥"
                label="My Scheduled Talks"
                tab="scheduled"
              />
            </div>

            {/* Lecture Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'upcoming' && upcomingLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={false} />
              ))}
              {activeTab === 'past' && pastLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={true} />
              ))}
              {activeTab === 'scheduled' && scheduledTalks.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={false} />
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
      {showRequestForm && <RequestClassForm />}
    </div>
  );
};

export default Dashboard;