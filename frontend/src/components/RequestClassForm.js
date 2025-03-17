import React, { useState, useRef } from 'react';
import { FaCalendarAlt, FaClock, FaTags, FaUsers, FaLink, FaMapMarkerAlt, FaBookOpen } from 'react-icons/fa';

const NewRequestClassForm = ({ onClose, onSubmit }) => {
  const [mode, setMode] = useState('online');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef(null);
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

  const [showCalendar, setShowCalendar] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  const handleDateClick = (e) => {
    e.preventDefault();
    setShowCalendar(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate <= today) {
      alert('Please select a future date for the lecture.');
      return;
    }
    
    try {
      setIsSubmitting(true);
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
          prerequisites: formData.prerequisites.split(',').map((prereq) => prereq.trim()),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to submit talk request');
      }
  
      const newTalk = await response.json();
      onSubmit(newTalk);
    } catch (err) {
      console.error('Failed to submit talk request:', err);
      alert('Failed to submit your talk request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOutsideClick = (e) => {
    if (formRef.current && !formRef.current.contains(e.target) && !isSubmitting) {
      onClose();
    }
  };

  const DateInput = () => (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-300 flex items-center">
        <span className="mr-2"><FaCalendarAlt /></span> Date
      </label>
      <div className="relative">
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          min={minDate}
          className="w-full p-4 pl-12 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out appearance-none"
          required
          style={{
            colorScheme: 'dark'
          }}
        />
        <FaCalendarAlt 
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" 
          size={20}
        />
      </div>
      {showCalendar && (
        <div className="absolute z-10 mt-2 p-4 bg-gray-800 rounded-xl shadow-xl border border-gray-700">
          <div className="calendar-popup">
            {/* Calendar header styling added here */}
            <input
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              min={minDate}
              className="w-full p-2 border rounded-lg bg-gray-700 border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{
                colorScheme: 'dark'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
      onClick={handleOutsideClick}
    >
      <form 
        ref={formRef}
        onSubmit={handleSubmit} 
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900"
        onClick={(e) => e.stopPropagation()}
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

          {/* Mode Selection */}
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
            <DateInput />

            <div>
              <label className="block text-sm font-medium text-white flex items-center">
                <span className="mr-2 text-white"><FaClock /></span> Time
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full p-4 pl-12 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
                  required
                />
                <FaClock 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white pointer-events-none" 
                  size={20}
                />
              </div>
            </div>
          </div>

          {/* Rest of the form fields remain the same */}
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

          {/* Prerequisites - NEW FIELD */}
          <div>
            <label className="block text-sm font-medium text-gray-300 flex items-center">
              <span className="mr-2"><FaBookOpen /></span> Prerequisites
            </label>
            <input
              type="text"
              name="prerequisites"
              value={formData.prerequisites}
              onChange={handleInputChange}
              className="w-full p-4 border rounded-xl bg-gray-800 border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 ease-in-out"
              placeholder="Comma-separated prerequisites (e.g. Basic JavaScript, HTML, CSS)"
            />
            <p className="text-xs text-gray-400 mt-1">List any prior knowledge or requirements for attendees</p>
          </div>

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

          {/* Submit and Cancel buttons */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-gray-200 rounded-xl hover:bg-gray-700 transition-colors duration-200 ease-in-out"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity duration-200 ease-in-out flex items-center justify-center min-w-[100px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NewRequestClassForm;