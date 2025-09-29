import React from 'react';
import { Menu, Search, Plus } from 'lucide-react';

const Header = ({ searchQuery, setSearchQuery, selectedTeam, setSelectedTeam, selectedAssignee, setSelectedAssignee, teams, allAssignees, setIsModalOpen, setTeamForm, setIsTeamModalOpen }) => (
  <header className="sticky top-0 bg-accent shadow-card p-6 z-10 rounded-xl mb-4">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center justify-between sm:flex-1 sm:mr-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-primary w-5 h-5" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-primary bg-card text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 w-full sm:w-auto">
        <select
          value={selectedTeam}
          onChange={(e) => {
            setSelectedTeam(e.target.value);
            setSelectedAssignee('');
          }}
          className="w-full sm:w-40 p-3 rounded-xl border border-primary bg-card text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <select
          value={selectedAssignee}
          onChange={(e) => setSelectedAssignee(e.target.value)}
          className="w-full sm:w-40 p-3 rounded-xl border border-primary bg-card text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Assignees</option>
          {(selectedTeam
            ? teams.find((t) => t.id === parseInt(selectedTeam, 10))?.members || []
            : allAssignees
          ).map((member) => (
            <option key={member.id} value={member.id}>{member.username}</option>
          ))}
        </select>
        <button
          className="w-full sm:w-auto bg-primary text-accent px-5 py-3 rounded-xl flex items-center justify-center hover:bg-primary/80 transition-colors text-base shadow-card"
          onClick={() => {
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" /> New Task
        </button>
        <button
          className="w-full sm:w-auto bg-primary text-accent px-5 py-3 rounded-xl flex items-center justify-center hover:bg-primary/80 transition-colors text-base shadow-card"
          onClick={() => {
            setTeamForm({ name: '' });
            setIsTeamModalOpen(true);
          }}
        >
          <Plus className="w-5 h-5 mr-2" /> New Team
        </button>
      </div>
    </div>
  </header>
);

export default Header;
