// NewRequestClassForm.js
import React, { useState } from 'react';

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
    department: '',
    tags: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const now = new Date(); // Current date and time
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
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-gray-900 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh]"
      >
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-2xl">
          <h3 className="text-2xl font-bold text-white">Schedule a Talk</h3>
          <p className="text-blue-100">Share your knowledge with peers</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
              required
            />

            <label className="block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
              rows="3"
              required
            />

            <label className="block text-sm font-medium text-gray-300">Mode</label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => setMode('online')}
                className={`px-4 py-2 rounded-lg ${
                  mode === 'online' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                Online
              </button>
              <button
                type="button"
                onClick={() => setMode('offline')}
                className={`px-4 py-2 rounded-lg ${
                  mode === 'offline' ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
              >
                Offline
              </button>
            </div>

            {mode === 'offline' ? (
              <>
                <label className="block text-sm font-medium text-gray-300">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
                  required
                />
              </>
            ) : (
              <>
                <label className="block text-sm font-medium text-gray-300">Meeting Link</label>
                <input
                  type="url"
                  name="meetLink"
                  value={formData.meetLink}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
                  required
                />
              </>
            )}

            <label className="block text-sm font-medium text-gray-300">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
              min={new Date().toISOString().split('T')[0]}
              required
            />

            <label className="block text-sm font-medium text-gray-300">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
              required
            />

            <label className="block text-sm font-medium text-gray-300">Department</label>
            <select
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">Computer Science</option>
              <option value="ECE">Electronics</option>
              <option value="MME">Mechanical</option>
              <option value="CCE">Communication</option>
            </select>

            <label className="block text-sm font-medium text-gray-300">Tags</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
              placeholder="Comma-separated tags"
              required
            />

            <label className="block text-sm font-medium text-gray-300">Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-xl bg-gray-800 border-gray-700 text-white"
              min="1"
              required
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-800 text-gray-200 rounded-xl hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:opacity-90 transition-opacity"
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
