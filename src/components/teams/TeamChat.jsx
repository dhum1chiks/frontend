import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import { Send, Trash2, MessageCircle } from 'lucide-react';
import UserAvatar from '../users/UserAvatar';

const API_BASE_URL = 'https://backend-xc4z.vercel.app';

const TeamChat = ({ team, isOpen, onClose, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [pusher, setPusher] = useState(null);
  const [channel, setChannel] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && team) {
      fetchMessages();
    }
  }, [isOpen, team]);

  useEffect(() => {
    if (isOpen && team) {
      // Initialize Pusher
      const pusherInstance = new Pusher('c30f759d527210673c85', {
        cluster: 'ap1'
      });

      // Subscribe to team channel
      const teamChannel = pusherInstance.subscribe(`team-${team.id}`);

      // Bind to new message events
      teamChannel.bind('new-message', (data) => {
        console.log('New message received:', data);
        setMessages(prev => [...prev, data]);
        scrollToBottom();
      });

      // Bind to message deleted events
      teamChannel.bind('message-deleted', (data) => {
        console.log('Message deleted:', data);
        setMessages(prev => prev.filter(msg => msg.id !== data.messageId));
      });

      setPusher(pusherInstance);
      setChannel(teamChannel);

      return () => {
        if (teamChannel) {
          teamChannel.unbind_all();
          pusherInstance.unsubscribe(`team-${team.id}`);
        }
        if (pusherInstance) {
          pusherInstance.disconnect();
        }
      };
    }
  }, [isOpen, team]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/teams/${team.id}/messages`, { withCredentials: true });
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/teams/${team.id}/messages`, {
        message: newMessage.trim()
      }, { withCredentials: true });
      
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/teams/messages/${messageId}`, { withCredentials: true });
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[100]">
      <div className="bg-white rounded-xl shadow-lg border w-full max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            {team?.name} Chat
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.user_id === currentUserId;
              return (
                <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
                  <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-xs`}>
                    <div className={`flex items-center space-x-2 mb-1 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className="font-medium text-gray-800 text-sm">{msg.username}</span>
                      <span className="text-xs text-gray-500">{formatTime(msg.created_at)}</span>
                      {isCurrentUser && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete message"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <div className={`rounded-lg p-3 text-sm ${
                      isCurrentUser
                        ? 'bg-purple-500 text-white'
                        : 'bg-blue-100 text-gray-800'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="border-t p-4">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
              maxLength="1000"
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              className="bg-blue-500 text-white px-4 py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamChat;