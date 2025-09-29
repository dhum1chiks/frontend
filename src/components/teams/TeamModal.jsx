import React from 'react';

const TeamModal = ({ isOpen, onClose, onSubmit, teamForm, setTeamForm }) => (
  isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <form onSubmit={onSubmit} className="bg-card p-8 rounded-xl shadow-card border border-primary w-full max-w-md">
        <h2 className="text-xl font-bold text-primary mb-6">Create/Edit Team</h2>
        <input
          type="text"
          placeholder="Team Name"
          value={teamForm.name}
          onChange={e => setTeamForm({ ...teamForm, name: e.target.value })}
          className="w-full mb-6 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <div className="flex space-x-3">
          <button type="submit" className="bg-primary text-accent px-5 py-3 rounded-xl shadow-card hover:bg-primary/80">Save</button>
          <button type="button" className="bg-gray-300 text-primary px-5 py-3 rounded-xl shadow-card hover:bg-gray-400" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  ) : null
);

export default TeamModal;
