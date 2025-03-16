import React, { useEffect } from 'react';
import { 
  BookOpen, 
  Tag, 
  AlertTriangle, 
  Video, 
  FileText, 
  UserCircle,
  Star,
  Award,
  MessageCircle,
  Link,
  Layers
} from 'lucide-react';
import InstructorProfile from './InstructorProfile';
import DiscussionForum from './DiscussionForum';

const LectureContent = ({ lecture, openModal }) => {
  // Add debugging console logs
  useEffect(() => {
    console.log("Lecture object:", lecture);
    console.log("Lecture ID:", lecture?._id);
    
    // Enhanced debugging
    if (!lecture?._id) {
      console.error("Missing lecture ID in lecture object:", lecture);
    }
  }, [lecture]);

  // Ensure we have a lecture object
  if (!lecture) {
    return (
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/70 backdrop-blur-sm rounded-3xl p-8 border border-indigo-900/30 overflow-hidden relative mt-6">
        <div className="text-center">
          <p className="text-slate-300">Loading lecture information...</p>
        </div>
      </div>
    );
  }

  // Get the lectureId - try multiple fields that might contain the ID
  const lectureId = lecture._id || lecture.id || lecture.lectureId;

  // Structure instructor data from the backend response
  const instructorData = lecture.instructor ? {
    name: lecture.instructor.name,
    title: lecture.instructor.title || 'Instructor',
    email: lecture.instructor.email,
    role: lecture.instructor.role,
    profilePic: lecture.instructor.profile?.profilePic,
    linkedinProfile: lecture.instructor.profile?.linkedinProfile,
    personalWebsite: lecture.instructor.profile?.personalWebsite,
    organization: lecture.instructor.profile?.organization,
    speakerBio: lecture.instructor.profile?.speakerBio,
    socialMediaHandle1: lecture.instructor.profile?.socialMediaHandle1,
    socialMediaHandle2: lecture.instructor.profile?.socialMediaHandle2,
    additionalInfo: lecture.instructor.profile?.additionalInfo
  } : null;

  const handleViewInstructorProfile = () => {
    if (instructorData && openModal) {
      openModal(<InstructorProfile instructor={instructorData} isModal={true} />);
    }
  };

  return (
    <>
      {/* About This Lecture */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-900/70 backdrop-blur-sm rounded-3xl p-8 border border-indigo-900/30 shadow-xl overflow-hidden relative">
        <div className="absolute -right-24 -top-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="h-6 w-6 text-indigo-400" />
            <h2 className="text-2xl font-bold text-white">About This Lecture</h2>
          </div>
          
          <div className="prose prose-invert prose-lg max-w-none">
            <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{lecture.description}</p>
          </div>
        </div>
      </div>

      {/* Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prerequisites Section */}
        {lecture.prerequisites?.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-indigo-900/30 overflow-hidden relative group hover:border-indigo-800/50 transition-all">
            <div className="absolute -right-24 -top-24 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-all"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Layers className="h-5 w-5 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Prerequisites</h3>
              </div>
              
              <ul className="space-y-3">
                {lecture.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="text-indigo-400 mt-1.5">•</div>
                    <p className="text-slate-300">{prereq}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Topics Section */}
        {lecture.tags?.length > 0 && (
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/70 backdrop-blur-sm rounded-2xl p-6 border border-indigo-900/30 overflow-hidden relative group hover:border-indigo-800/50 transition-all">
            <div className="absolute -right-24 -top-24 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-all"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-4">
                <Tag className="h-5 w-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Topics</h3>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {lecture.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1.5 bg-purple-900/30 text-purple-200 rounded-full text-sm font-medium border border-purple-800/30 hover:bg-purple-900/40 transition-colors cursor-default"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Instructor Preview Section */}
      {instructorData && (
        <div 
          className="bg-gradient-to-br from-slate-900 to-slate-900/70 backdrop-blur-sm rounded-3xl p-8 border border-indigo-900/30 overflow-hidden relative group hover:border-indigo-800/50 transition-all cursor-pointer"
          onClick={handleViewInstructorProfile}
        >
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-indigo-600/5 rounded-full blur-3xl group-hover:bg-indigo-600/10 transition-all"></div>
          <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl group-hover:bg-purple-600/10 transition-all"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <Award className="h-6 w-6 text-amber-400" />
              <h2 className="text-2xl font-bold text-white">Your Instructor</h2>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Instructor Image */}
              <div className="relative">
                {instructorData?.profilePic ? (
                  <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-indigo-500/30 shadow-lg shadow-indigo-900/20">
                    <img 
                      src={instructorData.profilePic} 
                      alt={instructorData.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border-2 border-indigo-500/30 flex items-center justify-center shadow-lg shadow-indigo-900/20">
                    <UserCircle className="w-14 h-14 text-indigo-400" />
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-slate-900" />
              </div>
              
              {/* Instructor Info */}
              <div className="md:flex-1 text-center md:text-left">
                <h3 className="text-xl font-bold text-white mb-1">{instructorData.name}</h3>
                {instructorData.title && (
                  <p className="text-indigo-300 font-medium mb-1">{instructorData.title}</p>
                )}
                {instructorData.organization && instructorData.organization !== 'null' && (
                  <p className="text-slate-400 text-sm">{instructorData.organization}</p>
                )}
                
                {/* Preview of bio if available */}
                {instructorData.speakerBio && instructorData.speakerBio !== 'null' && (
                  <div className="mt-3 text-slate-300 text-sm line-clamp-2">
                    {instructorData.speakerBio}
                  </div>
                )}
              </div>
              
              {/* View Profile Button */}
              <div className="md:self-center mt-4 md:mt-0">
                <button className="px-4 py-2 bg-indigo-900/40 hover:bg-indigo-800/60 text-indigo-300 rounded-lg border border-indigo-700/50 transition-all flex items-center gap-2 group">
                  <span>View Profile</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Discussion Forum Section */}
      {console.log("About to render DiscussionForum, lectureId:", lectureId)}
      {lectureId ? (
        <DiscussionForum lectureId={lectureId} />
      ) : (
        <div className="bg-gradient-to-br from-slate-900 to-slate-900/70 backdrop-blur-sm rounded-3xl p-8 border border-indigo-900/30 overflow-hidden relative mt-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageCircle className="h-6 w-6 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Discussion Forum</h2>
          </div>
          <p className="text-slate-300">
            Discussion forum will be available once lecture information is loaded.
          </p>
        </div>
      )}
      
      {/* Cancelled Notice */}
      {lecture.status === 'cancelled' && (
        <div className="bg-gradient-to-br from-rose-900/50 to-red-900/50 backdrop-blur-sm rounded-3xl p-8 border border-red-800/50 shadow-xl overflow-hidden relative">
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-400" />
              <h2 className="text-xl font-bold text-white">Lecture Cancelled</h2>
            </div>
            
            <p className="text-red-200">This lecture has been cancelled. Please check other available lectures.</p>
          </div>
        </div>
      )}
      
      {/* Recording Section for completed lectures */}
      {lecture.recording && lecture.status === 'completed' && (
        <div className="bg-gradient-to-br from-emerald-900/30 to-teal-900/30 backdrop-blur-sm rounded-3xl p-8 border border-emerald-900/30 shadow-xl overflow-hidden relative">
          <div className="absolute -right-24 -top-24 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl"></div>
          
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <Video className="h-6 w-6 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Lecture Recording</h2>
            </div>
            
            <p className="text-slate-300 mb-6">
              The recording for this completed lecture is now available. You can watch it anytime at your convenience.
            </p>
            
            <a
              href={lecture.recording}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all shadow-lg"
            >
              <Video className="h-5 w-5" />
              Watch Recording
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default LectureContent;