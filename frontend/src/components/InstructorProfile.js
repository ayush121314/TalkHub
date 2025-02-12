import React from 'react';
export const LinkedIn = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7"></path>
      <rect x="2" y="9" width="4" height="12"></rect>
      <circle cx="4" cy="4" r="2"></circle>
      <path d="M8 16v-7h4v7"></path>
    </svg>
  );
  
  export const Globe = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M2 12h20"></path>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"></path>
    </svg>
  );
  
  export const Twitter = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4.01c-.75.35-1.56.58-2.41.69a4.16 4.16 0 0 0 1.83-2.29c-.79.47-1.66.82-2.59 1a4.12 4.12 0 0 0-7 3.75A11.68 11.68 0 0 1 3 3.92a4.12 4.12 0 0 0 1.27 5.5A4.07 4.07 0 0 1 2 8.85v.05a4.12 4.12 0 0 0 3.3 4 4.1 4.1 0 0 1-1.86.07 4.12 4.12 0 0 0 3.85 2.87A8.25 8.25 0 0 1 2 18.57a11.62 11.62 0 0 0 6.29 1.83c7.55 0 11.69-6.26 11.69-11.69v-.53a8.32 8.32 0 0 0 2.03-2.11"></path>
    </svg>
  );
  
  export const Instagram = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
      <path d="M16 11.37a4 4 0 1 1-4.63-4.63 4 4 0 0 1 4.63 4.63z"></path>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
  );
  
  export const Mail = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" ry="2"></rect>
      <path d="M22 6l-10 7L2 6"></path>
    </svg>
  );
  
  export const UserCircle = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <path d="M12 16a4 4 0 0 1-4-4 4 4 0 0 1 8 0 4 4 0 0 1-4 4z"></path>
      <path d="M6 20a6 6 0 0 1 12 0"></path>
    </svg>
  );
  
const InstructorProfile = ({ instructor }) => {
  
  return (
  
    <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-2xl p-8 shadow-2xl">
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span className="text-xl">👨‍🏫</span>
        Meet Your Instructor
      </h3>
      
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
        <div className="relative">
          {instructor?.profilePic ? (
            <img 
              src={instructor.profilePic} 
              alt={instructor.name}
              className="w-32 h-32 rounded-full object-cover border-4 border-indigo-400 shadow-lg"
            />
          ) : (
            <UserCircle className="w-32 h-32 text-indigo-400" />
          )}
          <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-indigo-900" />
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-2xl font-bold text-white mb-2">{instructor?.name}</h4>
          {instructor?.title && (
            <p className="text-indigo-200 text-lg mb-3">{instructor.title}</p>
          )}
          {instructor?.organization && (
            <p className="text-indigo-300 mb-3">{instructor.organization}</p>
          )}
        </div>
      </div>

      {/* Bio Section */}
      {instructor?.speakerBio && (
        <div className="mb-8 bg-indigo-900/30 rounded-xl p-6">
          <h5 className="text-lg font-semibold text-indigo-200 mb-3">About</h5>
          <p className="text-gray-200 leading-relaxed">{instructor.speakerBio}</p>
        </div>
      )}

      {/* Social Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {instructor?.linkedinProfile && (
          <a
            href={instructor.linkedinProfile}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-indigo-800/50 hover:bg-indigo-700/50 rounded-lg text-indigo-200 transition-colors"
          >
            <LinkedIn className="w-5 h-5" />
            <span>LinkedIn Profile</span>
          </a>
        )}
        
        {instructor?.personalWebsite && (
          <a
            href={instructor.personalWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-indigo-800/50 hover:bg-indigo-700/50 rounded-lg text-indigo-200 transition-colors"
          >
            <Globe className="w-5 h-5" />
            <span>Personal Website</span>
          </a>
        )}
        
        {instructor?.socialMediaHandle1 && (
          <a
            href={`https://twitter.com/${instructor.socialMediaHandle1}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-indigo-800/50 hover:bg-indigo-700/50 rounded-lg text-indigo-200 transition-colors"
          >
            <Twitter className="w-5 h-5" />
            <span>Twitter</span>
          </a>
        )}
        
        {instructor?.socialMediaHandle2 && (
          <a
            href={`https://instagram.com/${instructor.socialMediaHandle2}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 bg-indigo-800/50 hover:bg-indigo-700/50 rounded-lg text-indigo-200 transition-colors"
          >
            <Instagram className="w-5 h-5" />
            <span>Instagram</span>
          </a>
        )}

        {instructor?.email && (
          <a
            href={`mailto:${instructor.email}`}
            className="flex items-center gap-3 px-4 py-3 bg-indigo-800/50 hover:bg-indigo-700/50 rounded-lg text-indigo-200 transition-colors md:col-span-2"
          >
            <Mail className="w-5 h-5" />
            <span>Contact via Email</span>
          </a>
        )}
      </div>

      {/* Additional Info */}
      {instructor?.additionalInfo && (
        <div className="mt-8 p-4 bg-indigo-800/30 rounded-lg">
          <p className="text-indigo-200 text-sm italic">{instructor.additionalInfo}</p>
        </div>
      )}
    </div>
  );
};

export default InstructorProfile;