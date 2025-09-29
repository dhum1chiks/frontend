import React, { useState } from 'react';
import { Calendar, Target, Users, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const MilestoneCard = ({ milestone, onEdit, onDelete, onViewTasks }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-500';
      case 'In Progress':
        return 'bg-blue-500';
      case 'Overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Progress':
        return <Clock className="w-4 h-4" />;
      case 'Overdue':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'text-red-600 bg-red-100';
      case 'Medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'Low':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = milestone.due_date && new Date(milestone.due_date) < new Date() && milestone.status !== 'Completed';

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800 mb-2">{milestone.title}</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 mr-1" />
              <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                {formatDate(milestone.due_date)}
              </span>
            </div>
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              <span>{milestone.team_name}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(milestone.priority)}`}>
            {milestone.priority} Priority
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-bold text-gray-800">{milestone.progress_percentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              milestone.progress_percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${milestone.progress_percentage}%` }}
          ></div>
        </div>
      </div>

      {/* Status and Task Count */}
      <div className="flex justify-between items-center mb-4">
        <div className={`inline-flex items-center px-3 py-1 text-sm font-semibold text-white rounded-full ${getStatusColor(milestone.status)}`}>
          {getStatusIcon(milestone.status)}
          <span className="ml-1">{milestone.status}</span>
        </div>
        <div className="text-sm text-gray-600">
          {milestone.completed_tasks || 0} / {milestone.total_tasks || 0} tasks completed
        </div>
      </div>

      {/* Description */}
      {milestone.description && (
        <div className="mb-4">
          <p className="text-gray-600 text-sm line-clamp-2">{milestone.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {showDetails ? 'Hide Details' : 'Show Details'}
        </button>
        <div className="flex space-x-2">
          <button
            onClick={() => onViewTasks(milestone)}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
          >
            View Tasks
          </button>
          <button
            onClick={() => onEdit(milestone)}
            className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(milestone.id)}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {showDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Created by:</span>
              <p className="text-gray-600">{milestone.created_by_name}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <p className="text-gray-600">{new Date(milestone.created_at).toLocaleDateString()}</p>
            </div>
            {milestone.description && (
              <div className="col-span-2">
                <span className="font-medium text-gray-700">Description:</span>
                <p className="text-gray-600 mt-1">{milestone.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneCard;