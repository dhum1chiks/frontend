import React from 'react';

const TeamList = ({ teams, onSelectTeam }) => (
  <ul className="space-y-2">
    {teams.map(team => (
      <li key={team.id}>
        <button
          className="w-full text-left py-2 px-3 rounded hover:bg-gray-700"
          onClick={() => onSelectTeam(team.id)}
        >
          {team.name} <span className="text-xs text-gray-500">({team.members?.length || 0} members)</span>
        </button>
      </li>
    ))}
  </ul>
);

export default TeamList;
