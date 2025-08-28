import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import EditPostModal from "./EditPostModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../services/api";

function PostCard({ post, currentUser, onPostUpdated }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { theme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);

  // Likes state
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  // --- Ownership check ---
  const isOwner =
    currentUser?.username === post.author ||
    currentUser?.username === post.username;

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

  const handleDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Not authorized");

    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const response = await api.delete(`posts/${post.id}/`);

      if (response.status === 204 || response.status === 200) {
        alert("Post deleted successfully!");
        if (onPostUpdated) {
          onPostUpdated(); // Trigger refresh instead of page reload
        }
    }} catch (error) {
      console.error("Error deleting post:", error);
      alert(error.response?.data?.detail || "Error deleting post");
    }
  };

  const handlePostClick = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <div
      className="rounded-2xl shadow p-6 mb-4 relative cursor-pointer transition-all duration-300"
      style={{
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.textSecondary + '30',
        border: `1px solid ${theme.colors.textSecondary}30`,
      }}
      onClick={handlePostClick}
    >
      {/* Header: Author + Date */}
      <div className="flex items-center justify-between mb-4">
        
        <div className="flex items-center gap-3">
          {/* Avatar with first letter */}
                    {post.user_image && (<img
                      src={post.user_image}
                      alt={(post.author?.[0] || post.username?.[0] || "U").toUpperCase()}
                      className="w-10 h-10 rounded-full object-cover bg-transparent"
                    />)}
          {!post.user_image &&(<div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center font-bold text-white">

            {!post.user_image && ((post.author?.[0] || post.username?.[0] || "U").toUpperCase())}
          </div>)}
          <div>
            <Link
              to={`/profile/${post.author || post.username}`}
              onClick={(e) => e.stopPropagation()}
              className="font-semibold hover:text-blue-600 transition-all duration-200 hover:scale-110 no-underline"
              style={{
                color: theme.colors.text,
                textDecoration: 'none'
              }}
            >
              {post.author || post.username || "Unknown"}
            </Link>
            <div
              className="text-sm"
              style={{ color: theme.colors.textSecondary }}
            >
              {new Date(post.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          alt={post.title}
          className="w-full rounded-lg object-cover mb-3"
        />
      )}

      {/* Category */}
      {post.category_name && (
        <span
          className="inline-block text-xs font-semibold px-3 py-1 rounded-full mb-4"
          style={{
            backgroundColor: theme.colors.primary + '20',
            color: theme.colors.primary,
          }}
        >
          {post.category_name}
        </span>
      )}

      {/* Title + Content */}
      <h2
        className="text-xl font-bold mb-2"
        style={{ color: theme.colors.text }}
      >
        {post.title}
      </h2>
      <p
        className="mb-4"
        style={{ color: theme.colors.textSecondary }}
      >
        {post.content.length > 100
          ? post.content.slice(0, 100) + "..."
          : post.content}
      </p>

      {/* Post stats */}
      <div className="flex items-center gap-6 mt-3">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1 ${
            isLiked ? "text-red-500" : "text-gray-500"
          }`}
          disabled={!isAuthenticated || isLiking}
        >
          {isLiked ? (
            <HeartSolidIcon className="w-5 h-5" />
          ) : (
            <HeartIcon className="w-5 h-5" />
          )}
          <span>{likesCount}</span>
        </button>
        <div className="flex items-center gap-1 text-gray-500">
          <ChatBubbleLeftIcon className="w-5 h-5" />
          <span>{post.comments_count || 0}</span>
        </div>
      </div>

      {/* Owner Actions */}
      {isOwner && (
        <div className="flex gap-3 justify-end mt-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="text-blue-600 hover:text-blue-800"
            title="Edit Post"
          >
            <PencilSquareIcon className="h-5 w-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-red-600 hover:text-red-800"
            title="Delete Post"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Edit Modal */}
      <EditPostModal
        isOpen={isEditing}
        post={post}
        onClose={() => setIsEditing(false)}
        onPostUpdated={onPostUpdated}
      />
    </div>
  );
}

export default PostCard;
