import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Metrics = () => {
  const [frontingMetrics, setFrontingMetrics] = useState(null);
  const [switchMetrics, setSwitchMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeframe, setTimeframe] = useState('30d');
  const [days, setDays] = useState(30);

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
  
  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
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
    return b[timeframe] - a[timeframe];
  });
  
  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">System Metrics</h1>
      
      {/* Time Range Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Time Range:</label>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleDaysChange(1)}
            className={`px-3 py-1 rounded ${days === 1 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 24 Hours
          </button>
          <button 
            onClick={() => handleDaysChange(2)}
            className={`px-3 py-1 rounded ${days === 2 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 48 Hours
          </button>
          <button 
            onClick={() => handleDaysChange(5)}
            className={`px-3 py-1 rounded ${days === 5 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 5 Days
          </button>
          <button 
            onClick={() => handleDaysChange(7)}
            className={`px-3 py-1 rounded ${days === 7 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => handleDaysChange(30)}
            className={`px-3 py-1 rounded ${days === 30 ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            Last 30 Days
          </button>
        </div>
      </div>
      
      {/* Timeframe Selector for Display */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Display Timeframe:</label>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleTimeframeChange('24h')}
            className={`px-3 py-1 rounded ${timeframe === '24h' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            24 Hours
          </button>
          <button 
            onClick={() => handleTimeframeChange('48h')}
            className={`px-3 py-1 rounded ${timeframe === '48h' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            48 Hours
          </button>
          <button 
            onClick={() => handleTimeframeChange('5d')}
            className={`px-3 py-1 rounded ${timeframe === '5d' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            5 Days
          </button>
          <button 
            onClick={() => handleTimeframeChange('7d')}
            className={`px-3 py-1 rounded ${timeframe === '7d' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            7 Days
          </button>
          <button 
            onClick={() => handleTimeframeChange('30d')}
            className={`px-3 py-1 rounded ${timeframe === '30d' ? 'bg-purple-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            30 Days
          </button>
        </div>
      </div>
      
      {/* Switch Frequency Stats */}
      <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Switch Frequency</h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 24h</p>
            <p className="text-xl font-bold">{switchMetrics.timeframes['24h']} switches</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 48h</p>
            <p className="text-xl font-bold">{switchMetrics.timeframes['48h']} switches</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 5d</p>
            <p className="text-xl font-bold">{switchMetrics.timeframes['5d']} switches</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 7d</p>
            <p className="text-xl font-bold">{switchMetrics.timeframes['7d']} switches</p>
          </div>
          <div className="p-3 bg-white dark:bg-gray-800 rounded shadow">
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 30d</p>
            <p className="text-xl font-bold">{switchMetrics.timeframes['30d']} switches</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="text-sm">
            <span className="font-medium">Average:</span> {switchMetrics.avg_switches_per_day.toFixed(2)} switches per day
          </p>
        </div>
      </div>
      
      {/* Fronting Time */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Fronting Time ({timeframe})</h2>
        
        {sortedMembers.length > 0 ? (
          <div className="space-y-4">
            {sortedMembers.map(member => {
              // Calculate percentage for this timeframe
              const timeframeSeconds = Object.values(frontingMetrics.timeframes[timeframe]).reduce((sum, val) => sum + val, 0);
              const percentage = timeframeSeconds > 0 ? (member[timeframe] / timeframeSeconds) * 100 : 0;
              
              return (
                <div key={member.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    {member.avatar_url && (
                      <div className="w-10 h-10 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        <img 
                          src={member.avatar_url} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold">{member.display_name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{member.name}</p>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-purple-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.max(percentage, 0.5)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>{formatTime(member[timeframe])}</span>
                    <span>{percentage.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center py-4">No fronting data available for this timeframe.</p>
        )}
      </div>
      
      {/* All Timeframes Data */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">24h</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">48h</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">5d</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">7d</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">30d</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sortedMembers.map(member => (
              <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {member.avatar_url && (
                      <div className="w-8 h-8 rounded-full overflow-hidden mr-3 flex-shrink-0">
                        <img 
                          src={member.avatar_url} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{member.display_name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{member.name}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{formatTime(member['24h'])}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatTime(member['48h'])}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatTime(member['5d'])}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatTime(member['7d'])}</td>
                <td className="px-6 py-4 whitespace-nowrap">{formatTime(member['30d'])}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-medium">{formatTime(member.total_seconds)}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">({member.total_percent.toFixed(1)}%)</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <Link to="/" className="text-blue-500 dark:text-blue-400">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
};

export default Metrics;