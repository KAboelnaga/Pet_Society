import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../App.css';

/**
 * CommentSection component
 * Displays comments for a post and allows users to add new comments.
 */
const CommentSection = ({ postId }) => {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      const response = await api.get(`posts/${postId}/comments/`);
      setComments(response.data);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(`posts/${postId}/comments/`, {
        content: newComment.trim(),
        post: postId
      });
      
      setComments(prev => [response.data, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      alert('Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentCommentId) => {
    if (!replyContent.trim()) return;

    setSubmitting(true);
    try {
      const response = await api.post(`comments/${parentCommentId}/replies/`, {
        content: replyContent.trim(),
        parent_comment: parentCommentId
      });
      
      // Add the reply to the parent comment
      setComments(prev => 
        prev.map(comment => 
          comment.id === parentCommentId
            ? { ...comment, replies: [...(comment.replies || []), response.data] }
            : comment
        )
      );
      
      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error submitting reply:', error);
      alert('Failed to submit reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await api.delete(`comments/${commentId}/`);
      setComments(prev => prev.filter(comment => comment.id !== commentId));
    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="loading">Loading comments...</div>;

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">Comments ({comments.length})</h3>
      
      {/* Add new comment form */}
      {isAuthenticated && (
        <form onSubmit={handleSubmitComment} className="comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="comment-input"
            rows="3"
            disabled={submitting}
          />
          <button 
            type="submit" 
            disabled={submitting || !newComment.trim()}
            className="comment-submit-btn"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {/* Comments list */}
      <div className="comments-list">
        {comments.length === 0 ? (
          <p className="no-comments">No comments yet. Be the first to comment!</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="comment-item">
              <div className="comment-header">
                <span className="comment-author">{comment.author_username}</span>
                <span className="comment-date">{formatDate(comment.created_at)}</span>
                {comment.is_edited && <span className="comment-edited">(edited)</span>}
              </div>
              
              <div className="comment-content">{comment.content}</div>
              
              <div className="comment-actions">
                {isAuthenticated && (
                  <button 
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="reply-btn"
                  >
                    Reply
                  </button>
                )}
                
                {(isAuthenticated && (comment.author_id === user?.id)) && (
                  <button 
                    onClick={() => handleDeleteComment(comment.id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                )}
              </div>

              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="reply-form">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="reply-input"
                    rows="2"
                  />
                  <div className="reply-actions">
                    <button 
                      onClick={() => handleSubmitReply(comment.id)}
                      disabled={submitting || !replyContent.trim()}
                      className="reply-submit-btn"
                    >
                      {submitting ? 'Posting...' : 'Post Reply'}
                    </button>
                    <button 
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      className="cancel-btn"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="replies-list">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="reply-item">
                      <div className="reply-header">
                        <span className="reply-author">{reply.author_username}</span>
                        <span className="reply-date">{formatDate(reply.created_at)}</span>
                        {reply.is_edited && <span className="reply-edited">(edited)</span>}
                      </div>
                      <div className="reply-content">{reply.content}</div>
                      
                      {(isAuthenticated && (reply.author_id === user?.id)) && (
                        <button 
                          onClick={() => handleDeleteComment(reply.id)}
                          className="delete-btn small"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentSection;
