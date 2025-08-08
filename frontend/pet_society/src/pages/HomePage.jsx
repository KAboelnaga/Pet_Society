import React, { useState, useEffect } from 'react';
import PostList from '../components/PostList';
import Sidebar from '../components/Sidebar';
import '../App.css';

/**
 * HomePage component
 * Displays the sidebar (categories) and the main post feed in a flex layout.
 * Instagram-like look: sidebar on the left, feed in the center.
 */
const HomePage = () => {
  // State for selected category (null = all)
  const [selectedCategory, setSelectedCategory] = useState(null);

  return (
    <div className="homepage-container">
      {/* Sidebar for categories */}
      <Sidebar selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
      {/* Main feed for posts */}
      <div className="feed-container">
        <PostList selectedCategory={selectedCategory} />
      </div>
    </div>
  );
};

export default HomePage;