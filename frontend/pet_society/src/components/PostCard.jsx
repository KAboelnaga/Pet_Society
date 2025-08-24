import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../App.css';

/**
 * PostCard component
 * Displays a single post preview (image, title, author, category, created_at, short content).
 * Image is clickable and links to the post detail page.
 * Now includes like functionality directly from the home screen.
 */
const PostCard = ({ post }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // State for like functionality
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);
  
  // Show only a short preview of content
  const preview =
    post.content.length > 100
      ? post.content.slice(0, 100) + '...'
      : post.content;

  // Fetch like status when component mounts
  useEffect(() => {
    if (isAuthenticated) {
      fetchLikeStatus();
    }
  }, [post.id, isAuthenticated]);

  const fetchLikeStatus = async () => {
    try {
      const response = await api.get(`posts/${post.id}/user_like_status/`);
      setIsLiked(response.data.is_liked);
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation(); // Prevent post navigation
    
    if (!isAuthenticated) {
      // Could show a login prompt here
      return;
    }

    if (isLiking) return; // Prevent multiple rapid clicks

    setIsLiking(true);
    try {
      const response = await api.post(`posts/${post.id}/like/`);
      setIsLiked(response.data.is_liked);
      setLikesCount(response.data.likes_count);
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handlePostClick = () => {
    console.log('Post clicked:', post.id);
    navigate(`/posts/${post.id}`);
  };

  return (
    <div className="post-card" onClick={handlePostClick}>
      <div className="post-image-container">
        {post.image ? (
          <img src={post.image} alt={post.title} className="post-image" />
        ) : (
          <div className="post-image-placeholder">No Image</div>
        )}
      </div>
      <div className="post-info">
        <h3 className="post-title">{post.title}</h3>
        <div className="post-meta">
          <span className="post-author">by {post.author}</span>
          <span className="post-category">
            in {post.category_name || 'Uncategorized'}
          </span>
          <span className="post-date">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
        <p className="post-preview">{preview}</p>
        
        {/* Post stats with interactive like button */}
        <div className="post-stats">
          <button
            onClick={handleLike}
            className={`stat-item like-button ${isLiked ? 'liked' : ''} ${!isAuthenticated ? 'disabled' : ''}`}
            disabled={!isAuthenticated || isLiking}
          >
            {isLiked ? (
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
            ) : (
              <HeartIcon className="w-5 h-5 text-gray-500" />
            )}
            <span>{likesCount}</span>
          </button>
          <div className="stat-item">
            <ChatBubbleLeftIcon className="w-5 h-5 text-gray-500" />
            <span>{post.comments_count || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
