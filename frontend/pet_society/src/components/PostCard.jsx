import React from 'react';
import '../App.css';

/**
 * PostCard component
 * Displays a single post preview (image, title, author, category, created_at, short content).
 * Image is clickable and links to the post detail page (not implemented here).
 */
const PostCard = ({ post }) => {
  // Show only a short preview of content
  const preview = post.content.length > 100 ? post.content.slice(0, 100) + '...' : post.content;

  return (
    <div className="post-card">
      <a href={`/posts/${post.id}`} className="post-image-link">
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
      </div>
    </div>
  );
};

export default PostCard;