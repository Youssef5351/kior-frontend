import React, { useState, useEffect } from 'react';
import { Users, Clock, FileText, Calendar, TrendingUp, Award, PieChart } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const TeamStatistics = () => {
  const { id: projectId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('minutes'); // 'minutes' or 'sessions'

  // Navigation buttons configuration
  const navigationButtons = [
    { label: 'Project Dashboard', path: `/projects/${projectId}` },
    { label: 'Duplicate Detection', path: `/projects/${projectId}/duplicates` },
    { label: 'Abstract Screening', path: `/projects/${projectId}/screening` },
    { label: 'Full-Text Review', path: `/projects/${projectId}/full-text` },
    { label: 'Team Statistics', path: `/projects/${projectId}/team-stats` }
  ];
  
  useEffect(() => {
    if (projectId) {
      fetchTeamStats();
    }
  }, [projectId, timeRange]);

  const fetchTeamStats = async () => {
    if (!projectId) {
      console.error('No projectId provided');
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/projects/${projectId}/team-stats?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Team stats received:', data);
        setStats(data);
      } else {
        console.error('Failed to fetch team stats:', response.status);
      }
    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  // Generate colors for the pie chart
  const generateColors = (count) => {
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
      '#14B8A6', '#F43F5E', '#8B5CF6', '#06B6D4', '#84CC16'
    ];
    return colors.slice(0, count);
  };

  // Prepare data for pie chart
  const getPieChartData = () => {
    const activeUsers = stats.filter(user => 
      chartType === 'minutes' ? user.totalMinutes > 0 : user.sessionCount > 0
    );

    const total = activeUsers.reduce((sum, user) => 
      sum + (chartType === 'minutes' ? user.totalMinutes : user.sessionCount), 0
    );

    return activeUsers.map((user, index) => {
      const value = chartType === 'minutes' ? user.totalMinutes : user.sessionCount;
      const percentage = total > 0 ? (value / total) * 100 : 0;
      
      return {
        userId: user.userId,
        name: `${user.firstName} ${user.lastName}`,
        value: value,
        percentage: percentage,
        color: generateColors(activeUsers.length)[index],
        formattedValue: chartType === 'minutes' ? formatDuration(value) : `${value} sessions`
      };
    }).sort((a, b) => b.value - a.value);
  };

  const PieChartComponent = ({ data, size = 200 }) => {
    const radius = size / 2;
    const strokeWidth = 30;
    const innerRadius = radius - strokeWidth;
    const circumference = 2 * Math.PI * innerRadius;

    let accumulatedAngle = 0;

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {data.map((item, index) => {
            const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
            const strokeDashoffset = -((accumulatedAngle / 360) * circumference);
            
            accumulatedAngle += (item.percentage / 100) * 360;

            return (
              <circle
                key={item.userId}
                cx={radius}
                cy={radius}
                r={innerRadius}
                fill="none"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out"
              />
            );
          })}
        </svg>
        
        {/* Center text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {chartType === 'minutes' 
                ? formatDuration(data.reduce((sum, item) => sum + item.value, 0))
                : data.reduce((sum, item) => sum + item.value, 0)
              }
            </div>
            <div className="text-sm text-gray-500 capitalize">
              Total {chartType}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!projectId) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-600">Loading team statistics...</p>
        </div>
      </div>
    );
  }

  const pieChartData = getPieChartData();

  return (
    <div className="space-y-6 font-bricolage">
      {/* Navigation Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          {navigationButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => navigate(button.path)}
              className="px-5 py-3 text-xs font-medium cursor-pointer text-black hover:text-black hover:bg-gray-50 rounded-md transition-colors duration-200"
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pt-16">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Statistics</h2>
          <p className="text-gray-600">Track your team's screening progress and activity</p>
        </div>
        
        {/* Time Range Filter */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          {[
            { value: 'week', label: 'This Week' },
            { value: 'month', label: 'This Month' },
            { value: 'all', label: 'All Time' }
          ].map((range) => (
            <button
              key={range.value}
              onClick={() => setTimeRange(range.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                timeRange === range.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Screening Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatDuration(stats.reduce((total, user) => total + user.totalMinutes, 0))}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Articles Screened</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.reduce((total, user) => total + user.articlesScreened, 0)}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sessions</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.reduce((total, user) => total + user.sessionCount, 0)}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Team Members</p>
              <p className="text-2xl font-bold text-gray-900">{stats.length}</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900">Distribution</h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setChartType('minutes')}
                className={`px-3 py-1 text-sm rounded-md transition-all ${
                  chartType === 'minutes'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Time
              </button>
              <button
                onClick={() => setChartType('sessions')}
                className={`px-3 cursor-pointer py-1 text-sm rounded-md transition-all ${
                  chartType === 'sessions'
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Sessions
              </button>
            </div>
          </div>

          {pieChartData.length > 0 ? (
            <div className="flex flex-col items-center">
              <PieChartComponent data={pieChartData} size={200} />
              
              {/* Legend */}
              <div className="mt-6 w-full space-y-2 max-h-48 overflow-y-auto">
                {pieChartData.map((item) => (
                  <div key={item.userId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gray-700 truncate max-w-[120px]">
                        {item.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{item.formattedValue}</div>
                      <div className="text-xs text-gray-500">{item.percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <PieChart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No data available for chart</p>
            </div>
          )}
        </div>

        {/* Bar Charts */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Screening Distribution</h4>
            <div className="space-y-3">
              {stats
                .filter(user => user.articlesScreened > 0)
                .sort((a, b) => b.articlesScreened - a.articlesScreened)
                .map((user) => (
                  <div key={user.userId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {user.firstName} {user.lastName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(user.articlesScreened / Math.max(...stats.map(u => u.articlesScreened))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-8">{user.articlesScreened}</span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Time Spent Screening</h4>
            <div className="space-y-3">
              {stats
                .filter(user => user.totalMinutes > 0)
                .sort((a, b) => b.totalMinutes - a.totalMinutes)
                .map((user) => (
                  <div key={user.userId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {user.firstName} {user.lastName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(user.totalMinutes / Math.max(...stats.map(u => u.totalMinutes || 1))) * 100}%` 
                          }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-16 text-right">
                        {formatDuration(user.totalMinutes)}
                      </span>
                    </div>
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Team Performance</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Team Member</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Screening Time</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Sessions</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Articles Screened</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Avg. Time/Article</th>
                <th className="text-left py-3 px-6 text-sm font-medium text-gray-600">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.map((user, index) => (
                <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      {index === 0 && user.articlesScreened > 0 && (
                        <Award className="w-4 h-4 text-yellow-500" />
                      )}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2 text-black">
                      <span className="font-medium">{formatDuration(user.totalMinutes)}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {user.sessionCount} sessions
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="font-medium text-gray-900">{user.articlesScreened}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {user.articlesScreened > 0 
                        ? formatDuration(user.totalMinutes / user.articlesScreened)
                        : 'N/A'
                      }
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-sm text-gray-600">
                      {user.lastActivity ? new Date(user.lastActivity).toLocaleDateString() : 'Never'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {stats.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No team activity data available yet.</p>
            <p className="text-sm text-gray-400">Start screening articles to see statistics.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamStatistics;