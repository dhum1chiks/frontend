import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://backend-xc4z.vercel.app';

const InviteMemberModal = ({ teamId, isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await axios.post(`${API_BASE_URL}/teams/${teamId}/invite`, { email }, { withCredentials: true });
      setMessage(res.data.message || 'Invitation sent!');
    } catch (err) {
      setMessage(err.response?.data?.error || 'Error inviting user');
    } finally {
      setLoading(false);
    }
  };
  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <form onSubmit={handleInvite} className="bg-card p-8 rounded-xl shadow-card border border-primary w-full max-w-md">
        <h2 className="text-xl font-bold text-primary mb-6">Invite Member by Email</h2>
        <input
          type="email"
          placeholder="User email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full mb-6 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <div className="flex space-x-3 mb-4">
          <button type="submit" className="bg-primary text-accent px-5 py-3 rounded-xl shadow-card hover:bg-primary/80 font-bold text-lg" disabled={loading}>{loading ? 'Inviting...' : 'Invite'}</button>
          <button type="button" className="bg-gray-300 text-primary px-5 py-3 rounded-xl shadow-card hover:bg-gray-400 font-bold text-lg" onClick={onClose}>Close</button>
        </div>
        {message && <div className="text-primary font-semibold mt-2">{message}</div>}
      </form>
    </div>
  ) : null;
};

export default InviteMemberModal;
