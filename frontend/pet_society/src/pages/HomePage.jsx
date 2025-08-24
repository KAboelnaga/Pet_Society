import React, { useState } from 'react';
import PostList from '../components/PostList';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import CreatePostModal from '../components/CreatePostModal';
import { PencilSquareIcon } from '@heroicons/react/24/solid';
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

  return (
    <div className="min-h-screen bg-gray-50 relative">
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
          />
        </div>
      </div>

      {/* Floating create button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-blue-700 transition duration-300"
      >
        <PencilSquareIcon className="w-7 h-7" />
      </button>

      {/* Modal for creating a post */}
      <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default HomePage;
