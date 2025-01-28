import React from 'react';

const LectureCard = ({ lecture, isPast, onClick }) => (
  <div 
    onClick={() => onClick(lecture.id)}
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
        {(lecture.tags || []).map((tag, index) => (
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

export default LectureCard;
