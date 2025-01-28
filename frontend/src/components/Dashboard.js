import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming');
  const navigate = useNavigate();

  const scheduleData = [
    {
      id: 1,
      title: "Introduction to AI",
      instructor: "Ayush Singh Chauhan",
      date: "Mar 15, 2024",
      time: "2:00 PM - 4:00 PM",
      mode: "online",
      status: "pending",
      description: "A comprehensive introduction to Artificial Intelligence covering basic concepts, algorithms, and real-world applications. We'll explore machine learning fundamentals, neural networks, and the impact of AI on various industries.",
      tags: ["AI", "Machine Learning"],
      meetLink: "meet.google.com/abc-def-ghi",
      department: "Computer Science",
      prerequisites: ["Basic Python knowledge", "Mathematics fundamentals"],
      materials: ["Slides", "Code samples", "Practice exercises"],
      capacity: 50,
      registeredCount: 35
    }
  ];

  const upcomingLectures = [
    {
      id: 1,
      title: "Advanced Web Development",
      instructor: "Dr. Prateek Rathore",
      date: "Feb 1, 2024",
      time: "2:00 PM - 4:00 PM",
      mode: "online",
      meetLink: "meet.google.com/xyz",
      department: "Computer Science",
      tags: ["React", "Node.js", "Web Dev"],
      description: "Deep dive into modern web development practices including React hooks, state management, and server-side rendering.",
      prerequisites: ["JavaScript", "Basic React knowledge"],
      materials: ["Project starter code", "Documentation"],
      capacity: 40,
      registeredCount: 25
    }
  ];

  const pastLectures = [
    {
      id: 1,
      title: "Data Structures Deep Dive",
      instructor: "Dr. Emily Chen",
      date: "Jan 25, 2024",
      time: "3:00 PM - 5:00 PM",
      mode: "offline",
      location: "Room 201, CS Building",
      recording: "https://recording-link.com",
      tags: ["DSA", "Algorithms", "Programming"],
      description: "An in-depth exploration of advanced data structures and their practical applications.",
      materials: ["Recording", "Practice problems", "Solutions"],
      attendance: 45
    }
  ];

  const RequestClassForm = () => {
    const [mode, setMode] = useState('online');
    const [formData, setFormData] = useState({
      topic: '',
      description: '',
      date: '',
      duration: '60',
      venue: '',
      meetLink: '',
      capacity: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission
      setShowRequestForm(false);
    };

    return (
      <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
            <h3 className="text-2xl font-bold text-white">Schedule a Talk</h3>
            <p className="text-blue-100">Share your knowledge with peers</p>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Topic</label>
                <input 
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter talk topic"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows="3"
                  placeholder="What will you cover?"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Mode</label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <button
                    type="button"
                    onClick={() => setMode('online')}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 ${
                      mode === 'online'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    💻 Online
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('offline')}
                    className={`p-3 rounded-xl flex items-center justify-center gap-2 ${
                      mode === 'offline'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-800 text-gray-300'
                    }`}
                  >
                    🏛️ Offline
                  </button>
                </div>
              </div>
              {mode === 'offline' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Venue</label>
                  <input
                    type="text"
                    value={formData.venue}
                    onChange={(e) => setFormData({...formData, venue: e.target.value})}
                    className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter venue details"
                    required
                  />
                </div>
              )}
              {mode === 'online' && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Meeting Link</label>
                  <input
                    type="url"
                    value={formData.meetLink}
                    onChange={(e) => setFormData({...formData, meetLink: e.target.value})}
                    className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter meeting link"
                    required
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-300">Duration</label>
                  <select 
                    value={formData.duration}
                    onChange={(e) => setFormData({...formData, duration: e.target.value})}
                    className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="90">1.5 hours</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Maximum number of participants"
                  required
                />
              </div>
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
      onClick={() => navigate(`/lecture/${lecture.id}`)}
      className="bg-gray-800 border-gray-700 overflow-hidden rounded-xl hover:transform hover:scale-105 transition-transform cursor-pointer"
    >
      <div className="relative h-48 bg-gray-700 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          <h2 className="text-white text-2xl font-bold text-center px-4">
            {lecture.title}
          </h2>
        </div>
        <div className="absolute top-4 right-4">
          <span
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              lecture.mode === "online" ? "bg-green-500" : "bg-blue-500"
            } text-white flex items-center gap-2`}
          >
            {lecture.mode === "online" ? "💻" : "🏛️"} {lecture.mode}
          </span>
        </div>
      </div>
      <div className="p-6">
        <p className="text-gray-400 mb-4 flex items-center gap-2">
          👤 {lecture.instructor}
        </p>
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-400 gap-2">📅 {lecture.date}</div>
          <div className="flex items-center text-gray-400 gap-2">⏰ {lecture.time}</div>
          {lecture.location && (
            <div className="flex items-center text-gray-400 gap-2">📍 {lecture.location}</div>
          )}
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {lecture.tags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-700 rounded-full text-sm text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-8">
              <div className="w-32 h-32 rounded-full bg-gray-800 p-1 shadow-xl">
                <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-6xl">U</span>
                </div>
              </div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Ayush Singh Chauhan</h2>
                <div className="flex flex-wrap gap-4 text-gray-300">
                  <span className="flex items-center">
                    ✉️ ayush.22ucs045@lnmiit.ac.in
                  </span>
                  <span className="flex items-center">
                    📚 B.Tech Computer Science
                  </span>
                  <span className="flex items-center">
                    🎓 22ucs045
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => {/* Add logout logic here */}}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTab === 'upcoming' && upcomingLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={false} />
              ))}
              {activeTab === 'past' && pastLectures.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={true} />
              ))}
              {activeTab === 'scheduled' && scheduleData.map((lecture) => (
                <LectureCard key={lecture.id} lecture={lecture} isPast={false} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {showRequestForm && <RequestClassForm />}
    </div>
  );
};

export default Dashboard;