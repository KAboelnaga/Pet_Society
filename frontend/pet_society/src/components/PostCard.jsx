// src/components/PostCard.js
import { PencilSquareIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useState } from "react";
import EditPostModal from "./EditPostModal";

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
          </span>
        </div>

        <span className="text-gray-500 text-sm">
          {new Date(post.created_at).toLocaleDateString()}
        </span>
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
