import React from 'react';

const ErrorAlert = ({ error, onClose }) => (
  error ? (
    <div className="mb-4 p-4 bg-red-900 border-l-4 border-red-500 rounded-r-lg text-red-200 text-sm">
      {error}
      <button onClick={onClose} className="ml-2 text-red-200 hover:text-red-100">Dismiss</button>
    </div>
  ) : null
);

export default ErrorAlert;
