import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolidIcon } from "@heroicons/react/24/solid";
import EditPostModal from "./EditPostModal";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { Link } from "lucide-react";
// import {Link } from "react-router-dom";

function PostCard({ post, currentUser }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

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

  const handlePostClick = () => {
    navigate(`/posts/${post.id}`);
  };

  return (
    <div
      className="bg-white rounded-2xl shadow p-6 mb-4 relative cursor-pointer"
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
            <p className="font-semibold">
              {post.author || post.username || "Unknown"}
            </p>
            <span className="text-gray-500 text-sm">
              {new Date(post.created_at).toLocaleDateString()}
            </span>
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
        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          {post.category_name}
        </span>
      )}

      {/* Title + Content */}
      <h2 className="text-xl font-bold mb-2">{post.title}</h2>
      <p className="text-gray-700 mb-4">
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
      />
    </div>
  );
}

export default PostCard;
