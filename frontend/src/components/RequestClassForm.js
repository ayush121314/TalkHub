import React, { useState } from 'react';
import { FaCalendarAlt, FaClock, FaTags, FaUsers, FaLink, FaMapMarkerAlt } from 'react-icons/fa';

const NewRequestClassForm = ({ onClose, onSubmit }) => {
  const [mode, setMode] = useState('online');
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
    tags: '', 
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const now = new Date();
    const selectedDate = new Date(`${formData.date}T${formData.time}`);
  
    if (selectedDate <= now) {
      alert('Lecture date and time must be in the future.');
      return;
    }
  
    try {
      const token = localStorage.getItem('token');
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';
      const response = await fetch(`${apiUrl}/api/lectures/request`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          mode,
          tags: formData.tags.split(',').map((tag) => tag.trim()),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit talk request');
      }
  
      const newTalk = await response.json();
      onSubmit(newTalk);
    } catch (err) {
      console.error('Failed to submit talk request:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-gray-900 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-8 transition-transform transform hover:scale-105"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <h3 className="text-4xl font-extrabold text-white">Schedule a Talk</h3>
          <p className="text-blue-100 text-lg">Share your knowledge with peers</p>
        </div>

        <div className="space-y-6 mt-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <span className="mr-2"><FaTags /></span> Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
              placeholder="Enter your talk title"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <span className="mr-2"><FaTags /></span> Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
              rows="4"
              placeholder="Describe your talk in brief"
              required
            />
          </div>

          {/* Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300">Mode</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setMode('online')}
                className={`px-6 py-3 rounded-lg text-white text-lg font-semibold transition duration-200 ease-in-out ${mode === 'online' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setMode('offline')}
                className={`px-6 py-3 rounded-lg text-white text-lg font-semibold transition duration-200 ease-in-out ${mode === 'offline' ? 'bg-purple-600' : 'bg-gray-800 hover:bg-gray-700'}`}
              >
                Offline
              </button>
            </div>
          </div>

          {/* Venue or Link */}
          {mode === 'offline' ? (
            <div>
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <span className="mr-2"><FaMapMarkerAlt /></span> Venue
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                placeholder="Enter the venue"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <span className="mr-2"><FaLink /></span> Meeting Link
              </label>
              <input
                type="url"
                name="meetLink"
                value={formData.meetLink}
                onChange={handleInputChange}
                className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                placeholder="Paste your meeting link"
                required
              />
            </div>
          )}

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <span className="mr-2"><FaCalendarAlt /></span> Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 flex items-center">
                <span className="mr-2"><FaClock /></span> Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                required
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <span className="mr-2"><FaClock /></span> Duration (in minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={formData.duration}
              onChange={handleInputChange}
              className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
              min="1"
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <span className="mr-2"><FaTags /></span> Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
              placeholder="Comma-separated tags"
              required
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <span className="mr-2"><FaUsers /></span> Capacity
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
              min="1"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-gray-200 rounded-xl hover:bg-gray-700 transition-colors duration-200 ease-in-out"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity duration-200 ease-in-out"
            >
              Submit
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewRequestClassForm;