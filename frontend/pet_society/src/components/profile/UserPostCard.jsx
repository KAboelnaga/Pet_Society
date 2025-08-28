import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Edit, Trash2, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";

function UserPostCard({ post, currentUser, onDelete }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  // Likes state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  // Check if current user owns this post
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
      console.error("Error fetching like status:", error);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated || isLiking) return;

    setIsLiking(true);
    try {
      const response = await api.post(`posts/${post.id}/like/`);
      setIsLiked(response.data.is_liked);
      setLikesCount(response.data.likes_count);
    } catch (error) {
      console.error("Error toggling like:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await api.delete(`posts/${post.id}/`);
      if (response.status === 204) {
        onDelete(post.id);
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post");
    }
  };

  const handlePostClick = () => {
    navigate(`/posts/${post.id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group"
      style={{
        backgroundColor: theme.colors.background,
        border: `1px solid ${theme.colors.textSecondary}30`,
      }}
      onClick={handlePostClick}
    >
      {/* Post Image */}
      {post.image && (
        <div className="relative overflow-hidden">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {/* Category Badge */}
          {post.category_name && (
            <div className="absolute top-3 left-3">
              <span className="bg-white bg-opacity-90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                {post.category_name}
              </span>
            </div>
          )}
          {/* Owner Actions */}
          {isOwner && (
            <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/posts/${post.id}/edit`);
                }}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                <Edit size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Post Content */}
      <div className="p-4">
        {/* Title */}
        <h3
          className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors"
          style={{ color: theme.colors.text }}
        >
          {post.title}
        </h3>

        {/* Content Preview */}
        <p
          className="text-sm mb-4 line-clamp-3"
          style={{ color: theme.colors.textSecondary }}
        >
          {post.content.length > 120
            ? post.content.slice(0, 120) + "..."
            : post.content}
        </p>

        {/* Post Meta */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <Calendar size={14} />
            <span>{formatDate(post.created_at)}</span>
          </div>
          {!post.image && post.category_name && (
            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs font-medium">
              {post.category_name}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLike}
              disabled={!isAuthenticated || isLiking}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked
                  ? "text-red-500 hover:text-red-600"
                  : "text-gray-500 hover:text-red-500"
              } ${!isAuthenticated ? "cursor-not-allowed opacity-50" : ""}`}
            >
              <Heart
                size={18}
                className={isLiked ? "fill-current" : ""}
              />
              <span className="text-sm font-medium">{likesCount}</span>
            </button>

            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
              <MessageCircle size={18} />
              <span className="text-sm font-medium">{post.comments_count || 0}</span>
            </button>
          </div>

          {/* Mobile Owner Actions */}
          {isOwner && (
            <div className="flex space-x-2 sm:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/posts/${post.id}/edit`);
                }}
                className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={handleDelete}
                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserPostCard;
