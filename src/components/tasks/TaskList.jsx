import React from 'react';

const TaskList = ({ tasks, onEdit, onDelete }) => (
  <div className="grid gap-4">
    {tasks.map(task => (
      <div key={task.id} className="bg-gray-800 p-4 rounded-lg shadow">
        <h4 className="text-base font-semibold text-gray-200 mb-2">{task.title}</h4>
        <p className="text-gray-400 text-sm mb-2">{task.description}</p>
        <div className="flex space-x-2">
          <button className="text-blue-400" onClick={() => onEdit(task)}>Edit</button>
          <button className="text-red-400" onClick={() => onDelete(task.id)}>Delete</button>
        </div>
      </div>
    ))}
  </div>
);

export default TaskList;
