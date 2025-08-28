import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, ArrowLeftIcon, TrashIcon, UserIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import EditPostModal from './EditPostModal';
import Navbar from './Navbar';
import { getAbsoluteImageUrl } from '../config/api';
import '../App.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();


  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // Check if current user is the post owner
  const isOwner = user && post && (user.username === post.author || user.username === post.username);

  useEffect(() => {
    // Test API connection first
    testApiConnection();
    
    fetchPost();
    fetchComments();
    if (isAuthenticated) {
      fetchLikeStatus();
    }
  }, [id, isAuthenticated]);

  const testApiConnection = async () => {
    try {
      await api.get('posts/');
    } catch (error) {
      console.error('API connection test failed:', error);
    }
  };

  const fetchPost = async () => {
    try {
      const response = await api.get(`posts/${id}/`);
      setPost(response.data);
      setLikesCount(response.data.likes_count || 0);
    } catch (error) {
      console.error('Error fetching post:', error);
      setError('Failed to load post');
    }
  };

  const fetchComments = async () => {
    try {
      const response = await api.get(`comments/?post_id=${id}`);
      
      // Handle paginated response
      let commentsData = [];
      if (response.data && response.data.results) {
        // Paginated response
        commentsData = response.data.results;
      } else if (Array.isArray(response.data)) {
        // Direct array response
        commentsData = response.data;
      } else {
        // Fallback to empty array
        commentsData = [];
      }
      
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      // Set empty array on error
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeStatus = async () => {
    try {
      const response = await api.get(`posts/${id}/user_like_status/`);
      setIsLiked(response.data.is_liked);
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      return;
    }

    try {
      const response = await api.post(`posts/${id}/like/`);
      setIsLiked(response.data.is_liked);
      setLikesCount(response.data.likes_count);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    // Guard against accidental comment submission when replying
    if (replyTo) {
      return;
    }
    
    if (!isAuthenticated) {
      return;
    }
    
    if (!newComment.trim()) {
      return;
    }

    try {
      const response = await api.post('comments/', {
        content: newComment,
        post: id
      });
      
      // Add new comment to the end of the list (since we now show oldest first)
      const newComments = [...(Array.isArray(comments) ? comments : []), response.data];
      setComments(newComments);
      setNewComment('');
      
      // Update post comments count
      setPost(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }));
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling
    
    if (!isAuthenticated) {
      return;
    }
    
    if (!replyTo) {
      return;
    }
    
    if (!replyContent.trim()) {
      return;
    }

    try {
      const response = await api.post(`comments/${replyTo.id}/reply/`, {
        content: replyContent
      });
      
      // Update the comments state to include the new reply
      setComments(prevComments => {
        const updatedComments = prevComments.map(comment => {
          if (comment.id === replyTo.id) {
            return {
              ...comment,
              replies: [...(comment.replies || []), response.data]
            };
          }
          return comment;
        });
        return updatedComments;
      });
      
      setReplyTo(null);
      setReplyContent('');
      
      // Update post comments count
      setPost(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }));
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleDeleteComment = async (commentId, isReply = false) => {
    try {
      await api.delete(`comments/${commentId}/`);
      
      if (isReply) {
        // Delete reply - update the specific comment's replies
        setComments(prevComments => {
          return prevComments.map(comment => {
            if (comment.replies && comment.replies.length > 0) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== commentId)
              };
            }
            return comment;
          });
        });
      } else {
        // Delete comment - remove it from the comments list
        setComments(prevComments => {
          return prevComments.filter(comment => comment.id !== commentId);
        });
      }
      
      // Update post comments count
      setPost(prev => ({
        ...prev,
        comments_count: Math.max(0, (prev.comments_count || 0) - 1)
      }));
      
      // Clear delete confirmation
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting comment/reply:', error);
      alert('Failed to delete comment. Please try again.');
    }
  };

  const canDeleteComment = (comment) => {
    if (!isAuthenticated || !user) return false;

    // Comment author can delete their own comment
    if (comment.author.id === user.id) return true;

    // Post author can delete any comment on their post
    if (post && post.author === user.id) return true;

    return false;
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await api.delete(`posts/${post.id}/`);
      if (response.status === 204 || response.status === 200) {
        alert("Post deleted successfully!");
        navigate('/'); // Navigate back to home page
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert(error.response?.data?.detail || "Error deleting post");
    }
  };

  const handlePostUpdated = () => {
    // Refresh the post data after edit
    fetchPost();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="loading">Loading post...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!post) return <div className="error">Post not found</div>;

  return (
    <>
      <div style={{ position: 'relative', zIndex: 1000 }}>
        <Navbar />
      </div>

      <style>
        {`
          nav {
            position: relative !important;
            z-index: 1000 !important;
            display: block !important;
            visibility: visible !important;
          }
          body {
            background: ${theme.colors.background} !important;
            background-image: none !important;
          }
          html {
            background: ${theme.colors.background} !important;
          }
          #root {
            background: ${theme.colors.background} !important;
          }
          .post-detail-container {
            background: ${theme.colors.background} !important;
            background-image: none !important;
            background-attachment: initial !important;
            position: relative;
            z-index: 1;
            margin-top: 0 !important;
            padding-top: 20px;
          }
          .post-detail-container::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: ${theme.colors.background} !important;
            z-index: -10;
          }
          .post-detail {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
          }
          .comments-section {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
          }
          .comments-section h3 {
            color: ${theme.colors.text} !important;
          }
          .comment {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
          }
          .comment-main {
            background: ${theme.colors.surface} !important;
          }
          .comment-body {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
          }
          .comment-content p {
            color: ${theme.colors.text} !important;
          }
          .reply {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
          }
          .reply-main {
            background: ${theme.colors.surface} !important;
          }
          .reply .comment-body {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
          }
          .reply .comment-content p {
            color: ${theme.colors.text} !important;
          }
          .comment-form-container {
            background: ${theme.colors.surface} !important;
          }
          .reply-form {
            background: ${theme.colors.surface} !important;
          }
          .no-comments {
            color: ${theme.colors.textSecondary} !important;
          }
          .comment-author {
            color: ${theme.colors.text} !important;
          }
          .comment-date {
            color: ${theme.colors.textSecondary} !important;
          }
          .replies {
            background: ${theme.colors.background} !important;
            border-left-color: ${theme.colors.primary}40 !important;
          }
          .comment-input {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
            border-color: ${theme.colors.textSecondary}50 !important;
          }
          .comment-input:focus {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
            border-color: ${theme.colors.primary} !important;
          }
          .reply-input {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
            border-color: ${theme.colors.textSecondary}50 !important;
          }
          .reply-input:focus {
            background: ${theme.colors.surface} !important;
            color: ${theme.colors.text} !important;
            border-color: ${theme.colors.primary} !important;
          }
        `}
      </style>
      <div
        className="post-detail-container"
        style={{
          backgroundColor: theme.colors.background,
          minHeight: '100vh',
          color: theme.colors.text,
          backgroundImage: 'none',
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="back-button"
          style={{
            backgroundColor: theme.colors.background,
            color: theme.colors.text,
            border: `1px solid ${theme.colors.textSecondary}50`,
          }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Back
        </button>

      {/* Post content */}
      <div
        className="post-detail"
        style={{
          border: `1px solid ${theme.colors.textSecondary}30`,
        }}
      >
        <div className="post-header">
          <div className="post-author-info">
            <div
              className="author-avatar clickable-avatar"
              onClick={() => navigate(`/profile/${post.username || post.author}`)}
            >
              {post.user_image ? (
                <img
                  src={getAbsoluteImageUrl(post.user_image)}
                  alt={post.username || post.author}
                  className="author-image"
                />
              ) : (
                <div className="author-image-placeholder">
                  <UserIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div className="author-details">
              <div
                className="author-name clickable-name"
                onClick={() => navigate(`/profile/${post.username || post.author}`)}
              >
                {post.username || post.author}
              </div>
              <div
                className="post-timestamp"
                style={{
                  color: '#ffffff'
                }}
              >
                {formatDate(post.created_at)}
              </div>
            </div>
          </div>
          <div
            className="post-category-badge"
            style={{
              backgroundColor: theme.colors.primary,
              color: 'white'
            }}
          >
            {post.category_name || 'Uncategorized'}
          </div>
        </div>

        <div className="post-title-section">
          <h1
            className="post-title"
            style={{ color: theme.colors.text }}
          >
            {post.title}
          </h1>
        </div>

        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt={post.title} className="post-image-full" />
          </div>
        )}

        <div className="post-content">
          <p style={{ color: theme.colors.text }}>{post.content}</p>
        </div>

        {/* Post actions */}
        <div className="post-actions">
          <button
            onClick={handleLike}
            className={`like-button ${isLiked ? 'liked' : ''}`}
            disabled={!isAuthenticated}
          >
            {isLiked ? (
              <HeartSolidIcon className="w-6 h-6 text-red-500" />
            ) : (
              <HeartIcon className="w-6 h-6 text-gray-500" />
            )}
            <span>{likesCount}</span>
          </button>
          
          <div className="comments-count">
            <ChatBubbleLeftIcon className="w-6 h-6 text-gray-500" />
            <span>{post.comments_count || 0} comments</span>
          </div>

          {/* Owner Actions */}
          {isOwner && (
            <div className="flex gap-3 ml-auto">
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                title="Edit Post"
              >
                <PencilSquareIcon className="w-5 h-5" />
                <span className="text-sm">Edit</span>
              </button>
              <button
                onClick={handleDeletePost}
                className="flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors"
                title="Delete Post"
              >
                <TrashIcon className="w-5 h-5" />
                <span className="text-sm">Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Comments section */}
      <div
        className="comments-section"
        style={{
          border: `1px solid ${theme.colors.textSecondary}30`,
        }}
      >
        <h3 style={{ color: theme.colors.text }}>Comments</h3>
        
        {/* Add comment form */}
        {isAuthenticated && !replyTo && (
          <div className="comment-form-container">
            <div className="comment-form-avatar">
              {user?.image ? (
                <img
                  src={getAbsoluteImageUrl(user.image)}
                  alt={user.username}
                  className="comment-author-image"
                />
              ) : (
                <div className="comment-author-image-placeholder">
                  <UserIcon className="w-5 h-5 text-gray-400" />
                </div>
              )}
            </div>
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="comment-input"
                rows="3"
                style={{
                  backgroundColor: theme.colors.surface,
                  color: theme.colors.text,
                  borderColor: theme.colors.textSecondary + '50',
                }}
              />
              <button
                type="submit"
                className="comment-submit-btn"
              >
                Post Comment
              </button>
            </form>
          </div>
        )}
        
        {/* Reply mode indicator */}
        {isAuthenticated && replyTo && (
          <div className="reply-mode-indicator">
            <p>Replying to {replyTo.author.username}'s comment</p>
            <button
              onClick={() => {
                setReplyTo(null);
                setReplyContent('');
              }}
              className="cancel-reply-btn"
            >
              Cancel Reply
            </button>
          </div>
        )}

        {/* Comments list */}
        <div className="comments-list">
          {(!comments || comments.length === 0) ? (
            <p
              className="no-comments"
              style={{ color: theme.colors.textSecondary }}
            >
              No comments yet. Be the first to comment!
            </p>
          ) : (
            (Array.isArray(comments) ? comments : []).map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-main">
                  <div
                    className="comment-avatar clickable-avatar"
                    onClick={() => navigate(`/profile/${comment.author.username}`)}
                  >
                    {comment.author.image ? (
                      <img
                        src={getAbsoluteImageUrl(comment.author.image)}
                        alt={comment.author.username}
                        className="comment-author-image"
                      />
                    ) : (
                      <div className="comment-author-image-placeholder">
                        <UserIcon className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="comment-body">
                    <div className="comment-header">
                      <div className="comment-header-left">
                        <span
                          className="comment-author clickable-name"
                          onClick={() => navigate(`/profile/${comment.author.username}`)}
                          style={{ color: theme.colors.text }}
                        >
                          {comment.author.username}
                        </span>
                        <span
                          className="comment-date"
                          style={{ color: theme.colors.textSecondary }}
                        >
                          {formatDate(comment.created_at)}
                        </span>
                      </div>
                      <div className="comment-header-right">
                        {/* Delete button for comments */}
                        {canDeleteComment(comment) && (
                          <button
                            onClick={() => setDeleteConfirm({ id: comment.id, type: 'comment', content: comment.content })}
                            className="delete-button"
                            title="Delete comment"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="comment-content">
                      <p style={{ color: theme.colors.text }}>{comment.content}</p>
                    </div>

                    {/* Reply button */}
                    {isAuthenticated && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setReplyTo(comment);
                        }}
                        className="reply-button"
                      >
                        Reply
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply form */}
                {replyTo?.id === comment.id && (
                  <form onSubmit={handleReplySubmit} className="reply-form">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="reply-input"
                      rows="2"
                      style={{
                        backgroundColor: theme.colors.surface,
                        color: theme.colors.text,
                        borderColor: theme.colors.textSecondary + '50',
                      }}
                    />
                    <div className="reply-actions">
                      <button 
                        type="submit" 
                        className="reply-submit-btn"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyTo(null);
                          setReplyContent('');
                        }}
                        className="cancel-reply-btn"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                  <div className="replies">
                    {comment.replies.map(reply => (
                      <div key={reply.id} className="reply">
                        <div className="comment-main">
                          <div
                            className="comment-avatar clickable-avatar"
                            onClick={() => navigate(`/profile/${reply.author.username}`)}
                          >
                            {reply.author.image ? (
                              <img
                                src={getAbsoluteImageUrl(reply.author.image)}
                                alt={reply.author.username}
                                className="comment-author-image"
                              />
                            ) : (
                              <div className="comment-author-image-placeholder">
                                <UserIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="comment-body">
                            <div className="comment-header">
                              <div className="comment-header-left">
                                <span
                                  className="comment-author clickable-name"
                                  onClick={() => navigate(`/profile/${reply.author.username}`)}
                                  style={{ color: theme.colors.text }}
                                >
                                  {reply.author.username}
                                </span>
                                <span
                                  className="comment-date"
                                  style={{ color: theme.colors.textSecondary }}
                                >
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                              <div className="comment-header-right">
                                {/* Delete button for replies */}
                                {canDeleteComment(reply) && (
                                  <button
                                    onClick={() => setDeleteConfirm({ id: reply.id, type: 'reply', content: reply.content })}
                                    className="delete-button"
                                    title="Delete reply"
                                  >
                                    <TrashIcon className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <div className="comment-content">
                              <p style={{ color: theme.colors.text }}>{reply.content}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
            <h3>Delete {deleteConfirm.type === 'reply' ? 'Reply' : 'Comment'}</h3>
            <p>Are you sure you want to delete this {deleteConfirm.type}?</p>
            <p className="delete-content-preview">"{deleteConfirm.content.substring(0, 50)}{deleteConfirm.content.length > 50 ? '...' : ''}"</p>
            <div className="delete-confirmation-actions">
              <button
                onClick={() => handleDeleteComment(deleteConfirm.id, deleteConfirm.type === 'reply')}
                className="delete-confirm-btn"
              >
                Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="delete-cancel-btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      <EditPostModal
        isOpen={isEditing}
        post={post}
        onClose={() => setIsEditing(false)}
        onPostUpdated={handlePostUpdated}
      />
    </div>
    </>
  );
};

export default PostDetail;
