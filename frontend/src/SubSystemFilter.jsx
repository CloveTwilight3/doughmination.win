/*
MIT License

Copyright (c) 2025 Clove Twilight

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

import React, { useState, useEffect } from 'react';

const SubSystemFilter = ({ onFilterChange, currentFilter }) => {
  const [subsystems, setSubsystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available sub-systems from backend
  useEffect(() => {
    const fetchSubsystems = async () => {
      try {
        const response = await fetch('/api/subsystems');
        if (response.ok) {
          const data = await response.json();
          setSubsystems(data.subsystems || []);
        } else {
          throw new Error('Failed to fetch sub-systems');
        }
      } catch (err) {
        console.error('Error fetching sub-systems:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSubsystems();
  }, []);

  const handleFilterClick = (filterValue) => {
    // If clicking the same filter, toggle it off (show all)
    const newFilter = currentFilter === filterValue ? null : filterValue;
    onFilterChange(newFilter);
  };

  if (loading) {
    return (
      <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-center text-gray-500 dark:text-gray-400">Loading sub-systems...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <p className="text-center text-red-600 dark:text-red-400">Error loading sub-systems: {error}</p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <h3 className="text-lg font-semibold mb-3 text-center">Filter by Sub-system</h3>
      
      <div className="flex flex-wrap justify-center gap-2">
        {/* Show All button */}
        <button
          onClick={() => handleFilterClick(null)}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentFilter === null
              ? 'bg-purple-600 text-white shadow-md transform scale-105'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
          }`}
        >
          All Members
        </button>

        {/* Host filter */}
        <button
          onClick={() => handleFilterClick('host')}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentFilter === 'host'
              ? 'bg-purple-600 text-white shadow-md transform scale-105'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
          }`}
        >
          🏠 Host
        </button>

        {/* Dynamic sub-system buttons */}
        {subsystems.map((subsystem) => (
          <button
            key={subsystem.label}
            onClick={() => handleFilterClick(subsystem.label)}
            className={`px-4 py-2 rounded-full transition-all duration-200 ${
              currentFilter === subsystem.label
                ? 'text-white shadow-md transform scale-105'
                : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
            }`}
            style={{
              backgroundColor: currentFilter === subsystem.label ? subsystem.color : undefined
            }}
          >
            {getSubSystemIcon(subsystem.label)} {subsystem.name}
          </button>
        ))}

        {/* Untagged filter */}
        <button
          onClick={() => handleFilterClick('untagged')}
          className={`px-4 py-2 rounded-full transition-all duration-200 ${
            currentFilter === 'untagged'
              ? 'bg-gray-800 text-white shadow-md transform scale-105'
              : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500'
          }`}
        >
          🔍 Untagged
        </button>
      </div>

      {/* Active filter indicator */}
      {currentFilter && (
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Showing: <span className="font-semibold">{getFilterDisplayName(currentFilter, subsystems)}</span>
          </span>
        </div>
      )}
    </div>
  );
};

// Helper function to get icons for sub-systems
const getSubSystemIcon = (label) => {
  const icons = {
    'saja': '🔫',
    'huntrix': '🎤',
  };
  return icons[label] || '📁';
};

// Helper function to get display name for current filter
const getFilterDisplayName = (filter, subsystems) => {
  if (filter === 'host') return 'Host Members';
  if (filter === 'untagged') return 'Untagged Members';
  
  const subsystem = subsystems.find(s => s.label === filter);
  return subsystem ? subsystem.name : filter;
};

export default SubSystemFilter;
