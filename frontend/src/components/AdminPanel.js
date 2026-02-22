// AdminPanel.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [talkRequests, setTalkRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionMessage, setRejectionMessage] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [currentRequestId, setCurrentRequestId] = useState(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';

  useEffect(() => {
    // Check if user is an admin
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${apiUrl}/api/admin/validate-session`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // If not authorized as admin, redirect to student dashboard
          navigate('/student');
          return;
        }

        // If admin validated, fetch dashboard stats
        fetchDashboardStats();
      } catch (error) {
        console.error('Error checking admin status:', error);
        showNotification('Error checking admin privileges');
        navigate('/student');
      }
    };

    checkAdminStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'talks') {
      fetchLectures();
    } else if (activeTab === 'requests') {
      fetchTalkRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      setDashboardStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
      setLoading(false);
    }
  };

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/lectures`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch lectures');
      }

      const data = await response.json();
      setLectures(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      setError('Failed to load lectures');
      setLoading(false);
    }
  };

  const fetchTalkRequests = async (statusFilter) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let url = `${apiUrl}/api/admin/talk-requests`;

      // Add status filter if provided
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch talk requests');
      }

      const data = await response.json();

      // Filter requests based on status and limit

      // Always show all pending requests
      const pendingRequests = data.filter(req => req.status === 'pending');

      // For non-pending requests, only show the latest 10
      const nonPendingRequests = data
        .filter(req => req.status !== 'pending')
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 10);

      // If we're filtering by a specific status other than pending, use that filter
      if (statusFilter && statusFilter !== 'pending') {
        setTalkRequests(nonPendingRequests.filter(req => req.status === statusFilter));
      } else if (statusFilter === 'pending') {
        setTalkRequests(pendingRequests);
      } else {
        // Otherwise combine pending with latest 10 non-pending
        setTalkRequests([...pendingRequests, ...nonPendingRequests]);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching talk requests:', error);
      setError('Failed to load talk requests');
      setLoading(false);
    }
  };

  const approveTalkRequest = async (requestId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/talk-requests/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId,
          message: 'Your talk request has been approved.'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to approve talk request');
      }

      // Refresh talk requests after approval
      await fetchTalkRequests();
      // Refresh dashboard stats to update counts
      await fetchDashboardStats();

      showNotification('Talk request approved successfully');
    } catch (error) {
      console.error('Error approving talk request:', error);
      showNotification('Failed to approve talk request');
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectionModal = (requestId) => {
    setCurrentRequestId(requestId);
    setRejectionMessage('');
    setShowRejectionModal(true);
  };

  const closeRejectionModal = () => {
    setShowRejectionModal(false);
    setCurrentRequestId(null);
    setRejectionMessage('');
  };

  const rejectTalkRequest = async () => {
    if (!rejectionMessage.trim()) {
      showNotification('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/talk-requests/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          requestId: currentRequestId,
          message: rejectionMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to reject talk request');
      }

      // Refresh talk requests after rejection
      await fetchTalkRequests();
      // Refresh dashboard stats to update counts
      await fetchDashboardStats();

      showNotification('Talk request rejected');
      closeRejectionModal();
    } catch (error) {
      console.error('Error rejecting talk request:', error);
      showNotification('Failed to reject talk request');
    } finally {
      setActionLoading(false);
    }
  };

  // eslint-disable-next-line no-unused-vars
  const updateLectureStatus = async (lectureId, status, message = '') => {
    // Ask for confirmation if cancelling a talk
    if (status === 'cancelled') {
      if (!window.confirm('Are you sure you want to cancel this talk? This action cannot be undone.')) {
        return;
      }
      message = 'This talk has been cancelled by an administrator.';
    }

    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/api/admin/lectures/update-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ lectureId, status, message })
      });

      if (!response.ok) {
        throw new Error('Failed to update lecture status');
      }

      // Refresh lectures after update
      fetchLectures();
      // Also refresh dashboard stats to reflect the changes
      fetchDashboardStats();
      showNotification(`Lecture ${status} successfully`);
    } catch (error) {
      console.error('Error updating lecture status:', error);
      showNotification('Failed to update lecture status');
    } finally {
      setActionLoading(false);
    }
  };

  const showNotification = (message) => {
    setNotificationMessage(message);
    setTimeout(() => setNotificationMessage(''), 3000);
  };

  const TabButton = ({ icon, label, tab }) => (
    <button
      onClick={() => {
        setActiveTab(tab);
        setIsSidebarOpen(false);
      }}
      className={`w-full text-left p-4 flex items-center space-x-3 hover:bg-gray-700 rounded-lg transition-colors ${activeTab === tab ? 'bg-gray-700' : ''
        }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-gray-300">{label}</span>
    </button>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-red-900/50 text-red-200 p-6 rounded-xl max-w-md text-center">
          <h3 className="text-xl font-bold mb-2">Error Loading Admin Panel</h3>
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
    <div className="min-h-screen bg-gray-900">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-gray-800 p-4 flex justify-between items-center z-40">
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="text-white hover:text-purple-400 transition-colors"
        >
          ☰
        </button>
        <h1 className="text-white text-lg font-semibold">Admin Panel</h1>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out z-50 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        {/* Admin Profile Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-r from-red-500 to-orange-500">
              <span className="text-white text-3xl">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>

            <div className="text-center">
              <h2 className="text-white font-semibold text-lg">{user?.name || 'Admin'}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <p className="text-gray-400 text-sm mt-1">👑 Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          <TabButton icon="📊" label="Dashboard" tab="dashboard" />
          <TabButton icon="👥" label="Manage Users" tab="users" />
          <TabButton icon="🗣️" label="Manage Talks" tab="talks" />
          <TabButton
            icon="🔔"
            label={
              <>
                Talk Requests
                {dashboardStats && dashboardStats.stats?.lectures?.pending > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-yellow-500 text-black text-xs rounded-full font-bold">
                    {dashboardStats.stats.lectures.pending}
                  </span>
                )}
              </>
            }
            tab="requests"
          />
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/30 text-red-400 rounded-lg hover:bg-red-600/40 transition-colors"
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
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="md:ml-64 p-6 pt-24 md:pt-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-400">Manage your application</p>
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-500"></div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && !loading && dashboardStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Total Users</h3>
              <div className="flex items-center">
                <span className="text-4xl font-bold text-purple-400">
                  {dashboardStats.stats.users.total}
                </span>
              </div>
              <p className="text-gray-400 mt-2">
                {dashboardStats.stats.users.students} students, {dashboardStats.stats.users.professors} professors
              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Active Talks</h3>
              <div className="flex items-center">
                <span className="text-4xl font-bold text-blue-400">
                  {dashboardStats.stats.lectures.active}
                </span>
              </div>
              <p className="text-gray-400 mt-2">Out of {dashboardStats.stats.lectures.total} total talks</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-lg font-semibold text-white mb-4">Talk Requests</h3>
              <div className="flex items-center">
                <span className="text-4xl font-bold text-orange-400">
                  {dashboardStats.stats.lectures.pending}
                </span>
                <span className="ml-2 text-gray-400">pending approval</span>
              </div>
              {dashboardStats.stats.lectures.pending > 0 && (
                <button
                  onClick={() => setActiveTab('requests')}
                  className="mt-2 text-sm text-orange-300 hover:text-orange-200 underline"
                >
                  Review pending requests
                </button>
              )}
            </div>

            {/* Recent Activity */}
            <div className="bg-gray-800 p-6 rounded-xl col-span-full">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>

              {dashboardStats.recentActivity.lectures.length === 0 &&
                dashboardStats.recentActivity.users.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  No recent activity to display
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recent Lectures */}
                  {dashboardStats.recentActivity.lectures.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-300 mb-2">Recent Lectures</h4>
                      <div className="space-y-2">
                        {dashboardStats.recentActivity.lectures.map(lecture => (
                          <div key={lecture._id} className="bg-gray-700 p-3 rounded-lg flex justify-between">
                            <div>
                              <h5 className="text-white font-medium">{lecture.title}</h5>
                              <p className="text-sm text-gray-400">
                                By {lecture.instructor?.name || 'Unknown'}
                              </p>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded text-xs ${lecture.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                                lecture.status === 'scheduled' || lecture.status === 'approved' ?
                                  new Date(lecture.date) < new Date() ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400' :
                                  'bg-red-900/50 text-red-400'
                                }`}>
                                {lecture.status === 'scheduled' && new Date(lecture.date) < new Date() ? 'completed' : lecture.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Talk Requests */}
                  {dashboardStats.recentActivity.requests && dashboardStats.recentActivity.requests.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-300 mb-2">Recent Talk Requests</h4>
                      <div className="space-y-2">
                        {dashboardStats.recentActivity.requests.map(request => (
                          <div key={request._id} className="bg-gray-700 p-3 rounded-lg flex justify-between">
                            <div>
                              <h5 className="text-white font-medium">{request.title}</h5>
                              <p className="text-sm text-gray-400">
                                By {request.requestedBy?.name || 'Unknown'}
                              </p>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded text-xs ${request.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                                request.status === 'approved' ? 'bg-green-900/50 text-green-400' :
                                  'bg-red-900/50 text-red-400'
                                }`}>
                                {request.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Users */}
                  {dashboardStats.recentActivity.users.length > 0 && (
                    <div>
                      <h4 className="text-md font-medium text-gray-300 mb-2">Recent Users</h4>
                      <div className="space-y-2">
                        {dashboardStats.recentActivity.users.map(user => (
                          <div key={user._id} className="bg-gray-700 p-3 rounded-lg flex justify-between">
                            <div>
                              <h5 className="text-white font-medium">{user.name}</h5>
                              <p className="text-sm text-gray-400">{user.email}</p>
                            </div>
                            <div>
                              <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-900/50 text-purple-400' :
                                user.role === 'professor' ? 'bg-blue-900/50 text-blue-400' :
                                  'bg-green-900/50 text-green-400'
                                }`}>
                                {user.role}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && !loading && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Manage Users</h3>

            {users.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No users found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700 text-gray-300">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3 rounded-tr-lg">Joined Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {users.map(user => (
                      <tr key={user._id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-white">{user.name}</td>
                        <td className="px-4 py-3 text-white">{user.email}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${user.role === 'admin' ? 'bg-purple-900/50 text-purple-400' :
                            user.role === 'professor' ? 'bg-blue-900/50 text-blue-400' :
                              'bg-green-900/50 text-green-400'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Talks Tab */}
        {activeTab === 'talks' && !loading && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Manage Talks</h3>

            {lectures.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No lectures found
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-700 text-gray-300">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Title</th>
                      <th className="px-4 py-3">Instructor</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 rounded-tr-lg">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {lectures.map(lecture => (
                      <tr key={lecture._id} className="hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-white">{lecture.title}</td>
                        <td className="px-4 py-3 text-white">
                          {lecture.instructor?.name || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-white">
                          {new Date(lecture.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs ${lecture.status === 'pending' ? 'bg-yellow-900/50 text-yellow-400' :
                            lecture.status === 'scheduled' || lecture.status === 'approved' ?
                              new Date(lecture.date) < new Date() ? 'bg-blue-900/50 text-blue-400' : 'bg-green-900/50 text-green-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                            {lecture.status === 'scheduled' && new Date(lecture.date) < new Date() ? 'completed' : lecture.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Talk Requests Tab */}
        {activeTab === 'requests' && !loading && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Manage Talk Requests</h3>
              <div className="flex items-center">
                <span className="text-sm text-gray-400 mr-2">Filter:</span>
                <button
                  onClick={() => fetchTalkRequests()}
                  className="px-3 py-1 text-sm bg-gray-700 text-white rounded-l-md hover:bg-gray-600"
                >
                  All
                </button>
                <button
                  onClick={() => fetchTalkRequests('pending')}
                  className="px-3 py-1 text-sm bg-yellow-700/50 text-yellow-300 hover:bg-yellow-700"
                >
                  Pending
                </button>
                <button
                  onClick={() => fetchTalkRequests('approved')}
                  className="px-3 py-1 text-sm bg-green-700/50 text-green-300 hover:bg-green-700"
                >
                  Approved
                </button>
                <button
                  onClick={() => fetchTalkRequests('rejected')}
                  className="px-3 py-1 text-sm bg-red-700/50 text-red-300 rounded-r-md hover:bg-red-700"
                >
                  Rejected
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-400 mb-4">
              Showing all pending requests and the latest 10 approved/rejected requests.
            </p>

            {talkRequests.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No talk requests found
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {talkRequests.map(request => (
                  <div key={request._id} className={`bg-gray-700 rounded-xl overflow-hidden border ${request.status === 'pending' ? 'border-yellow-700' :
                    request.status === 'approved' ? 'border-green-700' :
                      'border-red-700'
                    }`}>
                    {/* Request header */}
                    <div className={`p-4 ${request.status === 'pending' ? 'bg-yellow-900/20' :
                      request.status === 'approved' ? 'bg-green-900/20' :
                        'bg-red-900/20'
                      }`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-white text-xl font-bold">{request.title}</h3>
                          <p className="text-gray-300 text-sm">
                            By {request.requestedBy?.name || 'Unknown'} ({request.requestedBy?.email})
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${request.status === 'pending' ? 'bg-yellow-700/50 text-yellow-300' :
                          request.status === 'approved' ? 'bg-green-700/50 text-green-300' :
                            'bg-red-700/50 text-red-300'
                          }`}>
                          {request.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Request body */}
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <span className="text-gray-400 text-xs block">Date</span>
                          <span className="text-white">
                            {new Date(request.date).toLocaleDateString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block">Time</span>
                          <span className="text-white">{request.time}</span>
                        </div>
                        <div>
                          <span className="text-gray-400 text-xs block">Mode</span>
                          <span className="text-white">{request.mode}</span>
                        </div>
                      </div>

                      <div className="mb-4">
                        <span className="text-gray-400 text-xs block mb-1">Description</span>
                        <p className="text-white text-sm">{request.description}</p>
                      </div>

                      {request.tags && request.tags.length > 0 && (
                        <div className="mb-4">
                          <span className="text-gray-400 text-xs block mb-1">Tags</span>
                          <div className="flex flex-wrap gap-2">
                            {request.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded-full"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Admin actions for pending requests */}
                      {request.status === 'pending' && (
                        <div className="flex justify-end space-x-3 mt-4">
                          <button
                            onClick={() => openRejectionModal(request._id)}
                            className="px-4 py-2 bg-red-600/30 text-red-300 rounded-lg hover:bg-red-600/50 transition-colors"
                            disabled={actionLoading}
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => approveTalkRequest(request._id)}
                            className="px-4 py-2 bg-green-600/30 text-green-300 rounded-lg hover:bg-green-600/50 transition-colors"
                            disabled={actionLoading}
                          >
                            {actionLoading ? 'Processing...' : 'Approve'}
                          </button>
                        </div>
                      )}

                      {/* Admin message for rejected requests */}
                      {request.status === 'rejected' && request.adminMessage && (
                        <div className="mt-4 p-3 bg-red-900/30 border border-red-900 rounded-lg">
                          <span className="text-red-400 text-xs block mb-1">Rejection Reason</span>
                          <p className="text-red-200 text-sm">{request.adminMessage}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-gray-800 p-6 rounded-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Manage Notifications</h3>
            <div className="text-center py-8 text-gray-400">
              Notification management functionality will be implemented here
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notificationMessage && (
        <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg animate-fade-in">
          {notificationMessage}
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Reject Talk Request</h3>
            <p className="text-gray-300 mb-4">Please provide a reason for rejecting this talk request:</p>

            <textarea
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white mb-4 min-h-24"
              placeholder="Enter rejection reason..."
              required
            />

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeRejectionModal}
                className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={rejectTalkRequest}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={actionLoading || !rejectionMessage.trim()}
              >
                {actionLoading ? 'Processing...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel; 