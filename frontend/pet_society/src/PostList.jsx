import React, { useState, useEffect } from 'react';
import api from './api';
import PostCard from './PostCard';
import './App.css';

/**
 * PostList component
 * Fetches and displays a list of posts from the backend.
 * Supports filtering by category and pagination.
 */
const PostList = ({ selectedCategory }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  useEffect(() => {
    setLoading(true);
    let url = `posts/?page=${page}`;
    if (selectedCategory) {
      url += `&category=${selectedCategory}`;
    }
    api.get(url)
      .then(res => {
        setPosts(res.data.results);
        setHasNext(!!res.data.next);
      })
      .catch(err => {
        setPosts([]);
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, page]);

  const handleNext = () => setPage(page + 1);
  const handlePrev = () => setPage(page > 1 ? page - 1 : 1);

  if (loading) return <div className="loading">Loading posts...</div>;
  if (!posts.length) return <div className="no-posts">No posts found.</div>;

  return (
    <div className="post-list">
      {posts.map(post => <PostCard key={post.id} post={post} />)}
      <div className="pagination">
        <button onClick={handlePrev} disabled={page === 1}>Previous</button>
        <span>Page {page}</span>
        <button onClick={handleNext} disabled={!hasNext}>Next</button>
      </div>
    </div>
  );
};

export default PostList;