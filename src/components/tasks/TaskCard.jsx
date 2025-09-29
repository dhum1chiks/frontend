import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ArrowRight } from 'lucide-react';
import TimeTracker from './TimeTracker';

const API_BASE_URL = 'https://backend-xc4z.vercel.app';

const TaskCard = ({ task, onEdit, onDelete, getAssigneeName }) => {
  const [attachments, setAttachments] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [showTimeTracker, setShowTimeTracker] = useState(false);
  const assigneeName = getAssigneeName ? getAssigneeName(task) : 'Unassigned';
  const assignerName = getAssigneeName ? getAssigneeName(task, 'assigned_by_id') : 'Unknown';
  const dueDate = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
  const statusColor = task.status === 'Done' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-gray-500';
  const priorityColor = task.priority === 'High' ? 'text-red-600' : task.priority === 'Low' ? 'text-blue-600' : 'text-yellow-600';

  const fetchComments = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/tasks/${task.id}/comments`, { withCredentials: true });
      setComments(res.data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  useEffect(() => {
    const fetchAttachments = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/${task.id}/attachments`, { withCredentials: true });
        setAttachments(res.data);
      } catch (err) {
        console.error('Failed to fetch attachments:', err);
      }
    };
    fetchAttachments();
  }, [task.id]);

  useEffect(() => {
    // Always fetch comments on mount for accurate count
    fetchComments();
  }, [task.id]);

  useEffect(() => {
    // This effect is no longer needed since we fetch on mount
  }, [showComments, task.id]);

  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Delete this attachment?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/tasks/attachments/${attachmentId}`, { withCredentials: true });
      setAttachments(attachments.filter(att => att.id !== attachmentId));
    } catch (err) {
      console.error('Failed to delete attachment:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/tasks/${task.id}/comments`, { content: newComment }, { withCredentials: true });
      setNewComment('');
      // Refresh comments to get the latest data
      fetchComments();
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/tasks/comments/${commentId}`, { withCredentials: true });
      // Refresh comments to get the latest data
      fetchComments();
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-card border border-primary">
      <h4 className="text-lg font-bold text-primary mb-2">{task.title}</h4>
      <p className="text-text text-base mb-2">{task.description}</p>
      <div className="mb-2">
        <span className="text-sm text-text">Assigned to: {assigneeName}</span>
      </div>
      <div className="mb-2">
        <span className="text-sm text-text">Assigned by: {assignerName}</span>
      </div>
      <div className="mb-2">
        <span className="text-sm text-text">Due: {dueDate}</span>
      </div>
      <div className="mb-4 flex space-x-2">
        <span className={`inline-block px-2 py-1 text-xs font-semibold text-white rounded-full ${statusColor}`}>
          {task.status}
        </span>
        <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${priorityColor} bg-gray-100`}>
          {task.priority} Priority
        </span>
      </div>
      {attachments.length > 0 && (
        <div className="mb-4">
          <h5 className="text-sm font-semibold text-primary mb-2">Attachments:</h5>
          <div className="space-y-1">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                <span className="text-sm text-gray-700">{att.original_name}</span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => window.open(`${API_BASE_URL}/${att.path}`, '_blank')}
                    className="text-blue-500 hover:text-blue-700 text-sm underline"
                  >
                    Download
                  </button>
                  <button onClick={() => handleDeleteAttachment(att.id)} className="text-red-500 hover:text-red-700 text-sm">×</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mb-4 flex space-x-4">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          💬 {showComments ? 'Hide Comments' : `Comments (${comments.length})`}
        </button>
        <button
          onClick={() => setShowTimeTracker(!showTimeTracker)}
          className="text-green-600 hover:underline text-sm font-medium"
        >
          ⏱️ {showTimeTracker ? 'Hide Timer' : 'Time Tracker'}
        </button>
      </div>
      {showComments && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
          <h5 className="text-sm font-semibold text-primary mb-3">Comments</h5>
          <div className="space-y-3 mb-4">
            {comments.map(comment => (
              <div key={comment.id} className="bg-white p-3 rounded-lg shadow-sm border">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-primary">{comment.username}</span>
                    <span className="text-xs text-gray-500">{new Date(comment.created_at).toLocaleString()}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                    title="Delete comment"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-sm text-gray-800">{comment.content}</p>
              </div>
            ))}
          </div>
          <form onSubmit={handleAddComment} className="flex space-x-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
              title="Send comment"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
      
      {/* Time Tracking Section */}
      <div className="mb-4">
        <TimeTracker taskId={task.id} taskTitle={task.title} />
      </div>
      
      <div className="flex space-x-3">
        <button className="bg-primary text-accent px-4 py-2 rounded-xl shadow-card hover:bg-primary/80" onClick={() => onEdit(task)}>Edit</button>
        <button className="bg-red-600 text-accent px-4 py-2 rounded-xl shadow-card hover:bg-red-700" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </div>
  );
};

export default TaskCard;
