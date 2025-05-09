// Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import RequestClassForm from './RequestClassForm';
import LectureCard from './LectureCard';
import ProfileForm from './ProfileForm';
import SearchBar from './SearchBar';
import SearchResults from './SearchResults';
import useSearch from './useSearch';

const Dashboard = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    // Retrieve the active tab from localStorage or default to 'upcoming'
    return localStorage.getItem('activeTab') || 'upcoming';
  });
  const [upcomingLectures, setUpcomingLectures] = useState([]);
  const [pastLectures, setPastLectures] = useState([]);
  const [scheduledTalks, setScheduledTalks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Search state using custom hook
  const { 
    searchResults, 
    searchQuery, 
    loading: isSearching, 
    error: searchError, 
    searchLectures, 
    clearSearch 
  } = useSearch();

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';

  const handleProfileClick = () => {
    setActiveTab('profile'); // Change the active tab to "profile"
  };

  // Save active tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchLectureData();
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/users/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch profile');
        const profile = await response.json();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        showNotification('Error loading profile data');
      }
    };
    fetchUserProfile();
  }, []);


  const fetchLectureData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const [upcomingRes, pastRes, scheduledRes] = await Promise.all([
        fetch(`${apiUrl}/api/lectures/upcoming`, { headers }),
        fetch(`${apiUrl}/api/lectures/past`, { headers }),
        fetch(`${apiUrl}/api/lectures/scheduled`, { headers })
      ]);

      if (!upcomingRes.ok || !pastRes.ok || !scheduledRes.ok) {
        throw new Error('Failed to fetch lecture data');
      }

      const [upcoming, past, scheduled] = await Promise.all([
        upcomingRes.json(),
        pastRes.json(),
        scheduledRes.json()
      ]);

      setUpcomingLectures(upcoming);
      setPastLectures(past);
      setScheduledTalks(scheduled);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      showNotification('Error loading lecture data');
      setLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotificationMessage(message);
    setTimeout(() => setNotificationMessage(''), 3000);
  };

  const handleSearch = (query) => {
    searchLectures(query);
    // If we have a search query, switch to the search tab
    if (query.trim()) {
      setActiveTab('search');
    } else if (activeTab === 'search') {
      // If clearing search and we're on search tab, return to upcoming
      setActiveTab('upcoming');
    }
  };

  const handleLectureClick = (lectureId) => {
    navigate(`/lecture/${lectureId}`);
  };

  const TabButton = ({ icon, label, tab }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
      }}
      className={`w-full text-left p-4 flex items-center space-x-3 hover:bg-gray-50 rounded-lg transition-colors ${activeTab === tab ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span>{label}</span>
    </button>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 text-red-200 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Dashboard</h3>
          <p>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-white shadow-sm p-4 flex justify-between items-center z-40">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-gray-700 hover:text-blue-600 transition-colors"
        >
          ☰
        </button>
        <button
          onClick={() => setShowRequestForm(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-500 text-white rounded-lg hover:opacity-90 transition-colors shadow-sm"
        >
          ➕ Schedule Talk
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        {/* Profile Section */}
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex flex-col items-center space-y-4">
            {/* Clickable Profile Icon */}
            <div
              className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 cursor-pointer shadow-md"
              onClick={handleProfileClick}
            >
              {userProfile?.profile?.profilePic ? (
                <img
                  src={userProfile.profile.profilePic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-3xl">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>

            <div className="text-center">
              <h2 className="text-gray-800 font-semibold text-lg">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
              <p className="text-gray-500 text-sm mt-1">🎓 {user?.rollNumber}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 bg-gradient-to-b from-white to-blue-50">
          <TabButton icon="📅" label="Upcoming Talks" tab="upcoming" />
          <TabButton icon="⏰" label="Past Talks" tab="past" />
          <TabButton icon="👥" label="My Scheduled Talks" tab="scheduled" />
          <TabButton icon="👤" label="My Profile" tab="profile" />
          {searchQuery && <TabButton icon="🔍" label="Search Results" tab="search" />}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 bg-white">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-64 p-6 pt-24 md:pt-6">
        {/* Desktop Schedule Button and Search Bar */}
        <div className="hidden md:flex justify-between items-center mb-8">
          <button
            onClick={() => setShowRequestForm(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            ➕ Schedule New Talk
          </button>
          
          {/* Search Bar */}
          <SearchBar onSearch={handleSearch} className="w-1/2 max-w-lg" />
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mb-6">
          <SearchBar onSearch={handleSearch} className="w-full" />
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-6 shadow-md border border-blue-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Profile Information</h2>

            {/* Profile Image Section */}
            {userProfile?.profile?.profilePic ? (
              <div className="flex justify-center mb-6">
                <img
                  src={userProfile.profile.profilePic}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-md"
                />
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                <div className="w-32 h-32 flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-4xl font-bold text-white shadow-md">
                  {userProfile?.name?.charAt(0)?.toUpperCase()}
                </div>
              </div>
            )}

            {userProfile ? (
              <div className="space-y-4">
                {/* Bio */}
                {userProfile.profile?.speakerBio && userProfile.profile?.speakerBio!=="null" && userProfile.profile.speakerBio.trim() !== "" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-700">Bio</h3>
                    <p className="text-gray-700 mt-1">{userProfile.profile.speakerBio}</p>
                  </div>
                )}

                {/* Organization (Fix Added) */}
                {userProfile.profile?.organization && userProfile.profile?.organization!=="null" && userProfile.profile.organization.trim() !== "" && (
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-700">Organization</h3>
                    <p className="text-gray-700 mt-1">{userProfile.profile.organization}</p>
                  </div>
                )}

                {/* LinkedIn */}
                {userProfile.profile?.linkedinProfile && userProfile.profile?.linkedinProfile!=="null" && userProfile.profile.linkedinProfile.trim() !== "" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-700">LinkedIn</h3>
                    <a
                      href={userProfile.profile.linkedinProfile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center mt-1"
                    >
                      View Profile <span className="ml-1">→</span>
                    </a>
                  </div>
                )}

                {/* Personal Website */}
                {userProfile.profile?.personalWebsite && userProfile.profile?.personalWebsite!=="null" && userProfile.profile.personalWebsite.trim() !== "" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-700">Website</h3>
                    <a
                      href={userProfile.profile.personalWebsite}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center mt-1"
                    >
                      Visit Website <span className="ml-1">→</span>
                    </a>
                  </div>
                )}

                {userProfile.profile?.socialMediaHandle1 && userProfile.profile?.socialMediaHandle1!=="null" && userProfile.profile.socialMediaHandle1.trim() !== "" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-700">Social Media Handle (1)</h3>
                    <a
                      href={userProfile.profile.socialMediaHandle1}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center mt-1"
                    >
                      Visit <span className="ml-1">→</span>
                    </a>
                  </div>
                )}

                {userProfile.profile?.socialMediaHandle2 && userProfile.profile?.socialMediaHandle2!=="null" && userProfile.profile.socialMediaHandle2.trim() !== "" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-700">Social Media Handle (2)</h3>
                    <a
                      href={userProfile.profile.socialMediaHandle2}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline inline-flex items-center mt-1"
                    >
                      Visit <span className="ml-1">→</span>
                    </a>
                  </div>
                )}

                {/* Additional Info */}
                {userProfile.profile?.additionalInfo && userProfile.profile?.additionalInfo!=="null" && userProfile.profile.additionalInfo.trim() !== "" && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-700">Additional Information</h3>
                    <p className="text-gray-700 mt-1">{userProfile.profile.additionalInfo}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">No profile information available</p>
            )}

            <button
              onClick={() => setShowProfileForm(true)}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:opacity-90 transition-colors shadow-md"
            >
              Edit Profile
            </button>
          </div>
        )}

        {/* Search Results Tab */}
        {activeTab === 'search' && (
          <SearchResults
            results={searchResults}
            loading={isSearching}
            error={searchError}
            onClick={handleLectureClick}
            query={searchQuery}
          />
        )}

        {/* Lecture Grids */}
        {activeTab !== 'profile' && activeTab !== 'search' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Loading state for Upcoming lectures */}
            {activeTab === 'upcoming' && loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
                <p className="text-lg text-indigo-500">Loading upcoming lectures...</p>
              </div>
            )}

            {/* Display Upcoming Lectures */}
            {activeTab === 'upcoming' && !loading && upcomingLectures.map((lecture) => (
              <LectureCard 
                key={lecture.id} 
                lecture={lecture} 
                isPast={false} 
                onClick={handleLectureClick} 
                isUserRegistered={lecture.isRegistered || false}
              />
            ))}

            {/* Loading state for Past lectures */}
            {activeTab === 'past' && loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
                <p className="text-lg text-indigo-500">Loading past lectures...</p>
              </div>
            )}

            {/* Display Past Lectures */}
            {activeTab === 'past' && !loading && pastLectures.map((lecture) => (
              <LectureCard 
                key={lecture.id} 
                lecture={lecture} 
                isPast={true} 
                onClick={handleLectureClick}
                isUserRegistered={lecture.isRegistered || false} 
              />
            ))}

            {/* Loading state for Scheduled talks */}
            {activeTab === 'scheduled' && loading && (
              <div className="col-span-full flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-500 mb-4"></div>
                <p className="text-lg text-indigo-500">Loading your scheduled talks...</p>
              </div>
            )}

            {/* Display Scheduled Talks */}
            {activeTab === 'scheduled' && !loading && scheduledTalks.map((lecture) => (
              <LectureCard 
                key={lecture.id} 
                lecture={lecture} 
                isPast={false} 
                onClick={handleLectureClick}
                isUserRegistered={lecture.isRegistered || false} 
              />
            ))}

            {/* Empty States - Only show these when not loading */}
            {activeTab === 'upcoming' && !loading && upcomingLectures.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-blue-100 p-8">
                <div className="text-indigo-400 text-5xl mb-4">📅</div>
                <p className="text-gray-600 text-lg">No upcoming lectures scheduled</p>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm hover:opacity-90"
                >
                  Schedule a Talk
                </button>
              </div>
            )}
            {activeTab === 'past' && !loading && pastLectures.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-blue-100 p-8">
                <div className="text-indigo-400 text-5xl mb-4">⏰</div>
                <p className="text-gray-600 text-lg">No past lectures available</p>
              </div>
            )}
            {activeTab === 'scheduled' && !loading && scheduledTalks.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-xl shadow-sm border border-blue-100 p-8">
                <div className="text-indigo-400 text-5xl mb-4">👥</div>
                <p className="text-gray-600 text-lg">You haven't scheduled any talks yet</p>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm hover:opacity-90"
                >
                  Schedule a Talk
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="md:hidden fixed bottom-6 right-6">
        <button
          onClick={() => setShowRequestForm(true)}
          className="p-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full shadow-lg hover:opacity-90 transition-colors"
        >
          ➕
        </button>
      </div>

      {/* Notification Toast */}
      {notificationMessage && (
        <div className="fixed bottom-4 right-4 bg-white text-gray-800 px-6 py-3 rounded-xl shadow-lg animate-fade-in border border-green-200">
          {notificationMessage}
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <RequestClassForm
          onClose={() => setShowRequestForm(false)}
          onSubmit={(newTalk) => {
            setScheduledTalks(prev => [...prev, newTalk]);
            setShowRequestForm(false);
            showNotification('Talk request submitted successfully!');
          }}
        />
      )}
      {showProfileForm && (
        <ProfileForm
          onClose={() => setShowProfileForm(false)}
          user={userProfile}
          onUpdate={(updatedProfile) => {
            setUserProfile(updatedProfile);
            showNotification('Profile updated successfully!');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;
