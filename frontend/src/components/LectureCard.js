import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, User, Star, BookOpen, Users, Check, AlertTriangle, HourglassIcon, XCircle } from 'lucide-react';

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
    
    if (isPast) return "COMPLETED";
    if (lecture.registeredCount >= lecture.capacity) return "FULL";
    return "AVAILABLE";
  };
  
  // Status color based on lecture availability or request status
  const getStatusColor = () => {
    if (isTalkRequest) {
      return lecture.status === 'pending' ? "bg-yellow-600" : 
             lecture.status === 'rejected' ? "bg-red-600" : "bg-green-600";
    }
    
    if (isPast) return "bg-slate-600";
    if (lecture.registeredCount >= lecture.capacity) return "bg-rose-600";
    return "bg-emerald-600";
  };
  
  // Progress bar color based on capacity
  const getProgressColor = () => {
    if (isTalkRequest) {
      return lecture.status === 'pending' ? "bg-yellow-500" : 
             lecture.status === 'rejected' ? "bg-red-500" : "bg-green-500";
    }
    
    if (isPast) return "bg-slate-600";
    if (lecture.registeredCount >= lecture.capacity) return "bg-rose-600";
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
      className={`bg-slate-900 rounded-xl shadow-xl overflow-hidden ${
        isTalkRequest && lecture.status === 'rejected' ? 'cursor-default opacity-80' : 'cursor-pointer hover:border-sky-700'
      } transition-all border border-slate-800`}
    >
      {/* Header with improved gradient */}
      <div className={`relative bg-gradient-to-r ${
        isTalkRequest && lecture.status === 'pending' ? 'from-yellow-800 to-orange-800' :
        isTalkRequest && lecture.status === 'rejected' ? 'from-red-800 to-rose-800' :
        'from-sky-800 to-violet-800'
      } p-5`}>
        {/* Status ribbon */}
        <div className="absolute -right-12 top-6 transform rotate-45">
          <div className={`w-40 text-center py-1 text-xs font-bold text-white ${getStatusColor()}`}>
            {getStatusLabel()}
          </div>
        </div>

        {/* Title and mode */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              lecture.mode === 'online' ? 'bg-sky-900 text-sky-300' : 'bg-violet-900 text-violet-300'
            }`}>
              {lecture.mode === 'online' ? <Video size={12} className="mr-1" /> : <MapPin size={12} className="mr-1" />}
              {lecture.mode === 'online' ? 'Online' : 'In-Person'}
            </span>
            
            {/* Display request status icon */}
            {isTalkRequest && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                ${lecture.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 
                  lecture.status === 'rejected' ? 'bg-red-900 text-red-300' : 
                  'bg-green-900 text-green-300'}`}>
                {lecture.status === 'pending' ? 
                  <><HourglassIcon size={12} className="mr-1" /> Pending</> : 
                  lecture.status === 'rejected' ? 
                  <><XCircle size={12} className="mr-1" /> Rejected</> : 
                  <><Check size={12} className="mr-1" /> Approved</>}
              </span>
            )}
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight line-clamp-2">{lecture.title}</h3>
        </div>
        
        {/* Instructor and time info */}
        <div className="flex items-center text-white mb-4">
          <div className="h-8 w-8 rounded-full bg-sky-900 flex items-center justify-center mr-2">
            <User size={16} className="text-sky-300" />
          </div>
          <span className="font-medium">{lecture.instructor}</span>
        </div>
        
        <div className="grid grid-cols-2 gap-3 text-sm text-white/90">
          <div className="flex items-center gap-2 bg-slate-900/20 p-2 rounded-md">
            <Calendar size={14} className="text-sky-300" /> 
            {new Date(lecture.date).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric'
            })}
          </div>
          <div className="flex items-center gap-2 bg-slate-900/20 p-2 rounded-md">
            <Clock size={14} className="text-sky-300" /> 
            {lecture.time} 
          </div>
        </div>
      </div>

      {/* Capacity bar with improved styling - only show for non-past lectures */}
      {!isPast && (
        <div className="w-full h-2 bg-slate-800">
          <div 
            className={`h-full ${getProgressColor()} transition-all duration-300`}
            style={{ width: isTalkRequest ? (lecture.status === 'pending' ? '50%' : lecture.status === 'rejected' ? '100%' : '100%') : `${capacityPercentage}%` }}
          />
        </div>
      )}

      {/* Content section with improved layout */}
      <div className="p-5">
        {/* Tags row with enhanced styling */}
        {lecture.tags && lecture.tags.length > 0 && (
          <div className="mb-4">
            {/* Tags header */}
            <div className="flex items-center mb-2">
              <div className="w-1 h-4 bg-gradient-to-b from-sky-400 to-violet-500 rounded-full mr-2"></div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Topics</span>
            </div>
            
            {/* Tags container with enhanced visual appeal */}
            <div className="flex flex-wrap gap-2">
              {lecture.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-slate-800/70 text-slate-300 text-xs rounded-full border border-slate-700 
                            hover:bg-slate-700 hover:border-slate-600 hover:text-white hover:shadow-md 
                            transition-all duration-200 ease-in-out backdrop-blur-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Admin message for rejected requests */}
        {isTalkRequest && lecture.status === 'rejected' && lecture.adminMessage && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-900 rounded-lg">
            <div className="flex items-center text-red-400 mb-1">
              <AlertTriangle size={14} className="mr-1" />
              <span className="text-xs font-semibold">Admin Feedback</span>
            </div>
            <p className="text-red-100 text-sm">{lecture.adminMessage}</p>
          </div>
        )}
        
        {/* Description with improved text styling */}
        <p className="text-slate-300 text-sm leading-relaxed mb-5 line-clamp-3">
          {lecture.description}
        </p>
        
        {/* Info cards grid with consistent styling */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Location card */}
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-start hover:bg-slate-800 transition-colors">
            <div className="h-8 w-8 rounded-full bg-violet-900/30 flex items-center justify-center mr-2 flex-shrink-0">
              {lecture.mode === 'online' ? 
                <Video size={16} className="text-violet-400" /> : 
                <MapPin size={16} className="text-violet-400" />
              }
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Location</div>
              <div className="text-sm text-slate-200 line-clamp-2">{lecture.venue || 'Online'}</div>
            </div>
          </div>
          
          {/* Duration card */}
          <div className="bg-slate-800/50 rounded-lg p-3 flex items-start hover:bg-slate-800 transition-colors">
            <div className="h-8 w-8 rounded-full bg-sky-900/30 flex items-center justify-center mr-2 flex-shrink-0">
              <Clock size={16} className="text-sky-400" /> 
            </div>
            <div>
              <div className="text-xs text-slate-400 mb-0.5">Duration</div>
              <div className="text-sm text-slate-200">
                {lecture.duration || 60} mins
              </div>
            </div>
          </div>
        </div>
        
        {/* Capacity indicator - only for non-past lectures and non-requests */}
        {!isTalkRequest && !isPast ? (
          <div className="flex justify-between items-center mb-4 text-xs">
            <div className="text-slate-400">Capacity</div>
            <div className="text-slate-300 font-medium">
              {lecture.registeredCount} / {lecture.capacity}
            </div>
          </div>
        ) : !isTalkRequest && isPast ? (
          <div className="flex justify-between items-center mb-4 text-xs">
            <div className="text-slate-400">Live Attendees</div>
            <div className="text-slate-300 font-medium flex items-center">
              <Users size={14} className="text-sky-400 mr-1" /> 
              {lecture.registeredCount || 0}
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-4 text-xs">
            <div className="text-slate-400">Status</div>
            <div className={`font-medium flex items-center
              ${lecture.status === 'pending' ? 'text-yellow-300' : 
                lecture.status === 'rejected' ? 'text-red-300' : 
                'text-green-300'}`}>
              {lecture.status === 'pending' ? 
                <><HourglassIcon size={14} className="mr-1" /> Waiting for approval</> : 
                lecture.status === 'rejected' ? 
                <><XCircle size={14} className="mr-1" /> Request rejected</> : 
                <><Check size={14} className="mr-1" /> Request approved</>}
            </div>
          </div>
        )}
       
        {/* Action button with improved styling */}
        {isPast && lecture.recording ? (
          <a
            href={lecture.recording}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 text-white rounded-lg font-medium transition-all shadow-lg"
          >
            <BookOpen size={16} />
            Watch Recording
          </a>
        ) : !isPast && !isTalkRequest ? (
          <button
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 ${
              isUserRegistered
                ? 'bg-green-600/80 text-white' 
                : lecture.registeredCount >= lecture.capacity 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 text-white shadow-lg'
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
        ) : isTalkRequest && (
          <div 
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-lg font-medium ${
              lecture.status === 'pending' ? 'bg-yellow-600/80 text-white' : 
              lecture.status === 'rejected' ? 'bg-slate-700 text-slate-300' : 
              'bg-green-600/80 text-white'
            }`}
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