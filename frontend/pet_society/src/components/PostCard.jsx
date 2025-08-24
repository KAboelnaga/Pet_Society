import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import EditPostModal from "./EditPostModal";
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
// src/components/PostCard.js


function PostCard({ post, currentUser }) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authorized");

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/posts/${post.id}/`,
        {
          method: "DELETE",
          headers: { Authorization: `Token ${token}` },
        }
      );

      if (response.ok) {
        alert("Post deleted");
        window.location.reload();
      } else {
        const err = await response.json();
        alert(err.detail || "Failed to delete post");
      }
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

// --- Ownership check ---
// ✅ Compare username string with post’s author.username
  const isOwner = currentUser?.username === post.author || currentUser?.username === post.username;


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
    <div className="bg-white rounded-2xl shadow p-6 mb-4 relative">
      {/* Header: User + Date */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-white">
            {(post.author?.username?.[0] ||
              post.username?.[0] ||
              "U"
            ).toUpperCase()}
          </div>
          <span className="bg-gray-800 text-white text-sm px-3 py-1 rounded-full">
            {post.author?.username || post.username || "Unknown"}
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

        <span className="text-gray-500 text-sm">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
        
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

      {/* Post Content */}
      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-4">{post.content}</p>
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full rounded-lg object-cover mb-4"
        />
      )}

      {/* Category */}
      {post.category && (
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          {post.category.name || post.category}
        </span>
      )}

      {/* Action buttons */}
      {isOwner && (
        <div className="flex gap-3 justify-end mt-3">
          <button
            onClick={() => setIsEditing(true)}
            className="text-blue-600 hover:text-blue-800"
            title="Edit Post"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800"
            title="Delete Post"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <EditPostModal
        isOpen={isEditing}        // ✅ pass isOpen
        post={post}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}

export default PostCard;
