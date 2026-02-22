import React, { useState } from 'react';
import { MessageCircle, Edit2, Trash2, CornerDownRight, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from './AuthContext';

const Comment = ({
  comment,
  onReply,
  onEdit,
  onDelete,
  isReply = false
}) => {
  // Call all hooks at the top level, before any conditional returns
  const { user } = useAuth();
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment?.content || '');
  const [showReplies, setShowReplies] = useState(true);

  // Safety check after hooks
  if (!comment || !comment.user) {
    console.error("Invalid comment data received:", comment);
    return null;
  }

  const isAuthor = user && user.userId === comment.user._id;

  const handleReplySubmit = (e) => {
    e.preventDefault();
    onReply(comment._id, replyContent);
    setReplyContent('');
    setIsReplying(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(comment._id, editContent);
    setIsEditing(false);
  };

  const toggleReplies = () => {
    setShowReplies(!showReplies);
  };

  // Safe access to creation date
  const creationDate = comment.createdAt ? new Date(comment.createdAt) : new Date();

  return (
    <div className={`comment-container ${isReply ? 'ml-8 mt-3' : 'mt-6'}`}>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-blue-100">
        {/* Comment Header */}
        <div className="flex items-start space-x-3">
          {/* User Avatar */}
          <div className="flex-shrink-0">
            {comment.user.profile?.profilePic ? (
              <img
                src={comment.user.profile.profilePic}
                alt={comment.user.name || 'User'}
                className="w-10 h-10 rounded-full object-cover border border-blue-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center border border-blue-200">
                <User className="w-5 h-5 text-indigo-500" />
              </div>
            )}
          </div>

          {/* Comment Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-gray-800 truncate">
                {comment.user.name || 'Anonymous User'}
              </h4>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(creationDate, { addSuffix: true })}
              </p>
            </div>

            {/* Comment Content */}
            {isEditing ? (
              <form onSubmit={handleEditSubmit} className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 resize-none"
                  rows={3}
                  required
                />
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setEditContent(comment.content || '');
                    }}
                    className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save
                  </button>
                </div>
              </form>
            ) : (
              <div className="mt-1 text-sm text-gray-700 whitespace-pre-wrap break-words">
                {comment.content || ''}
              </div>
            )}
          </div>
        </div>

        {/* Comment Actions */}
        {!isEditing && (
          <div className="mt-3 flex items-center space-x-4">
            {!isReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="flex items-center text-xs text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 mr-1" />
                Reply
              </button>
            )}

            {isAuthor && (
              <>
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditContent(comment.content || '');
                  }}
                  className="flex items-center text-xs text-gray-500 hover:text-amber-600 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </button>

                <button
                  onClick={() => onDelete(comment._id)}
                  className="flex items-center text-xs text-gray-500 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Delete
                </button>
              </>
            )}

            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={toggleReplies}
                className="flex items-center text-xs text-gray-500 hover:text-indigo-600 transition-colors ml-auto"
              >
                <CornerDownRight className="w-3.5 h-3.5 mr-1" />
                {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>
        )}

        {/* Reply Form */}
        {isReplying && (
          <form onSubmit={handleReplySubmit} className="mt-3">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply.."
              className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-gray-700 resize-none"
              rows={2}
              required
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                type="button"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent('');
                }}
                className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 text-xs bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Reply
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Replies */}
      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="replies-container pl-4 border-l border-blue-200 mt-2 ml-5">
          {comment.replies.map(reply => (
            <Comment
              key={reply._id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment; 