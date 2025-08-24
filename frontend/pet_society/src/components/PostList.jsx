// PostList.js
import React, { useState, useEffect } from "react";
import api from "../services/api";
import PostCard from "./PostCard";
import "../App.css";

const PostList = ({ selectedCategory }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  // ✅ Username string from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    setLoading(true);
    let url = `posts/?page=${page}`;
    if (selectedCategory) {
      url += `&category=${selectedCategory}`;
    }

    api
      .get(url)
      .then((res) => {
        const data = res.data;
        if (data.results) {
          setPosts(data.results);
          setHasNext(!!data.next);
        } else {
          setPosts(data);
          setHasNext(false);
        }
      })
      .catch((err) => {
        console.error("Error fetching posts:", err);
        setPosts([]);
        setHasNext(false);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, page]);

  const handleNext = () => setPage(page + 1);
  const handlePrev = () => setPage(page > 1 ? page - 1 : 1);

  if (loading) return <div className="loading">Loading posts...</div>;
  if (!posts.length) return <div className="no-posts">No posts found.</div>;

  return (
    <div className="post-list space-y-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} currentUser={currentUser} />
      ))}
      <div className="pagination flex items-center justify-center gap-4 mt-6">
        <button
          onClick={handlePrev}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
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
