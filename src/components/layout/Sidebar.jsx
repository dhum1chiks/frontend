import React from 'react';

const Sidebar = ({ teams, selectedTeam, setSelectedTeam, setSelectedAssignee, handleLogout }) => (
  <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar p-6 md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 overflow-y-auto rounded-xl shadow-card">
    <div className="flex items-center mb-8">
      <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-accent font-bold text-xl shadow-lg">TM</div>
      <span className="ml-3 text-2xl font-semibold text-accent">Task Flow</span>
    </div>
    <nav className="space-y-4">
      <h3 className="text-xs font-medium text-accent mb-2">Teams</h3>
      <ul className="space-y-2">
        {teams.map((team) => (
          <li key={team.id} className="rounded-xl hover:bg-primary/20">
            <button
              onClick={() => {
                setSelectedTeam(team.id.toString());
                setSelectedAssignee('');
              }}
              className={`text-left w-full py-2 px-4 text-base rounded-xl transition font-medium ${selectedTeam === team.id.toString() ? 'bg-primary text-accent shadow-card' : 'text-accent'}`}
            >
              {team.name}
              <span className="text-xs text-primary block">{(team.members || []).length} members</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 space-y-2">
        <button
          onClick={() => {
            setSelectedTeam('');
            setSelectedAssignee('');
          }}
          className="block w-full text-left py-2 px-4 text-accent text-base hover:bg-primary/10 rounded-xl"
        >
          All Teams
        </button>
        <button
          onClick={handleLogout}
          className="block w-full text-left py-2 px-4 text-primary text-base hover:bg-primary/30 rounded-xl"
        >
          Logout
        </button>
      </div>
    </nav>
  </aside>
);

export default Sidebar;
