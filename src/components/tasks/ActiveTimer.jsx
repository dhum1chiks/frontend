import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Pause } from 'lucide-react';

const API_BASE_URL = 'https://backend-xc4z.vercel.app/';

const ActiveTimer = () => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    fetchActiveTimer();
    const interval = setInterval(fetchActiveTimer, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

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

  const fetchActiveTimer = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/time/active`, { withCredentials: true });
      setActiveTimer(res.data);
    } catch (err) {
      console.error('Failed to fetch active timer:', err);
    }
  };

  const stopTimer = async () => {
    if (!activeTimer) return;
    try {
      await axios.post(`${API_BASE_URL}/tasks/${activeTimer.task_id}/time/stop`, {}, { withCredentials: true });
      setActiveTimer(null);
      setCurrentTime(0);
    } catch (err) {
      console.error('Failed to stop timer:', err);
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}:${mins.toString().padStart(2, '0')}` : `${mins}m`;
  };

  if (!activeTimer) return null;

  return (
    <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-2 flex items-center space-x-2">
      <Clock className="w-4 h-4 text-green-600" />
      <div className="text-sm">
        <div className="font-medium text-green-800">
          {activeTimer.task_title}
        </div>
        <div className="text-green-600 font-mono">
          {formatTime(currentTime)}
        </div>
      </div>
      <button
        onClick={stopTimer}
        className="text-red-600 hover:text-red-800 p-1"
        title="Stop timer"
      >
        <Pause className="w-4 h-4" />
      </button>
    </div>
  );
};

export default ActiveTimer;