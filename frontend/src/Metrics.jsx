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
import { Link } from 'react-router-dom';

const Metrics = () => {
  const [frontingMetrics, setFrontingMetrics] = useState(null);
  const [switchMetrics, setSwitchMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary', 'detail', or 'switches'

  useEffect(() => {
    fetchMetrics();
  }, [days]);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }
    
    try {
      // Fetch fronting time metrics
      const frontingResponse = await fetch(`/api/metrics/fronting-time?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!frontingResponse.ok) {
        throw new Error(`Failed to fetch fronting metrics: ${frontingResponse.status}`);
      }
      
      const frontingData = await frontingResponse.json();
      setFrontingMetrics(frontingData);
      
      // Fetch switch frequency metrics
      const switchResponse = await fetch(`/api/metrics/switch-frequency?days=${days}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!switchResponse.ok) {
        throw new Error(`Failed to fetch switch metrics: ${switchResponse.status}`);
      }
      
      const switchData = await switchResponse.json();
      setSwitchMetrics(switchData);
      
    } catch (error) {
      console.error('Error fetching metrics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const formatTime = (seconds) => {
    if (seconds === 0) return '0s';
    
    const days = Math.floor(seconds / (24 * 3600));
    seconds %= (24 * 3600);
    const hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    
    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0) result += `${minutes}m `;
    if (seconds > 0) result += `${seconds}s`;
    
    return result.trim();
  };
  
  const handleDaysChange = (newDays) => {
    setDays(newDays);
  };
  
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-lg text-black dark:text-white">Loading metrics data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }
  
  if (!frontingMetrics || !switchMetrics) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-black dark:text-white mb-4">No metrics data available</p>
        <Link to="/" className="px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors">
          Back to Home
        </Link>
      </div>
    );
  }
  
  // Sort members by fronting time for the selected timeframe
  const sortedMembers = Object.values(frontingMetrics.members).sort((a, b) => {
    return b[`${days === 1 ? '24h' : days === 2 ? '48h' : days === 5 ? '5d' : days === 7 ? '7d' : '30d'}`] - 
           a[`${days === 1 ? '24h' : days === 2 ? '48h' : days === 5 ? '5d' : days === 7 ? '7d' : '30d'}`];
  });
  
  // Get current timeframe key
  const timeframeKey = days === 1 ? '24h' : days === 2 ? '48h' : days === 5 ? '5d' : days === 7 ? '7d' : '30d';
  
  return (
    <div className="max-w-4xl mx-auto mt-8 p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">System Metrics</h1>
      
      {/* Time Range Selector - Scrollable on mobile */}
      <div className="mb-6 overflow-x-auto pb-2">
        <label className="block text-sm font-medium mb-2">Time Range:</label>
        <div className="flex flex-nowrap gap-2 min-w-max">
          <button 
            onClick={() => handleDaysChange(1)}
            className={`whitespace-nowrap px-3 py-1 rounded ${days === 1 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 24h
          </button>
          <button 
            onClick={() => handleDaysChange(2)}
            className={`whitespace-nowrap px-3 py-1 rounded ${days === 2 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 48h
          </button>
          <button 
            onClick={() => handleDaysChange(5)}
            className={`whitespace-nowrap px-3 py-1 rounded ${days === 5 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 5d
          </button>
          <button 
            onClick={() => handleDaysChange(7)}
            className={`whitespace-nowrap px-3 py-1 rounded ${days === 7 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 7d
          </button>
          <button 
            onClick={() => handleDaysChange(30)}
            className={`whitespace-nowrap px-3 py-1 rounded ${days === 30 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 30d
          </button>
        </div>
      </div>
      
      {/* Tabs - Better mobile display */}
      <div className="flex mb-6 overflow-x-auto border-b">
        <button 
          onClick={() => setActiveTab('summary')} 
          className={`whitespace-nowrap px-3 py-2 text-sm sm:text-base font-medium ${activeTab === 'summary' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Summary
        </button>
        <button 
          onClick={() => setActiveTab('detail')} 
          className={`whitespace-nowrap px-3 py-2 text-sm sm:text-base font-medium ${activeTab === 'detail' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Details
        </button>
        <button 
          onClick={() => setActiveTab('switches')} 
          className={`whitespace-nowrap px-3 py-2 text-sm sm:text-base font-medium ${activeTab === 'switches' ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`}
        >
          Switches
        </button>
      </div>
      
      {/* Summary Tab */}
      {activeTab === 'summary' && (
        <div>
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4">Fronting Time Overview</h2>
            
            {sortedMembers.length > 0 ? (
              <div className="space-y-4">
                {sortedMembers.slice(0, 5).map(member => {
                  // Calculate percentage for this timeframe
                  const timeframeSeconds = Object.values(frontingMetrics.timeframes[timeframeKey]).reduce((sum, val) => sum + val, 0);
                  const percentage = timeframeSeconds > 0 ? (member[timeframeKey] / timeframeSeconds) * 100 : 0;
                  
                  return (
                    <div key={member.id} className="bg-gray-50 dark:bg-gray-700 p-3 sm:p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        {member.avatar_url && (
                          <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0"
                               style={{ width: '2rem', height: '2rem', minWidth: '2rem' }}>
                            <img 
                              src={member.avatar_url} 
                              alt={member.name}
                              className="w-full h-full object-cover"
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h3 className="font-semibold truncate">{member.display_name}</h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.name}</p>
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-2">
                        <div 
                          className="bg-purple-500 h-2.5 rounded-full" 
                          style={{ width: `${Math.max(percentage, 0.5)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="truncate">{formatTime(member[timeframeKey])}</span>
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
                
                {sortedMembers.length > 5 && (
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                    <button 
                      onClick={() => setActiveTab('detail')}
                      className="text-purple-500 hover:underline"
                    >
                      + {sortedMembers.length - 5} more members
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center py-4">No fronting data available for this timeframe.</p>
            )}
          </div>
          
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h2 className="text-lg sm:text-xl font-semibold mb-3">Switch Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Switches</p>
                <p className="text-lg sm:text-xl font-bold">{switchMetrics.timeframes[timeframeKey]}</p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Avg. Per Day</p>
                <p className="text-lg sm:text-xl font-bold">{switchMetrics.avg_switches_per_day.toFixed(1)}</p>
              </div>
              
              <div className="p-3 bg-white dark:bg-gray-800 rounded shadow col-span-2 sm:col-span-1">
                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Active Members</p>
                <p className="text-lg sm:text-xl font-bold">{sortedMembers.filter(m => m[timeframeKey] > 0).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Detail Tab */}
      {activeTab === 'detail' && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Detailed Member Stats</h2>
          
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <div className="overflow-hidden border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">Member</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Time</th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">Percentage</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedMembers.map(member => {
                      // Calculate percentage for this timeframe
                      const timeframeSeconds = Object.values(frontingMetrics.timeframes[timeframeKey]).reduce((sum, val) => sum + val, 0);
                      const percentage = timeframeSeconds > 0 ? (member[timeframeKey] / timeframeSeconds) * 100 : 0;
                      
                      if (member[timeframeKey] <= 0) return null;
                      
                      return (
                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              {member.avatar_url && (
                                <div className="rounded-full overflow-hidden mr-3 flex-shrink-0" 
                                     style={{ width: '1.75rem', height: '1.75rem', minWidth: '1.75rem' }}>
                                  <img 
                                    src={member.avatar_url} 
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                                  />
                                </div>
                              )}
                              <div className="max-w-[120px] sm:max-w-full overflow-hidden">
                                <div className="font-medium truncate">{member.display_name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-sm">{formatTime(member[timeframeKey])}</td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm">{percentage.toFixed(1)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Switches Tab */}
      {activeTab === 'switches' && (
        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Switch Frequency</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
            <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last 24h</p>
              <p className="text-lg sm:text-xl font-bold">{switchMetrics.timeframes['24h']}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last 48h</p>
              <p className="text-lg sm:text-xl font-bold">{switchMetrics.timeframes['48h']}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last 5d</p>
              <p className="text-lg sm:text-xl font-bold">{switchMetrics.timeframes['5d']}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last 7d</p>
              <p className="text-lg sm:text-xl font-bold">{switchMetrics.timeframes['7d']}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-800 rounded shadow col-span-2 sm:col-span-1">
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Last 30d</p>
              <p className="text-lg sm:text-xl font-bold">{switchMetrics.timeframes['30d']}</p>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Average Switch Frequency</h3>
            <p className="text-xl sm:text-2xl font-bold">{switchMetrics.avg_switches_per_day.toFixed(1)} <span className="text-xs sm:text-sm font-normal text-gray-500 dark:text-gray-400">switches per day</span></p>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Based on {switchMetrics.total_switches} switches over the past {days} days.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <Link to="/" className="text-blue-500 dark:text-blue-400">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Metrics;