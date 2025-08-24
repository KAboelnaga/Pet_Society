import React, { useState, useEffect } from "react";
import {
  XMarkIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

const EditPostModal = ({ isOpen, onClose, post }) => {
  const [title, setTitle] = useState(post?.title || "");
  const [content, setContent] = useState(post?.content || "");
  const [categoryId, setCategoryId] = useState(post?.category?.id || ""); // ✅ use category.id
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);

  useEffect(() => {
    if (post) {
      setTitle(post.title);
      setContent(post.content);
      setCategoryId(post.category?.id || ""); // ✅ reset when post changes
    }
  }, [post]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("http://localhost:8000/api/categories/");
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : data.results || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to edit a post.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category_id", categoryId); // ✅ send category_id instead of category
      if (image) formData.append("image", image);

      const response = await fetch(
        `http://localhost:8000/api/posts/${post.id}/`,
        {
          method: "PUT",
          headers: {
            Authorization: `Token ${token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        alert("Post updated successfully!");
        onClose();
        window.location.reload();
      } else {
        const err = await response.json();
        console.error(err);
        alert(err.detail || JSON.stringify(err));
      }
    } catch (error) {
      console.error("Error updating post:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative">
        {/* ✅ Close icon */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Post</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ✅ Dropdown shows category name but stores id */}
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          />

          <textarea
            placeholder="Write your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 h-32"
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full border rounded-lg px-3 py-2"
          />

          <div className="flex justify-end gap-2">
            {/* Cancel button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              <ArrowUturnLeftIcon className="h-5 w-5" />
              Cancel
            </button>

            {/* Save button */}
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <CheckIcon className="h-5 w-5" />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostModal;
