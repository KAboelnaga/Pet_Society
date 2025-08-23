import React from "react";
import { useNavigate } from "react-router-dom";

function CreatePostButton() {
  const navigate = useNavigate();

  const handleClick = () => {
    // Redirect to your create post page
    navigate("/create-post");
  };

  return (
    <button
      onClick={handleClick}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md"
    >
      + Create Post
    </button>
  );
}

export default CreatePostButton;
