import React from 'react';
import { Target, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

const MilestoneProgress = ({ milestones }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'Overdue':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'border-green-500 bg-green-50';
      case 'In Progress':
        return 'border-blue-500 bg-blue-50';
      case 'Overdue':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const sortedMilestones = [...milestones].sort((a, b) => {
    if (!a.due_date && !b.due_date) return 0;
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date) - new Date(b.due_date);
  });

  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'Completed').length;
  const overallProgress = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Target className="w-5 h-5 mr-2 text-blue-600" />
          Milestone Progress
        </h3>
        <div className="text-sm text-gray-600">
          {completedMilestones} of {totalMilestones} completed
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-800">{overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              overallProgress === 100 ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Milestone Timeline */}
      <div className="space-y-4">
        {sortedMilestones.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No milestones yet</p>
            <p className="text-sm">Create your first milestone to track progress</p>
          </div>
        ) : (
          sortedMilestones.map((milestone, index) => (
            <div key={milestone.id} className="relative">
              {/* Timeline line */}
              {index < sortedMilestones.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-300"></div>
              )}
              
              <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 ${getStatusColor(milestone.status)}`}>
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(milestone.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-800 truncate">{milestone.title}</h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {milestone.progress_percentage}%
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {milestone.due_date 
                        ? new Date(milestone.due_date).toLocaleDateString()
                        : 'No due date'
                      }
                    </span>
                    <span className="text-xs">
                      {milestone.completed_tasks || 0}/{milestone.total_tasks || 0} tasks
                    </span>
                  </div>
                  
                  {/* Mini progress bar */}
                  <div className="w-full bg-white rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        milestone.progress_percentage === 100 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${milestone.progress_percentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {milestones.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-600">
                {milestones.filter(m => m.status === 'Completed').length}
              </div>
              <div className="text-xs text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600">
                {milestones.filter(m => m.status === 'In Progress').length}
              </div>
              <div className="text-xs text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-600">
                {milestones.filter(m => m.status === 'Overdue').length}
              </div>
              <div className="text-xs text-gray-600">Overdue</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MilestoneProgress;