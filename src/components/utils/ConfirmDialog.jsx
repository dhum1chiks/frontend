import React from 'react';

const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-gray-800 p-6 rounded-lg shadow text-gray-200">
      <p className="mb-4">{message}</p>
      <div className="flex space-x-2">
        <button className="btn btn-primary" onClick={onConfirm}>Yes</button>
        <button className="btn" onClick={onCancel}>No</button>
      </div>
    </div>
  </div>
);

export default ConfirmDialog;
