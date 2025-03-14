import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Video, User, Star, BookOpen } from 'lucide-react';

const LectureCard = ({ lecture, isPast, onClick }) => {
  // Calculate capacity percentage for progress bar
  const capacityPercentage = Math.min(100, (lecture.registeredCount / lecture.capacity) * 100);
  
  // Status label based on lecture availability
  const getStatusLabel = () => {
    if (isPast) return "COMPLETED";
    if (lecture.registeredCount >= lecture.capacity) return "FULL";
    return "AVAILABLE";
  };
  
  // Status color based on lecture availability
  const getStatusColor = () => {
    if (isPast) return "bg-slate-600";
    if (lecture.registeredCount >= lecture.capacity) return "bg-rose-600";
    return "bg-emerald-600";
  };
  
  // Progress bar color based on capacity
  const getProgressColor = () => {
    if (isPast) return "bg-slate-600";
    if (lecture.registeredCount >= lecture.capacity) return "bg-rose-600";
    if (capacityPercentage > 70) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <motion.div 
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(lecture.id)}
      className="bg-slate-900 rounded-xl shadow-xl overflow-hidden cursor-pointer transition-all border border-slate-800 hover:border-sky-700"
    >
      {/* Header with improved gradient */}
      <div className="relative bg-gradient-to-r from-sky-800 to-violet-800 p-5">
        {/* Status ribbon */}
        <div className="absolute -right-12 top-6 transform rotate-45">
          <div className={`w-40 text-center py-1 text-xs font-bold text-white ${getStatusColor()}`}>
            {}
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
            
            {lecture.featured && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900 text-amber-300">
                <Star size={12} className="mr-1" /> Featured
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

      {/* Capacity bar with improved styling */}
      <div className="w-full h-2 bg-slate-800">
        <div 
          className={`h-full ${getProgressColor()} transition-all duration-300`}
          style={{ width: `${capacityPercentage}%` }}
        />
      </div>

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
              <div className="text-sm text-slate-200 line-clamp-2">{lecture.venue || 'Online Session'}</div>
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
        
        {/* Capacity indicator */}
        <div className="flex justify-between items-center mb-4 text-xs">
          <div className="text-slate-400">Capacity</div>
          <div className="text-slate-300 font-medium">
            {lecture.registeredCount} / {lecture.capacity}
          </div>
        </div>
       
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
        ) : !isPast && (
          <button
            className={`flex items-center justify-center gap-2 w-full py-2.5 px-4 ${
              lecture.registeredCount >= lecture.capacity 
                ? 'bg-slate-700 text-slate-300 hover:bg-slate-600' 
                : 'bg-gradient-to-r from-sky-600 to-violet-600 hover:from-sky-500 hover:to-violet-500 text-white shadow-lg'
            } rounded-lg font-medium transition-all`}
            disabled={lecture.registeredCount >= lecture.capacity}
          >
            <Star size={16} />
            {lecture.registeredCount >= lecture.capacity ? 'Join Waitlist' : 'Register Now'}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default LectureCard;