import React from 'react';
import { 
  Linkedin, 
  Globe, 
  Mail, 
  UserCircle,
  MapPin,
  BookOpen,
  Award,
  ExternalLink,
  Instagram,
  Twitter
} from 'lucide-react';

const InstructorProfile = ({ instructor, isModal = false }) => {
  const getSocialIcon = (url) => {
    if (!url) return <ExternalLink />;
    if (url.includes('twitter') || url.includes('x.com')) return <Twitter />;
    if (url.includes('instagram')) return <Instagram />;
    return <ExternalLink />;
  };

  return (
    <div className={`${isModal ? '' : 'bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-md border border-blue-100'}`}>
      <div className="p-6 md:p-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
          {/* Profile Picture */}
          <div className="relative">
            {instructor?.profilePic ? (
              <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-blue-200 shadow-xl">
                <img 
                  src={instructor.profilePic} 
                  alt={instructor.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-40 h-40 md:w-48 md:h-48 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 border-4 border-blue-200 flex items-center justify-center shadow-xl">
                <UserCircle className="w-24 h-24 text-blue-400" />
              </div>
            )}
            <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-white" />
          </div>

          {/* Basic Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">{instructor.name}</h2>
            <div className="flex flex-col gap-2">
              {instructor.title && (
                <div className="inline-flex items-center gap-2 text-xl text-indigo-600 font-medium">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>{instructor.title}</span>
                </div>
              )}
              {instructor.organization && instructor.organization !== 'null' && (
                <div className="flex items-center gap-2 text-gray-600 justify-center md:justify-start">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{instructor.organization}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {instructor.speakerBio && instructor.speakerBio !== 'null' && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              About
            </h3>
            <div className="prose max-w-none bg-white rounded-xl p-6 border border-blue-100 shadow-sm">
              <p className="text-gray-600">{instructor.speakerBio}</p>
            </div>
          </div>
        )}

        {/* Contact & Social Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {instructor.linkedinProfile && instructor.linkedinProfile !== 'null' && (
            <a
              href={instructor.linkedinProfile}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-4 bg-blue-50 hover:bg-blue-100 rounded-xl text-blue-600 border border-blue-200 group transition-all"
            >
              <div className="bg-blue-100 rounded-lg p-2">
                <Linkedin className="w-5 h-5 group-hover:text-blue-700 transition-colors" />
              </div>
              <div>
                <div className="text-sm text-blue-500">LinkedIn</div>
                <div className="font-medium">View Profile</div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
            </a>
          )}
          
          {instructor.personalWebsite && instructor.personalWebsite !== 'null' && (
            <a
              href={instructor.personalWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl text-indigo-600 border border-indigo-200 group transition-all"
            >
              <div className="bg-indigo-100 rounded-lg p-2">
                <Globe className="w-5 h-5 group-hover:text-indigo-700 transition-colors" />
              </div>
              <div>
                <div className="text-sm text-indigo-500">Website</div>
                <div className="font-medium">Visit Website</div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
            </a>
          )}
          
          {instructor.socialMediaHandle1 && instructor.socialMediaHandle1 !== 'null' && (
            <a
              href={instructor.socialMediaHandle1}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-4 bg-sky-50 hover:bg-sky-100 rounded-xl text-sky-600 border border-sky-200 group transition-all"
            >
              <div className="bg-sky-100 rounded-lg p-2">
                {getSocialIcon(instructor.socialMediaHandle1)}
              </div>
              <div>
                <div className="text-sm text-sky-500">Social Media</div>
                <div className="font-medium">Follow</div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
            </a>
          )}
          
          {instructor.socialMediaHandle2 && instructor.socialMediaHandle2 !== 'null' && (
            <a
              href={instructor.socialMediaHandle2}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-5 py-4 bg-rose-50 hover:bg-rose-100 rounded-xl text-rose-600 border border-rose-200 group transition-all"
            >
              <div className="bg-rose-100 rounded-lg p-2">
                {getSocialIcon(instructor.socialMediaHandle2)}
              </div>
              <div>
                <div className="text-sm text-rose-500">Social Media</div>
                <div className="font-medium">Follow</div>
              </div>
              <ExternalLink className="w-4 h-4 ml-auto opacity-70" />
            </a>
          )}

          {instructor.email && (
            <a
              href={`mailto:${instructor.email}`}
              className="flex items-center gap-3 px-5 py-4 bg-violet-50 hover:bg-violet-100 rounded-xl text-violet-600 border border-violet-200 group transition-all md:col-span-2"
            >
              <div className="bg-violet-100 rounded-lg p-2">
                <Mail className="w-5 h-5 group-hover:text-violet-700 transition-colors" />
              </div>
              <div>
                <div className="text-sm text-violet-500">Email</div>
                <div className="font-medium">{instructor.email}</div>
              </div>
            </a>
          )}
        </div>

        {/* Additional Info */}
        {instructor.additionalInfo && instructor.additionalInfo !== 'null' && (
          <div className="mt-10 p-6 bg-white rounded-xl border border-blue-100 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Additional Information</h3>
            <p className="text-gray-600 leading-relaxed">
              {instructor.additionalInfo}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorProfile;