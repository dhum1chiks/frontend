import React from 'react';

const Reminders = ({ reminders }) => (
  reminders.length > 0 ? (
    <div className="mb-4 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg text-yellow-800 text-sm">
      <strong>Upcoming Tasks Due Soon:</strong>
      <ul className="mt-2 space-y-1">
        {reminders.map(task => (
          <li key={task.id} className="flex justify-between items-center">
            <span>{task.title}</span>
            <span className="text-xs">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : null
);

export default Reminders;
