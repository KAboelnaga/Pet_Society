import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../App.css';

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  console.log('PostDetail component - id from params:', id);
  console.log('PostDetail component - id type:', typeof id);
  
  console.log('PostDetail rendered with id:', id);
  console.log('User:', user);
  console.log('Is authenticated:', isAuthenticated);
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  useEffect(() => {
    console.log('PostDetail useEffect triggered with id:', id);
    console.log('API base URL:', api.defaults.baseURL);
    console.log('Auth token:', localStorage.getItem('token'));
    
    // Test API connection first
    testApiConnection();
    
    fetchPost();
    fetchComments();
    if (isAuthenticated) {
      fetchLikeStatus();
    }
  }, [id, isAuthenticated]);

  const testApiConnection = async () => {
    console.log('Testing API connection...');
    try {
      const response = await api.get('posts/');
      console.log('API connection test successful:', response.data);
      console.log('Posts response structure:', {
        hasResults: !!response.data.results,
        isArray: Array.isArray(response.data),
        type: typeof response.data
      });
    } catch (error) {
      console.error('API connection test failed:', error);
      console.error('Error response:', error.response);
    }
  };

  const fetchPost = async () => {
    console.log('Fetching post with id:', id);
    try {
      const response = await api.get(`posts/${id}/`);
      console.log('Post fetch response:', response.data);
      setPost(response.data);
      setLikesCount(response.data.likes_count || 0);
    } catch (error) {
      console.error('Error fetching post:', error);
      console.error('Error details:', error.response?.data);
      setError('Failed to load post');
    }
  };

  const fetchComments = async () => {
    console.log('Fetching comments for post:', id);
    try {
      const response = await api.get(`comments/?post_id=${id}`);
      console.log('Comments fetch response:', response.data);
      console.log('Comments response type:', typeof response.data);
      console.log('Is array?', Array.isArray(response.data));
      
      // Handle paginated response
      let commentsData = [];
      if (response.data && response.data.results) {
        // Paginated response
        commentsData = response.data.results;
        console.log('Using paginated results:', commentsData);
      } else if (Array.isArray(response.data)) {
        // Direct array response
        commentsData = response.data;
        console.log('Using direct array:', commentsData);
      } else {
        // Fallback to empty array
        commentsData = [];
        console.log('Using fallback empty array');
      }
      
      console.log('Final comments data:', commentsData);
      setComments(commentsData);
    } catch (error) {
      console.error('Error fetching comments:', error);
      console.error('Error details:', error.response?.data);
      // Set empty array on error
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLikeStatus = async () => {
    console.log('Fetching like status for post:', id);
    try {
      const response = await api.get(`posts/${id}/user_like_status/`);
      console.log('Like status response:', response.data);
      setIsLiked(response.data.is_liked);
    } catch (error) {
      console.error('Error fetching like status:', error);
      console.error('Error details:', error.response?.data);
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
    console.log('Comment submit triggered');
    console.log('New comment content:', newComment);
    console.log('Post ID:', id);
    console.log('User:', user);
    console.log('Is authenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot post comment');
      return;
    }
    
    if (!newComment.trim()) {
      console.log('Comment is empty, returning');
      return;
    }

    try {
      console.log('Sending comment to API...');
      const response = await api.post('comments/', {
        content: newComment,
        post: id
      });
      
      console.log('Comment API response:', response.data);
      
      // Add new comment to the beginning of the list
      const newComments = [response.data, ...(Array.isArray(comments) ? comments : [])];
      setComments(newComments);
      setNewComment('');
      
      // Update post comments count
      setPost(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }));
      
      console.log('Comment added successfully');
    } catch (error) {
      console.error('Error posting comment:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error details:', JSON.stringify(error.response?.data, null, 2));
    }
  };

  const handleReplySubmit = async (e) => {
    e.preventDefault();
    console.log('Reply submit triggered');
    console.log('Reply content:', replyContent);
    console.log('Reply to comment ID:', replyTo?.id);
    console.log('Post ID:', id);
    console.log('User:', user);
    console.log('Is authenticated:', isAuthenticated);
    
    if (!isAuthenticated) {
      console.log('User not authenticated, cannot post reply');
      return;
    }
    
    if (!replyContent.trim()) {
      console.log('Reply is empty, returning');
      return;
    }

    try {
      console.log('Sending reply to API...');
      const response = await api.post(`comments/${replyTo.id}/reply/`, {
        content: replyContent
      });
      
      console.log('Reply API response:', response.data);
      
      // Refresh comments to show the new reply
      fetchComments();
      setReplyTo(null);
      setReplyContent('');
      
      // Update post comments count
      setPost(prev => ({
        ...prev,
        comments_count: (prev.comments_count || 0) + 1
      }));
      
      console.log('Reply added successfully');
    } catch (error) {
      console.error('Error posting reply:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Full error details:', JSON.stringify(error.response?.data, null, 2));
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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
    <div className="post-detail-container">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="back-button"
      >
        <ArrowLeftIcon className="w-5 h-5" />
        Back
      </button>

      {/* Post content */}
      <div className="post-detail">
        <div className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-author">by {post.author}</span>
            <span className="post-category">
              in {post.category_name || 'Uncategorized'}
            </span>
            <span className="post-date">
              {formatDate(post.created_at)}
            </span>
          </div>
        </div>

        {post.image && (
          <div className="post-image-container">
            <img src={post.image} alt={post.title} className="post-image-full" />
          </div>
        )}

        <div className="post-content">
          <p>{post.content}</p>
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
        </div>
      </div>

      {/* Comments section */}
      <div className="comments-section">
        <h3>Comments</h3>
        
        {/* Add comment form */}
        {isAuthenticated && (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
              rows="3"
            />
            <button 
              type="submit" 
              className="comment-submit-btn"
              onClick={() => console.log('Comment button clicked')}
            >
              Post Comment
            </button>
          </form>
        )}

        {/* Comments list */}
        <div className="comments-list">
          {(!comments || comments.length === 0) ? (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          ) : (
            (Array.isArray(comments) ? comments : []).map(comment => (
              <div key={comment.id} className="comment">
                <div className="comment-header">
                  <span className="comment-author">{comment.author.username}</span>
                  <span className="comment-date">{formatDate(comment.created_at)}</span>
                </div>
                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>
                
                {/* Reply button */}
                {isAuthenticated && (
                  <button
                    onClick={() => setReplyTo(comment)}
                    className="reply-button"
                  >
                    Reply
                  </button>
                )}

                {/* Reply form */}
                {replyTo?.id === comment.id && (
                  <form onSubmit={handleReplySubmit} className="reply-form">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply..."
                      className="reply-input"
                      rows="2"
                    />
                    <div className="reply-actions">
                      <button 
                        type="submit" 
                        className="reply-submit-btn"
                        onClick={() => console.log('Reply button clicked')}
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
                        <div className="comment-header">
                          <span className="comment-author">{reply.author.username}</span>
                          <span className="comment-date">{formatDate(reply.created_at)}</span>
                        </div>
                        <div className="comment-content">
                          <p>{reply.content}</p>
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
    </div>
  );
};

export default PostDetail;
