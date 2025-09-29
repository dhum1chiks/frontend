import React from 'react';

const AddMemberModal = ({ team, isOpen, onClose, onSubmit, addMemberForm, setAddMemberForm, users }) => (
  isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <form onSubmit={onSubmit} className="bg-card p-8 rounded-xl shadow-card border border-primary w-full max-w-md">
        <h2 className="text-xl font-bold text-primary mb-6">Add Member to {team?.name}</h2>
        <select
          value={addMemberForm.userId}
          onChange={e => setAddMemberForm({ userId: e.target.value })}
          className="w-full mb-6 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.username}</option>
          ))}
        </select>
        <div className="flex space-x-3">
          <button type="submit" className="bg-primary text-accent px-5 py-3 rounded-xl shadow-card hover:bg-primary/80">Add Member</button>
          <button type="button" className="bg-gray-300 text-primary px-5 py-3 rounded-xl shadow-card hover:bg-gray-400" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  ) : null
);

export default AddMemberModal;