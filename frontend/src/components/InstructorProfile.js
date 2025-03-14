import React from 'react';
import { 
  Linkedin, 
  Globe, 
  Twitter, 
  Instagram, 
  Mail, 
  UserCircle,
  MapPin,
  BookOpen
} from 'lucide-react';

const InstructorProfile = ({ instructor }) => {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 shadow-2xl border border-gray-700">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center gap-8 mb-8">
        {/* Profile Picture */}
        <div className="relative">
          {instructor?.profilePic ? (
            <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-4 border-purple-500/30 shadow-xl">
              <img 
                src={instructor.profilePic} 
                alt={instructor.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-4 border-purple-500/30 flex items-center justify-center">
              <UserCircle className="w-24 h-24 text-purple-400" />
            </div>
          )}
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-gray-900" />
        </div>

        {/* Basic Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-white mb-2">{instructor.name}</h2>
          <div className="flex flex-col gap-2">
            {instructor.title && (
              <p className="text-xl text-purple-300 font-medium">{instructor.title}</p>
            )}
            {instructor.organization && (
              <div className="flex items-center gap-2 text-gray-300 justify-center md:justify-start">
                <MapPin className="w-4 h-4" />
                <span>{instructor.organization}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bio Section */}
      {instructor.speakerBio && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-400" />
            About
          </h3>
          <p className="text-gray-300 leading-relaxed bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            {instructor.speakerBio}
          </p>
        </div>
      )}

      {/* Contact & Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instructor.linkedinProfile && (
          <a
            href={instructor.linkedinProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-blue-900/20 hover:bg-blue-900/30 rounded-xl text-blue-300 transition-colors border border-blue-900/50 group"
          >
            <Linkedin className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
            <span>LinkedIn Profile</span>
          </a>
        )}
        
        {instructor.personalWebsite && (
          <a
            href={instructor.personalWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-indigo-900/20 hover:bg-indigo-900/30 rounded-xl text-indigo-300 transition-colors border border-indigo-900/50 group"
          >
            <Globe className="w-5 h-5 group-hover:text-indigo-400 transition-colors" />
            <span>Personal Website</span>
          </a>
        )}
        
        {instructor.socialMediaHandle1 && (
          <a
            href={`https://twitter.com/${instructor.socialMediaHandle1}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-sky-900/20 hover:bg-sky-900/30 rounded-xl text-sky-300 transition-colors border border-sky-900/50 group"
          >
            <Twitter className="w-5 h-5 group-hover:text-sky-400 transition-colors" />
            <span>Twitter</span>
          </a>
        )}
        
        {instructor.socialMediaHandle2 && (
          <a
            href={`https://instagram.com/${instructor.socialMediaHandle2}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-pink-900/20 hover:bg-pink-900/30 rounded-xl text-pink-300 transition-colors border border-pink-900/50 group"
          >
            <Instagram className="w-5 h-5 group-hover:text-pink-400 transition-colors" />
            <span>Instagram</span>
          </a>
        )}

        {instructor.email && (
          <a
            href={`mailto:${instructor.email}`}
            className="flex items-center gap-3 px-4 py-3 bg-purple-900/20 hover:bg-purple-900/30 rounded-xl text-purple-300 transition-colors border border-purple-900/50 group md:col-span-2"
          >
            <Mail className="w-5 h-5 group-hover:text-purple-400 transition-colors" />
            <span>Contact via Email</span>
          </a>
        )}
      </div>

      {/* Additional Info */}
      {instructor.additionalInfo && (
        <div className="mt-8 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
          <p className="text-gray-400 text-sm italic leading-relaxed">
            {instructor.additionalInfo}
          </p>
        </div>
      )}
      <div></div>
    </div>
    
  );
};

export default InstructorProfile;