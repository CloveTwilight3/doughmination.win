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

const MentalStateAdmin = () => {
  const [currentState, setCurrentState] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    level: 'safe',
    notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const mentalStates = [
    { value: 'safe', label: 'Safe ✅', color: 'green', description: 'Feeling secure and stable' },
    { value: 'unstable', label: 'Unstable ⚠️', color: 'yellow', description: 'Some emotional fluctuation' },
    { value: 'idealizing', label: 'Idealizing ❗', color: 'orange', description: 'Active idealization patterns' },
    { value: 'self-harming', label: 'Self-Harming 🚨', color: 'red', description: 'Self-harm risk present' },
    { value: 'highly at risk', label: 'Highly At Risk ⛔', color: 'red', description: 'Immediate safety concerns' }
  ];

  useEffect(() => {
    fetchCurrentState();
  }, []);

  const fetchCurrentState = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/mental-state', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentState(data);
        setFormData({
          level: data.level,
          notes: data.notes || ''
        });
      } else {
        throw new Error('Failed to fetch mental state');
      }
    } catch (err) {
      console.error('Error fetching mental state:', err);
      setError('Failed to load mental state');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/mental-state', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          level: formData.level,
          notes: formData.notes.trim() || null,
          updated_at: new Date().toISOString()
        })
      });

      if (response.ok) {
        setMessage('Mental state updated successfully');
        setEditMode(false);
        await fetchCurrentState();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update mental state');
      }
    } catch (err) {
      console.error('Error updating mental state:', err);
      setError(err.message || 'Failed to update mental state');
    } finally {
      setLoading(false);
    }
  };

  const getStateInfo = (level) => {
    return mentalStates.find(s => s.value === level) || { color: 'gray', label: level };
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });
    } catch (e) {
      return dateString;
    }
  };

  if (loading && !currentState) {
    return (
      <div className="mt-8 border-t pt-6 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4">Manage Mental State</h2>
        <div className="p-6 text-center">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
          <p className="text-lg">Loading mental state...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 border-t pt-6 dark:border-gray-700">
      <h2 className="text-xl font-semibold mb-4">Manage Mental State</h2>
      
      {message && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
          {message}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
          {error}
        </div>
      )}

      {currentState && !editMode ? (
        <div className="mb-6">
          <div className={`p-4 rounded-lg border-2 ${
            getStateInfo(currentState.level).color === 'green' ? 'border-green-500 bg-green-50 dark:bg-green-900 dark:bg-opacity-20' :
            getStateInfo(currentState.level).color === 'yellow' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20' :
            getStateInfo(currentState.level).color === 'orange' ? 'border-orange-500 bg-orange-50 dark:bg-orange-900 dark:bg-opacity-20' :
            getStateInfo(currentState.level).color === 'red' ? 'border-red-500 bg-red-50 dark:bg-red-900 dark:bg-opacity-20' :
            'border-gray-500 bg-gray-50 dark:bg-gray-900 dark:bg-opacity-20'
          }`}>
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold mb-2">Current State</h3>
                <p className={`text-xl font-bold mb-2 ${
                  getStateInfo(currentState.level).color === 'green' ? 'text-green-700 dark:text-green-300' :
                  getStateInfo(currentState.level).color === 'yellow' ? 'text-yellow-700 dark:text-yellow-300' :
                  getStateInfo(currentState.level).color === 'orange' ? 'text-orange-700 dark:text-orange-300' :
                  getStateInfo(currentState.level).color === 'red' ? 'text-red-700 dark:text-red-300' :
                  'text-gray-700 dark:text-gray-300'
                }`}>
                  {getStateInfo(currentState.level).label}
                </p>
                {currentState.notes && (
                  <p className="text-gray-700 dark:text-gray-300 italic mb-2">
                    "{currentState.notes}"
                  </p>
                )}
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {formatDate(currentState.updated_at)}
                </p>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
            </div>
          </div>

          {/* Quick warning for critical states */}
          {['self-harming', 'highly at risk'].includes(currentState.level) && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Safety Resources:</strong> If you're in crisis, please reach out to a mental health professional or crisis helpline.
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Mental State Level</label>
            <div className="space-y-2">
              {mentalStates.map(state => (
                <label key={state.value} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={state.value}
                    checked={formData.level === state.value}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="mt-1"
                    required
                  />
                  <div>
                    <div className="font-medium">{state.label}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{state.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              rows="3"
              placeholder="Additional notes about current state..."
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.notes.length}/500 characters
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            {editMode && (
              <button
                type="button"
                onClick={() => {
                  setEditMode(false);
                  setFormData({
                    level: currentState.level,
                    notes: currentState.notes || ''
                  });
                  setError(null);
                  setMessage(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          {/* Display help text for critical states */}
          {['self-harming', 'highly at risk'].includes(formData.level) && (
            <div className="mt-4 p-4 bg-red-100 dark:bg-red-900 dark:bg-opacity-20 border border-red-300 dark:border-red-700 rounded-lg">
              <h4 className="font-medium text-red-800 dark:text-red-300 mb-2">Important Safety Reminder</h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                Setting your status to "{getStateInfo(formData.level).label}" will inform your friends that you're in a critical state. 
                Please ensure you have appropriate support resources available, including:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-300 mt-2 list-disc list-inside ml-2">
                <li>Emergency contacts or crisis helpline numbers</li>
                <li>Trusted friends or family members who can check on you</li>
                <li>Your mental health care team or crisis support services</li>
              </ul>
            </div>
          )}
        </form>
      )}

      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Mental State Levels Guide:
        </h3>
        <div className="grid gap-2 text-sm">
          {mentalStates.map(state => (
            <div key={state.value} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full inline-block ${
                state.color === 'green' ? 'bg-green-500' :
                state.color === 'yellow' ? 'bg-yellow-500' :
                state.color === 'orange' ? 'bg-orange-500' :
                state.color === 'red' ? 'bg-red-500' :
                'bg-gray-500'
              }`}></span>
              <span className="font-medium">{state.label.replace(/[^\w\s]/gi, '').trim()}:</span>
              <span className="text-gray-600 dark:text-gray-400">{state.description}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MentalStateAdmin;