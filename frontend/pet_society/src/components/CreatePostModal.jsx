import React, { useState, useEffect, useRef } from "react";
import {
  XMarkIcon,
  CheckIcon,
  ArrowUturnLeftIcon,
} from "@heroicons/react/24/outline";

const CreatePostModal = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const fileInputRef = useRef();

  // Fetch categories
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

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setTitle("");
    setContent("");
    setCategoryId("");
    setImage(null);
    setPreview(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to create a post.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category_id", categoryId);
      if (image) formData.append("image", image);

      const response = await fetch("http://localhost:8000/api/posts/create/", {
        method: "POST",
        headers: { Authorization: `Token ${token}` },
        body: formData,
      });

      if (response.ok) {
        alert("Post created successfully!");
        handleCancel();
        window.location.reload();
      } else {
        const err = await response.json();
        console.error(err);
        alert(err.detail || JSON.stringify(err));
      }
    } catch (error) {
      console.error("Error creating post:", error);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleCancel}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleCancel}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Dropdown */}
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

          {/* Title */}
          <input
            type="text"
            placeholder="Post title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          />

          {/* Content */}
          <textarea
            placeholder="Write your post..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2 h-32"
          />

          {/* Large Image Preview */}
          {preview && (
            <div className="w-full mb-4">
              <img
                src={preview}
                alt="preview"
                className="w-full max-h-72 object-contain rounded-lg"
              />
            </div>
          )}

          {/* Drag & Drop / Click Box */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-lg h-40 flex items-center justify-center cursor-pointer text-gray-500 hover:border-gray-400 relative p-2"
          >
            <p>Drag & drop an image here, or click to select</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
            >
              <ArrowUturnLeftIcon className="h-5 w-5" />
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              <CheckIcon className="h-5 w-5" />
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
