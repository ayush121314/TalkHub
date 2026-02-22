import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, User, BookOpen, Users, Check, HourglassIcon, XCircle } from 'lucide-react';

const LectureCard = ({ lecture, isPast, onClick, isUserRegistered }) => {
  // Check if this is a talk request
  const isTalkRequest = lecture.isRequest === true;

  // Calculate capacity percentage for progress bar - only for upcoming lectures
  const capacityPercentage = isPast ? 100 : Math.min(100, (lecture.registeredCount / lecture.capacity) * 100);

  // Status label based on lecture availability or request status
  const getStatusLabel = () => {
    if (isTalkRequest) {
      return lecture.status === 'pending' ? "PENDING APPROVAL" :
        lecture.status === 'rejected' ? "REJECTED" : "APPROVED";
    }

    // Check if lecture is past or completed
    const currentDate = new Date();
    const lectureDate = new Date(lecture.date);
    const isPastOrCompleted = lectureDate < currentDate || lecture.status === 'completed';

    if (isPastOrCompleted) return "COMPLETED";
    if (lecture.registeredCount >= lecture.capacity) return "FULL";
    return "AVAILABLE";
  };

  // Progress bar color based on capacity
  const getProgressColor = () => {
    if (isTalkRequest) {
      return lecture.status === 'pending' ? "bg-amber-500" :
        lecture.status === 'rejected' ? "bg-red-500" : "bg-emerald-500";
    }

    if (lecture.status === 'completed') return "bg-gray-500";
    if (isPast) return "bg-gray-500";
    if (lecture.registeredCount >= lecture.capacity) return "bg-red-500";
    if (capacityPercentage > 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <motion.div
      whileHover={{ scale: isTalkRequest && lecture.status === 'rejected' ? 1 : 1.02, y: isTalkRequest && lecture.status === 'rejected' ? 0 : -4 }}
      whileTap={{ scale: isTalkRequest && lecture.status === 'rejected' ? 1 : 0.98 }}
      onClick={() => {
        if (!(isTalkRequest && lecture.status === 'rejected')) {
          onClick(lecture.id);
        }
      }}
      className={`bg-white rounded-xl shadow-md overflow-hidden ${isTalkRequest && lecture.status === 'rejected' ? 'cursor-default opacity-80' : 'cursor-pointer hover:shadow-lg'
        } transition-all border border-blue-100`}
    >
      {/* Header with improved gradient */}
      <div className={`relative ${isTalkRequest && lecture.status === 'pending' ? 'bg-gradient-to-br from-amber-50 to-amber-100' :
        isTalkRequest && lecture.status === 'rejected' ? 'bg-gradient-to-br from-red-50 to-red-100' :
          isPast ? 'bg-gradient-to-br from-gray-50 to-blue-100' :
            'bg-gradient-to-br from-blue-50 to-indigo-100'
        } p-5`}>
        {/* Mode badge - top left, like in the example */}
        <div className="flex items-center justify-between mb-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${lecture.mode === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
            }`}>
            {lecture.mode === 'online' ? <Video size={12} className="mr-1" /> : <MapPin size={12} className="mr-1" />}
            {lecture.mode === 'online' ? 'Online' : 'In-Person'}
          </span>

          {/* Status badge */}
          <div className={`px-2.5 py-0.5 rounded-full text-xs font-medium shadow-sm ${lecture.status === 'completed' || isPast ? 'bg-gray-100 text-gray-600' :
            lecture.registeredCount >= lecture.capacity ? 'bg-red-100 text-red-600' :
              'bg-emerald-100 text-emerald-600'
            }`}>
            {getStatusLabel()}
          </div>
        </div>

        {/* Title with proper spacing */}
        <h3 className="text-xl font-bold text-gray-800 mb-4 line-clamp-2">{lecture.title}</h3>

        {/* Instructor and time info - rearranged like in the example */}
        <div className="flex items-center text-gray-700 mb-4">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mr-2 shadow-sm">
            <User size={16} className="text-white" />
          </div>
          <span className="font-medium">{lecture.instructor}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2 bg-white bg-opacity-70 p-2 rounded-md shadow-sm">
            <Calendar size={14} className="text-blue-600" />
            {new Date(lecture.date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-2 bg-white bg-opacity-70 p-2 rounded-md shadow-sm">
            <Clock size={14} className="text-blue-600" />
            {lecture.time}
          </div>
        </div>
      </div>

      {/* Capacity bar with improved styling - only show for non-past lectures */}
      {!isPast && (
        <div className="w-full h-2 bg-gray-100">
          <div
            className={`h-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: isTalkRequest ? (lecture.status === 'pending' ? '50%' : lecture.status === 'rejected' ? '100%' : '100%') : `${capacityPercentage}%` }}
          />
        </div>
      )}

      {/* Content section with improved layout */}
      <div className="p-5 bg-gradient-to-br from-white to-blue-50">
        {/* Tags row with enhanced styling - similar to example */}
        {lecture.tags && lecture.tags.length > 0 && (
          <div className="mb-4">
            {/* Tags header */}
            <div className="flex items-center mb-2">
              <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-full mr-2 shadow-sm"></div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Topics</span>
            </div>

            {/* Tags container with enhanced visual appeal */}
            <div className="flex flex-wrap gap-2">
              {lecture.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-white text-gray-700 text-xs rounded-full border border-blue-200 
                            hover:bg-blue-50 hover:border-blue-300 hover:text-indigo-800 
                            transition-all duration-200 ease-in-out shadow-sm"
                >
                  {tag.length > 15 ? `${tag.substring(0, 15)}...` : tag}
                </span>
              ))}
              {lecture.tags.length > 3 && (
                <span className="px-3 py-1 bg-white text-gray-500 text-xs rounded-full border border-blue-200 shadow-sm">
                  +{lecture.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description - minimal as requested */}
        <p className="text-gray-600 text-sm leading-relaxed mb-5 line-clamp-2 bg-white bg-opacity-80 p-3 rounded-lg shadow-sm h-20 overflow-hidden">
          {lecture.description.length > 150 ? `${lecture.description.substring(0, 150)}...` : lecture.description}
        </p>

        {/* Info cards grid with consistent styling - organized like the example */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Location card */}
          <div className="bg-white rounded-lg p-3 flex items-start hover:bg-blue-50 transition-colors shadow-sm border border-blue-100">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
              {lecture.mode === 'online' ?
                <Video size={16} className="text-white" /> :
                <MapPin size={16} className="text-white" />
              }
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Location</div>
              <div className="text-sm text-gray-800 line-clamp-2">{lecture.venue || 'Online'}</div>
            </div>
          </div>

          {/* Duration card */}
          <div className="bg-white rounded-lg p-3 flex items-start hover:bg-blue-50 transition-colors shadow-sm border border-blue-100">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
              <Clock size={16} className="text-white" />
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-0.5">Duration</div>
              <div className="text-sm text-gray-800">
                {lecture.duration || 60} mins
              </div>
            </div>
          </div>
        </div>

        {/* Attendees counter - matching the example */}
        {!isTalkRequest && isPast ? (
          <div className="flex justify-between items-center mb-4 text-xs bg-white p-2 rounded-lg shadow-sm">
            <div className="text-gray-500">Live Attendees</div>
            <div className="text-gray-800 font-medium flex items-center">
              <Users size={14} className="text-blue-600 mr-1" />
              {lecture.registeredCount || 0}
            </div>
          </div>
        ) : !isTalkRequest && !isPast ? (
          <div className="flex justify-between items-center mb-4 text-xs bg-white p-2 rounded-lg shadow-sm">
            <div className="text-gray-500">Capacity</div>
            <div className="text-gray-800 font-medium">
              {lecture.registeredCount} / {lecture.capacity}
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-4 text-xs bg-white p-2 rounded-lg shadow-sm">
            <div className="text-gray-500">Status</div>
            <div className={`font-medium flex items-center
              ${lecture.status === 'pending' ? 'text-amber-600' :
                lecture.status === 'rejected' ? 'text-red-600' :
                  'text-emerald-600'}`}>
              {lecture.status === 'pending' ?
                <><HourglassIcon size={14} className="mr-1" /> Waiting for approval</> :
                lecture.status === 'rejected' ?
                  <><XCircle size={14} className="mr-1" /> Request rejected</> :
                  <><Check size={14} className="mr-1" /> Request approved</>}
            </div>
          </div>
        )}

        {/* Action button with improved styling - matching the example style */}
        {(isPast || lecture.status === 'completed') && lecture.recording ? (
          <a
            href={lecture.recording}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-md"
          >
            <BookOpen size={16} />
            Watch Recording
          </a>
        ) : !(isPast || lecture.status === 'completed') && !isTalkRequest ? (
          <button
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 ${isUserRegistered
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
              : lecture.registeredCount >= lecture.capacity
                ? 'bg-gray-300 text-gray-600 hover:bg-gray-400'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-md'
              } rounded-lg font-medium transition-all`}
            disabled={isUserRegistered || lecture.registeredCount >= lecture.capacity}
          >
            {isUserRegistered ? (
              <>
                <Check size={16} />
                Registered
              </>
            ) : lecture.registeredCount >= lecture.capacity ? (
              <>
                <Users size={16} />
                Full
              </>
            ) : (
              <>
                <Users size={16} />
                Register Now
              </>
            )}
          </button>
        ) : !isTalkRequest ? (
          <div className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-200 text-gray-600 rounded-lg font-medium">
            <Check size={16} />
            Completed
          </div>
        ) : (
          <div
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-medium ${lecture.status === 'pending' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white' :
              lecture.status === 'rejected' ? 'bg-gray-300 text-gray-600' :
                'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
              } shadow-md`}
          >
            {lecture.status === 'pending' ? (
              <>
                <HourglassIcon size={16} />
                Awaiting Approval
              </>
            ) : lecture.status === 'rejected' ? (
              <>
                <XCircle size={16} />
                Request Rejected
              </>
            ) : (
              <>
                <Check size={16} />
                Request Approved
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LectureCard;