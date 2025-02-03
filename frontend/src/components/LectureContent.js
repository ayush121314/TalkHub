import React from 'react';

const LectureContent = ({ lecture }) => {
  return (
    <div className="lg:col-span-2">
      <div className="bg-gray-800 rounded-xl p-6 shadow-xl mb-6">
        <h2 className="text-2xl font-semibold text-white mb-4">About this Lecture</h2>
        <p className="text-gray-300 mb-6 whitespace-pre-wrap">{lecture.description}</p>

        {lecture.prerequisites?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-xl">📚</span>
              Prerequisites
            </h3>
            <ul className="list-disc list-inside text-gray-300 space-y-2">
              {lecture.prerequisites.map((prereq, index) => (
                <li key={index}>{prereq}</li>
              ))}
            </ul>
          </div>
        )}

        {lecture.tags?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-xl">🏷️</span>
              Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {lecture.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-900/50 text-purple-200 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {lecture.status === 'cancelled' && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 text-red-300 mb-2">
              <span className="text-xl">⚠️</span>
              <h3 className="text-lg font-semibold">Lecture Cancelled</h3>
            </div>
            <p className="text-red-200">This lecture has been cancelled. Please check other available lectures.</p>
          </div>
        )}

        {lecture.recording && lecture.status === 'completed' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
              <span className="text-xl">📹</span>
              Recording
            </h3>
            <a
              href={lecture.recording}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 bg-gray-700 rounded-lg text-blue-400 hover:bg-gray-600 transition-colors"
            >
              Watch Recording
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default LectureContent;