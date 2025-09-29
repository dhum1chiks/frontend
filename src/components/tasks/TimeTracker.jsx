import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Play, Pause, Clock, Trash2 } from 'lucide-react';

const API_BASE_URL = 'https://backend-xc4z.vercel.app/';

const TimeTracker = ({ taskId, taskTitle }) => {
  const [timeLogs, setTimeLogs] = useState([]);
  const [totalTime, setTotalTime] = useState({ minutes: 0, hours: 0 });
  const [activeTimer, setActiveTimer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [description, setDescription] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTimeLogs();
    fetchActiveTimer();
  }, [taskId]);

  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        const startTime = new Date(activeTimer.start_time);
        const now = new Date();
        const diffMinutes = Math.floor((now - startTime) / (1000 * 60));
        setCurrentTime(diffMinutes);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const fetchTimeLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/${taskId}/time`, { withCredentials: true });
      setTimeLogs(res.data.logs);
      setTotalTime({ minutes: res.data.totalMinutes, hours: res.data.totalHours });
    } catch (err) {
      console.error('Failed to fetch time logs:', err);
    }
  };

  const fetchActiveTimer = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/time/active`, { withCredentials: true });
      if (res.data && res.data.task_id === taskId) {
        setActiveTimer(res.data);
      } else {
        setActiveTimer(null);
      }
    } catch (err) {
      console.error('Failed to fetch active timer:', err);
    }
  };

  const startTimer = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/tasks/${taskId}/time/start`, 
        { description }, 
        { withCredentials: true }
      );
      setActiveTimer(res.data);
      setDescription('');
      fetchTimeLogs();
    } catch (err) {
      console.error('Failed to start timer:', err);
      alert(err.response?.data?.error || 'Failed to start timer');
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async () => {
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/tasks/${taskId}/time/stop`, {}, { withCredentials: true });
      setActiveTimer(null);
      setCurrentTime(0);
      fetchTimeLogs();
    } catch (err) {
      console.error('Failed to stop timer:', err);
      alert(err.response?.data?.error || 'Failed to stop timer');
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeLog = async (logId) => {
    if (!window.confirm('Delete this time log?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/tasks/time/${logId}`, { withCredentials: true });
      fetchTimeLogs();
    } catch (err) {
      console.error('Failed to delete time log:', err);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDuration = (startTime, endTime) => {
    if (!endTime) return 'In progress...';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMinutes = Math.floor((end - start) / (1000 * 60));
    return formatTime(diffMinutes);
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border">
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-semibold text-gray-800 flex items-center">
          <Clock className="w-4 h-4 mr-2" />
          Time Tracking
        </h5>
        <div className="text-sm text-gray-600">
          Total: {formatTime(totalTime.minutes)}
        </div>
      </div>

      {/* Timer Controls */}
      <div className="mb-4">
        {activeTimer ? (
          <div className="bg-green-100 p-3 rounded-lg border border-green-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Timer Running</span>
              <span className="text-lg font-mono text-green-800">
                {formatTime(currentTime)}
              </span>
            </div>
            {activeTimer.description && (
              <p className="text-sm text-green-700 mb-2">{activeTimer.description}</p>
            )}
            <button
              onClick={stopTimer}
              disabled={loading}
              className="bg-red-500 text-white px-3 py-1 rounded flex items-center hover:bg-red-600 disabled:opacity-50"
            >
              <Pause className="w-4 h-4 mr-1" />
              Stop Timer
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="What are you working on? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={startTimer}
              disabled={loading}
              className="bg-green-500 text-white px-3 py-2 rounded flex items-center hover:bg-green-600 disabled:opacity-50"
            >
              <Play className="w-4 h-4 mr-1" />
              Start Timer
            </button>
          </div>
        )}
      </div>

      {/* Time Logs */}
      <div>
        <button
          onClick={() => setShowLogs(!showLogs)}
          className="text-blue-600 hover:underline text-sm font-medium mb-2"
        >
          {showLogs ? 'Hide' : 'Show'} Time Logs ({timeLogs.length})
        </button>

        {showLogs && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {timeLogs.length === 0 ? (
              <p className="text-sm text-gray-500">No time logs yet</p>
            ) : (
              timeLogs.map(log => (
                <div key={log.id} className="bg-white p-3 rounded border text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-800">{log.username}</span>
                      <span className="text-gray-500">
                        {formatDuration(log.start_time, log.end_time)}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTimeLog(log.id)}
                      className="text-red-500 hover:text-red-700"
                      title="Delete time log"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  {log.description && (
                    <p className="text-gray-600 text-xs mb-1">{log.description}</p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(log.start_time).toLocaleString()}
                    {log.end_time && ` - ${new Date(log.end_time).toLocaleString()}`}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeTracker;