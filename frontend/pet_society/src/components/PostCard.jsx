import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import '../App.css';

/**
 * PostCard component
 * Displays a single post preview (image, title, author, category, created_at, short content).
 * Image is clickable and links to the post detail page.
 */
const PostCard = ({ post }) => {
  const navigate = useNavigate();
  
  // Show only a short preview of content
  const preview =
    post.content.length > 100
      ? post.content.slice(0, 100) + '...'
      : post.content;

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
        
        {/* Post stats */}
        <div className="post-stats">
          <div className="stat-item">
            <HeartIcon className="w-5 h-5 text-gray-500" />
            <span>{post.likes_count || 0}</span>
          </div>
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
