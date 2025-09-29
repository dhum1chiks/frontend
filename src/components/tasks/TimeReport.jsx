import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Calendar, User, BarChart3 } from 'lucide-react';

const API_BASE_URL = 'https://backend-xc4z.vercel.app/';

const TimeReport = ({ isOpen, onClose }) => {
  const [timeData, setTimeData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [teams, setTeams] = useState([]);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 7 days
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (isOpen) {
      fetchTeams();
      fetchTimeReport();
    }
  }, [isOpen, selectedTeam, dateRange]);

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/teams`, { withCredentials: true });
      setTeams(res.data);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    }
  };

  const fetchTimeReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        ...(selectedTeam && { teamId: selectedTeam })
      });

      // Since we don't have a dedicated report endpoint, we'll fetch tasks and their time logs
      const tasksRes = await axios.get(`${API_BASE_URL}/tasks/get-task?${selectedTeam ? `team_id=${selectedTeam}` : ''}`, { withCredentials: true });
      const tasks = tasksRes.data;

      const timePromises = tasks.map(async (task) => {
        try {
          const timeRes = await axios.get(`${API_BASE_URL}/tasks/${task.id}/time`, { withCredentials: true });
          return {
            ...task,
            timeData: timeRes.data
          };
        } catch (err) {
          return { ...task, timeData: { logs: [], totalMinutes: 0, totalHours: 0 } };
        }
      });

      const tasksWithTime = await Promise.all(timePromises);
      
      // Filter by date range
      const filteredTasks = tasksWithTime.map(task => ({
        ...task,
        timeData: {
          ...task.timeData,
          logs: task.timeData.logs.filter(log => {
            const logDate = new Date(log.start_time).toISOString().split('T')[0];
            return logDate >= dateRange.startDate && logDate <= dateRange.endDate;
          })
        }
      })).map(task => ({
        ...task,
        timeData: {
          ...task.timeData,
          totalMinutes: task.timeData.logs.reduce((sum, log) => sum + (log.duration_minutes || 0), 0)
        }
      })).filter(task => task.timeData.totalMinutes > 0);

      setTimeData(filteredTasks);
    } catch (err) {
      console.error('Failed to fetch time report:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getTotalTime = () => {
    return timeData.reduce((sum, task) => sum + task.timeData.totalMinutes, 0);
  };

  const getTopTasks = () => {
    return timeData
      .sort((a, b) => b.timeData.totalMinutes - a.timeData.totalMinutes)
      .slice(0, 5);
  };

  const getUserStats = () => {
    const userStats = {};
    timeData.forEach(task => {
      task.timeData.logs.forEach(log => {
        if (!userStats[log.username]) {
          userStats[log.username] = 0;
        }
        userStats[log.username] += log.duration_minutes || 0;
      });
    });
    return Object.entries(userStats)
      .map(([username, minutes]) => ({ username, minutes }))
      .sort((a, b) => b.minutes - a.minutes);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg border w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Time Tracking Report
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
            <select
              value={selectedTeam}
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading report...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-blue-600">Total Time</p>
                    <p className="text-2xl font-bold text-blue-800">{formatTime(getTotalTime())}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm text-green-600">Tasks Worked On</p>
                    <p className="text-2xl font-bold text-green-800">{timeData.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-center">
                  <User className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm text-purple-600">Contributors</p>
                    <p className="text-2xl font-bold text-purple-800">{getUserStats().length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Tasks */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Top Tasks by Time</h3>
              <div className="space-y-2">
                {getTopTasks().map(task => (
                  <div key={task.id} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{task.title}</p>
                      <p className="text-sm text-gray-600">{task.status} • {task.priority} Priority</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-800">{formatTime(task.timeData.totalMinutes)}</p>
                      <p className="text-sm text-gray-600">{task.timeData.logs.length} sessions</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* User Stats */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Time by User</h3>
              <div className="space-y-2">
                {getUserStats().map(user => (
                  <div key={user.username} className="bg-gray-50 p-3 rounded-lg flex justify-between items-center">
                    <p className="font-medium text-gray-800">{user.username}</p>
                    <p className="font-bold text-gray-800">{formatTime(user.minutes)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeReport;