// PostList.js
import React, { useState, useEffect } from "react";
import api from "../services/api";
import PostCard from "./PostCard";
import { useTheme } from "../context/ThemeContext";
import "../App.css";

const PostList = ({ selectedCategory, currentPage, setCurrentPage, refreshTrigger, onPostUpdated }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasNext, setHasNext] = useState(false);
  const { theme } = useTheme();

  // ✅ Username object from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const fetchPosts = async () => {
    setLoading(true);
    try {
      let url = `posts/?page=${currentPage || 1}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;

      const res = await api.get(url);
      const data = res.data;

      if (data.results) {
        setPosts(data.results);
        setHasNext(!!data.next);
      } else {
        setPosts(data);
        setHasNext(false);
      }
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
      setHasNext(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, currentPage, refreshTrigger]);

  const handleNext = () => {
    if (hasNext) setCurrentPage(currentPage + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  if (loading) return <div className="loading">Loading posts...</div>;
  if (!posts.length) return <div className="no-posts">No posts found.</div>;

  return (
    <div className="post-list space-y-6">
      {posts.map((post) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          onPostUpdated={onPostUpdated}
        />
      ))}

      <div className="pagination flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span style={{ color: theme.colors.text }}>Page {currentPage}</span>
        <button
          onClick={handleNext}
          disabled={!hasNext}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default PostList;
