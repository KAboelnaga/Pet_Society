import React, { useState } from 'react';
import PostList from '../components/PostList';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CreatePostModal from '../components/CreatePostModal';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../context/ThemeContext';
import '../App.css';





/**
 * HomePage component
 * Displays the sidebar (categories) and the main post feed in a flex layout.
 * Includes floating create-post button (bottom-right).
 */
const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { theme } = useTheme();

  const handlePostCreated = () => {
    setIsModalOpen(false);
    setRefreshTrigger(prev => prev + 1); // Trigger refresh
    setCurrentPage(1); // Go back to first page to see new post
  };

  const handlePostUpdated = () => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh when post is edited
  };

  return (
    <div
      className="min-h-screen relative transition-all duration-300"
      style={{ backgroundColor: theme.colors.surface }}
    >
      <Navbar />
      <div className="homepage-container">
        {/* Sidebar for categories */}
        <Sidebar
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          setCurrentPage={setCurrentPage}
        />

        {/* Main feed for posts */}
        <div className="feed-container">
          <PostList
          selectedCategory={selectedCategory}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          refreshTrigger={refreshTrigger}
          onPostUpdated={handlePostUpdated}
          />
        </div>
      </div>

      {/* Floating create button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110"
        style={{
          background: theme.gradients.primary,
          boxShadow: `0 4px 20px ${theme.colors.primary}40`,
        }}
      >
        <PencilSquareIcon className="w-7 h-7" />
      </button>

      {/* Modal for creating a post */}
      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </div>
  );
};

export default HomePage;
