import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../App.css';

/**
 * PostCard component
 * Displays a single post preview with like and comment functionality.
 */
const PostCard = ({ post, onUpdate }) => {
  const { isAuthenticated } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  
  // Show only a short preview of content
  const preview = post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content;

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      alert('Please login to like posts');
      return;
    }

    setIsLiking(true);
    try {
      const response = await api.post(`posts/${post.id}/toggle-like/`);
      if (onUpdate) {
        onUpdate(response.data);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      alert('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <div className="post-card">
      <a href={`/posts/${post.id}`} className="post-image-link" title="Click to view full post">
        {post.image ? (
          <img src={post.image} alt={post.title} className="post-image" />
        ) : (
          <div className="post-image-placeholder">No Image</div>
        )}
      </a>
      <div className="post-info">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-meta">
          <span className="post-author">by {post.author}</span>
          <span className="post-category">in {post.category}</span>
          <span className="post-date">{new Date(post.created_at).toLocaleDateString()}</span>
        </div>
        <p className="post-preview">{preview}</p>
        
        {/* Like and Comment Section */}
        <div className="post-actions">
          <button 
            onClick={handleLikeToggle}
            disabled={isLiking}
            className={`like-button ${post.is_liked_by_user ? 'liked' : ''}`}
          >
            {isLiking ? '...' : (post.is_liked_by_user ? '❤️' : '🤍')} 
            {post.like_count || 0}
          </button>
          
          <span className="comment-count">
            💬 {post.comment_count || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PostCard;