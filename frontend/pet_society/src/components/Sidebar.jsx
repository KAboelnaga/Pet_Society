import React, { useState, useEffect } from 'react';
import api from '../api';
import './App.css';

/**
 * Sidebar component
 * Fetches and displays all categories from the backend.
 * Allows user to select a category to filter posts.
 */
const Sidebar = ({ selectedCategory, setSelectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('categories/')
      .then(res => setCategories(res.data))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="sidebar">
      <h2>Categories</h2>
      <ul className="category-list">
        <li
          className={!selectedCategory ? 'active' : ''}
          onClick={() => setSelectedCategory(null)}
        >
          All
        </li>
        {categories.map(cat => (
          <li
            key={cat.id}
            className={selectedCategory === cat.id ? 'active' : ''}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;