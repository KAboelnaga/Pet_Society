import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../App.css';

/**
 * Sidebar component
 * Fetches and displays all categories from the backend.
 * Allows user to select a category to filter posts.
 */
const Sidebar = ({ selectedCategory, setSelectedCategory, setCurrentPage }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('categories/')
      .then(res => {
        // Handle both paginated and non-paginated responses
        const data = res.data;
        if (data.results) {
          setCategories(data.results);
        } else {
          setCategories(data);
        }
      })
      .catch(err => {
        console.error('Error fetching categories:', err);
        setCategories([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="sidebar">
        <h2>Categories</h2>
        <div className="loading">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <h2>Categories</h2>
      <ul className="category-list">
        <li
          className={!selectedCategory ? 'active' : ''}
          onClick={() => {
            setSelectedCategory(null);
            setCurrentPage?.(1); // reset page to 1
          }}
        >
          All
        </li>
        {categories.map(cat => (
          <li
            key={cat.id}
            className={selectedCategory === cat.id ? 'active' : ''}
            onClick={() => {
              setSelectedCategory(cat.id);
              setCurrentPage?.(1); // reset page to 1
            }}
          >
            {cat.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;