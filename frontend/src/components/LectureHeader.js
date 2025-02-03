import React from 'react';

const LectureHeader = ({ lecture, navigate }) => {
  const getStatusBadgeColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-500',
      ongoing: 'bg-green-500',
      completed: 'bg-purple-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  return (
    <div className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 pt-16 pb-24">
      <div className="max-w-7xl mx-auto px-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
        >
          ← Back to Dashboard
        </button>
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
          <h1 className="text-4xl font-bold text-white">{lecture.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm text-white ${getStatusBadgeColor(lecture.status)} w-fit`}>
            {lecture.status.charAt(0).toUpperCase() + lecture.status.slice(1)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            {new Date(lecture.date).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">⏰</span>
            {lecture.time} ({lecture.duration} minutes)
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">{lecture.mode === 'online' ? '🎥' : '📍'}</span>
            {lecture.mode === 'online' ? 'Online Session' : lecture.venue}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            {lecture.registeredUsers?.length || 0}/{lecture.capacity} registered
          </div>
        </div>
      </div>
    </div>
  );
};

export default LectureHeader;