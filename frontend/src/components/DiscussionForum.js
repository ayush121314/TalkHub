import React, { useState, useEffect } from 'react';
import { MessageSquare, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import Comment from './Comment';

const DiscussionForum = ({ lectureId }) => {
  console.log("DiscussionForum rendered with lectureId:", lectureId);
  
  const { user, isAuthenticated } = useAuth();
  console.log("Auth state in DiscussionForum:", { user, isAuthenticated });
  
  // Direct check for token as fallback
  const hasToken = !!localStorage.getItem('token');
  console.log("JWT exists in localStorage:", hasToken);
  
  // Use either context auth or direct token check
  const isUserAuthenticated = isAuthenticated || hasToken;
  console.log("Final authentication state:", isUserAuthenticated);
  
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Validate lectureId
  const isValidId = lectureId && (
    // MongoDB ObjectId is 24 hex characters
    (typeof lectureId === 'string' && /^[0-9a-fA-F]{24}$/.test(lectureId)) ||
    // Or might be an auto-generated UUID
    (typeof lectureId === 'string' && lectureId.length > 8)
  );
  
  const fetchComments = async () => {
    if (!isValidId) {
      console.error("Invalid lecture ID format:", lectureId);
      setError("Invalid lecture ID format. Comments cannot be loaded.");
      setLoading(false);
      return;
    }
    
    console.log("Attempting to fetch comments for lectureId:", lectureId);
    try {
      setLoading(true);
      setError(null);
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';
      const response = await fetch(`${apiUrl}/api/comments/lecture/${lectureId}`);
      
      if (!response.ok) {
        console.error("Error response from API:", response.status, response.statusText);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Comments fetched successfully:", data);
      setComments(data.comments || []);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log("useEffect triggered with lectureId:", lectureId);
    if (isValidId) {
      fetchComments();
    } else {
      console.log("No valid lectureId provided, skipping fetch");
      setLoading(false);
      if (lectureId) {
        setError(`Invalid lecture ID format: ${lectureId}`);
      } else {
        setError('No lecture ID available');
      }
    }
  }, [lectureId, isValidId]);
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    if (!isValidId) {
      setError("Cannot post comments: Invalid lecture ID");
      return;
    }
    
    // Check if token is available
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';
      const response = await fetch(
        `${apiUrl}/api/comments/lecture/${lectureId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content: newComment })
        }
      );
      
      if (!response.ok) {
        // Check for authentication issues
        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Comment posted successfully:", data);
      setComments([data.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post your comment. Please try again.');
    }
  };
  
  const handleReply = async (parentCommentId, content) => {
    if (!isValidId) {
      setError("Cannot post reply: Invalid lecture ID");
      return;
    }
    
    // Check if token is available
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';
      const response = await fetch(
        `${apiUrl}/api/comments/lecture/${lectureId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            content,
            parentCommentId 
          })
        }
      );
      
      if (!response.ok) {
        // Check for authentication issues
        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Reply posted successfully:", data);
      
      // Update the parent comment's replies
      const updatedComments = comments.map(comment => {
        if (comment._id === parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), data.comment]
          };
        }
        return comment;
      });
      
      setComments(updatedComments);
    } catch (err) {
      console.error('Error posting reply:', err);
      setError('Failed to post your reply. Please try again.');
    }
  };
  
  const handleEditComment = async (commentId, content) => {
    // Check if token is available
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';
      const response = await fetch(
        `${apiUrl}/api/comments/${commentId}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ content })
        }
      );
      
      if (!response.ok) {
        // Check for authentication issues
        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Comment edited successfully:", data);
      
      // Update comments or replies based on the edited comment
      const updatedComments = comments.map(comment => {
        // If this is the comment that was edited
        if (comment._id === commentId) {
          return data.comment;
        }
        
        // Check if it's in replies
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = comment.replies.map(reply => 
            reply._id === commentId ? data.comment : reply
          );
          
          return {
            ...comment,
            replies: updatedReplies
          };
        }
        
        return comment;
      });
      
      setComments(updatedComments);
    } catch (err) {
      console.error('Error editing comment:', err);
      setError('Failed to edit your comment. Please try again.');
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }
    
    // Check if token is available
    const token = localStorage.getItem('token');
    if (!token) {
      setError("Authentication required. Please log in again.");
      return;
    }
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:4040';
      const response = await fetch(
        `${apiUrl}/api/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (!response.ok) {
        // Check for authentication issues
        if (response.status === 401) {
          setError("Your session has expired. Please log in again.");
          return;
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      console.log("Comment deleted successfully");
      
      // Handle deleting comments or replies
      const updatedComments = comments.filter(comment => comment._id !== commentId);
      
      // Also check if it's a reply in any comments
      const commentsWithUpdatedReplies = updatedComments.map(comment => {
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.filter(reply => reply._id !== commentId)
          };
        }
        return comment;
      });
      
      setComments(commentsWithUpdatedReplies);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete your comment. Please try again.');
    }
  };
  
  // If we're still loading and haven't encountered an error yet
  if (loading && !error) {
    return (
      <div className="discussion-forum-container bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 border border-blue-100 overflow-hidden relative mt-6 shadow-md">
        <div className="text-center py-8">
          <div className="inline-block w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-gray-500">Loading comments...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="discussion-forum-container bg-gradient-to-br from-white to-blue-50 rounded-3xl p-8 border border-blue-100 overflow-hidden relative mt-6 shadow-md">
      <div className="absolute -right-24 -top-24 w-64 h-64 bg-indigo-100 rounded-full blur-3xl"></div>
      <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-purple-100 rounded-full blur-3xl"></div>
      
      <div className="relative">
        <div className="flex items-center gap-3 mb-6">
          <MessageSquare className="h-6 w-6 text-indigo-500" />
          <h2 className="text-2xl font-bold text-gray-800">Discussion Forum</h2>
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p>{error}</p>
          </div>
        )}
        
        {/* New Comment Form - only show if no errors and valid ID */}
        {isUserAuthenticated && isValidId && !error ? (
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="flex items-start space-x-3">
              {/* User Avatar */}
              <div className="flex-shrink-0">
                {user && user.profilePic ? (
                  <img 
                    src={user.profilePic} 
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-blue-200"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200">
                    <Plus className="w-5 h-5 text-indigo-500" />
                  </div>
                )}
              </div>
              
              {/* Comment Input */}
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Share your thoughts or ask questions about this lecture..."
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 resize-none"
                  rows={3}
                  required
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          </form>
        ) : isUserAuthenticated && !isValidId && !error ? (
          <div className="bg-white rounded-xl p-4 text-center mb-8 border border-blue-200 shadow-sm">
            <p className="text-gray-600">
              Comments are temporarily unavailable for this lecture.
            </p>
          </div>
        ) : !isUserAuthenticated && !error ? (
          <div className="bg-white rounded-xl p-4 text-center mb-8 border border-blue-200 shadow-sm">
            <p className="text-gray-600">
              Please <a href="/login" className="text-indigo-600 hover:text-indigo-500">login</a> to participate in the discussion.
            </p>
          </div>
        ) : null}
        
        {/* Comments List */}
        <div className="comments-container">
          {!error && comments && comments.length > 0 ? (
            comments.map(comment => (
              <Comment
                key={comment._id}
                comment={comment}
                onReply={handleReply}
                onEdit={handleEditComment}
                onDelete={handleDeleteComment}
              />
            ))
          ) : !error ? (
            <div className="text-center py-8 border border-dashed border-blue-200 rounded-xl bg-white">
              <MessageSquare className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">No comments yet. Be the first to start the discussion!</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DiscussionForum; 