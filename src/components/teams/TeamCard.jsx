import React from 'react';
import UserAvatar from '../users/UserAvatar';

const TeamCard = ({ team, onDelete, onAddMember, onInviteMember, onRemoveMember, onOpenChat, loggedInUserId }) => (
  <div className="bg-card p-6 rounded-xl shadow-card border border-primary flex flex-col justify-between">
    <div>
      <h3 className="text-xl font-bold text-primary mb-2">{team.name}</h3>
      <p className="text-text text-base mb-2">{team.members?.length || 0} members</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {(team.members || []).map((member) => (
          <div key={member.id} className="inline-flex items-center">
            <UserAvatar
              username={member.username}
              avatarUrl={member.avatar_url}
              size="w-8 h-8"
              textSize="text-sm"
            />
            {/* Remove Member button for creator */}
            {team.created_by === loggedInUserId && member.id !== team.created_by && (
              <button
                className="ml-1 text-xs text-red-600 hover:text-red-800"
                onClick={() => onRemoveMember(team.id, member.id)}
                title={`Remove ${member.username}`}
              >
                ✕
              </button>
            )}
            {/* Leave Team button for logged-in member (not creator) */}
            {member.id === loggedInUserId && team.created_by !== loggedInUserId && (
              <button
                className="ml-1 text-xs text-yellow-600 hover:text-yellow-800"
                onClick={() => onRemoveMember(team.id, loggedInUserId)}
                title="Leave Team"
              >
                Leave
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
    <div className="mt-4 flex flex-wrap gap-2">
      <button className="bg-blue-500 text-white px-4 py-2 rounded-xl shadow-card hover:bg-blue-600" onClick={() => onOpenChat(team)}>
        💬 Chat
      </button>
      <button className="bg-primary text-accent px-4 py-2 rounded-xl shadow-card hover:bg-primary/80" onClick={() => onAddMember(team)}>
        Add Member
      </button>
      <button className="bg-primary text-accent px-4 py-2 rounded-xl shadow-card hover:bg-primary/80" onClick={() => onInviteMember(team)}>
        Invite Member
      </button>
      <button className="bg-red-600 text-accent px-4 py-2 rounded-xl shadow-card hover:bg-red-700" onClick={() => onDelete(team.id)}>
        Delete
      </button>
      {/* Prominent Leave Team button for logged-in member (not creator) */}
      {team.members?.some(m => m.id === loggedInUserId) && team.created_by !== loggedInUserId && (
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded-xl shadow-card hover:bg-yellow-600"
          onClick={() => onRemoveMember(team.id, loggedInUserId)}
          title="Leave Team"
        >
          Leave Team
        </button>
      )}
    </div>
  </div>
);

export default TeamCard;