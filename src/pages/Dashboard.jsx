import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { Menu, X, Plus, Search, Edit, Trash2, UserPlus, Trash, Target } from 'lucide-react';
import InviteMemberModal from '../components/teams/InviteMemberModal';
import AddMemberModal from '../components/teams/AddMemberModal';
import TeamCard from '../components/teams/TeamCard';
import TaskCard from '../components/tasks/TaskCard';
import TaskList from '../components/tasks/TaskList';
import TeamList from '../components/teams/TeamList';
import Reminders from '../components/tasks/Reminders';
import TeamModal from '../components/teams/TeamModal';
import TaskModal from '../components/tasks/TaskModal';
import ActiveTimer from '../components/tasks/ActiveTimer';
import TimeReport from '../components/tasks/TimeReport';
import MilestoneCard from '../components/milestones/MilestoneCard';
import MilestoneModal from '../components/milestones/MilestoneModal';
import MilestoneProgress from '../components/milestones/MilestoneProgress';
import Loader from '../components/utils/Loader';
import ErrorAlert from '../components/utils/ErrorAlert';
import UserProfile from '../components/users/UserProfile';
import UserAvatar from '../components/users/UserAvatar';
import TeamChat from '../components/teams/TeamChat';

const API_BASE_URL = 'https://backend-xc4z.vercel.app';

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [selectedTeamForMembers, setSelectedTeamForMembers] = useState(null);
  const [selectedTeamForInvite, setSelectedTeamForInvite] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedDueDateFilter, setSelectedDueDateFilter] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [taskForm, setTaskForm] = useState({
    id: null,
    title: '',
    description: '',
    assigned_to_id: '',
    assigned_by_id: '',
    team_id: '',
    due_date: '',
    status: 'To Do',
    milestone_id: '',
  });
  const [teamForm, setTeamForm] = useState({ name: '' });
  const [addMemberForm, setAddMemberForm] = useState({ userId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAllTeams, setShowAllTeams] = useState(false);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [reminders, setReminders] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showTimeReport, setShowTimeReport] = useState(false);
  const [showMilestones, setShowMilestones] = useState(false);
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState(null);
  const [milestoneTasksModal, setMilestoneTasksModal] = useState(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTeamChat, setShowTeamChat] = useState(false);
  const [selectedTeamForChat, setSelectedTeamForChat] = useState(null);
  const navigate = useNavigate();

  // Get logged-in user ID from localStorage (set after login)
  const loggedInUserId = Number(localStorage.getItem('userId'));

  useEffect(() => {
    // Set axios authorization header
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Check authentication first
    if (!loggedInUserId) {
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        console.log(`Fetching data from ${API_BASE_URL}`);

        const teamsResponse = await axios.get(`${API_BASE_URL}/teams`, {
          withCredentials: true,
        });
        console.log('Teams response:', teamsResponse);

        if (!teamsResponse.headers['content-type']?.includes('application/json')) {
          throw new Error('Invalid response format from server');
        }
        if (!Array.isArray(teamsResponse.data)) {
          throw new Error('Invalid teams data format');
        }

        const teamsData = teamsResponse.data;
        const enrichedTeams = await Promise.all(
          teamsData.map(async (team) => {
            const membersResponse = await axios.get(`${API_BASE_URL}/teams/${team.id}/members`, {
              withCredentials: true,
            });
            return { ...team, members: membersResponse.data || [] };
          })
        );
        setTeams(enrichedTeams);

        const tasksResponse = await axios.get(`${API_BASE_URL}/tasks/get-task`, {
          withCredentials: true,
        });
        setTasks(tasksResponse.data || []);
        setFilteredTasks(tasksResponse.data || []);

        try {
          const usersResponse = await axios.get(`${API_BASE_URL}/users`, {
            withCredentials: true,
          });
          setUsers(usersResponse.data || []);
        } catch (usersError) {
          console.warn('Failed to fetch users:', usersError);
          setUsers([]);
        }

        axios.get(`${API_BASE_URL}/tasks/reminders`, { withCredentials: true })
          .then(res => setReminders(res.data))
          .catch(() => setReminders([]));

        axios.get(`${API_BASE_URL}/teams/invitations`, { withCredentials: true })
          .then(res => setInvitations(res.data))
          .catch(() => setInvitations([]));

        axios.get(`${API_BASE_URL}/milestones`, { withCredentials: true })
          .then(res => setMilestones(res.data))
          .catch(() => setMilestones([]));

        // Fetch current user profile
        axios.get(`${API_BASE_URL}/users/profile`, { withCredentials: true })
          .then(res => setCurrentUser(res.data))
          .catch(() => setCurrentUser(null));
      } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
        if (error.response?.status === 401) {
          localStorage.removeItem('userId');
          navigate('/login');
          return;
        }
        setError(error.response?.data?.error || error.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    // Socket connection
    const newSocket = io('https://backend-xc4z.vercel.app', {
      withCredentials: true,
      transports: ['polling', 'websocket'], // Allow both polling and websocket
    });
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      if (loggedInUserId) {
        newSocket.emit('join-user', loggedInUserId);
      }
    });

    newSocket.on('invitation-received', (data) => {
      console.log('Invitation received:', data);
      setNotifications(prev => [...prev, { type: 'invitation', ...data, timestamp: new Date() }]);
      // Refresh invitations
      axios.get(`${API_BASE_URL}/teams/invitations`, { withCredentials: true })
        .then(res => setInvitations(res.data))
        .catch(() => setInvitations([]));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [navigate, loggedInUserId]);

  useEffect(() => {
    let filtered = tasks;
    if (selectedTeam) {
      filtered = filtered.filter((task) => task.team_id === parseInt(selectedTeam, 10));
    }
    if (selectedAssignee) {
      filtered = filtered.filter((task) => task.assigned_to_id === parseInt(selectedAssignee, 10));
    }
    if (selectedStatus) {
      filtered = filtered.filter((task) => task.status === selectedStatus);
    }
    if (selectedPriority) {
      filtered = filtered.filter((task) => task.priority === selectedPriority);
    }
    if (selectedDueDateFilter) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);

      filtered = filtered.filter((task) => {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        switch (selectedDueDateFilter) {
          case 'overdue':
            return dueDate < today;
          case 'today':
            return dueDate.toDateString() === today.toDateString();
          case 'this-week':
            return dueDate >= today && dueDate <= weekFromNow;
          default:
            return true;
        }
      });
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (task) =>
          task.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal, bVal;
      switch (sortBy) {
        case 'due_date':
          aVal = a.due_date ? new Date(a.due_date) : new Date('9999-12-31');
          bVal = b.due_date ? new Date(b.due_date) : new Date('9999-12-31');
          break;
        case 'priority':
          const priorityOrder = { High: 3, Medium: 2, Low: 1 };
          aVal = priorityOrder[a.priority || 'Medium'];
          bVal = priorityOrder[b.priority || 'Medium'];
          break;
        case 'status':
          const statusOrder = { 'To Do': 1, 'In Progress': 2, Done: 3 };
          aVal = statusOrder[a.status || 'To Do'];
          bVal = statusOrder[b.status || 'To Do'];
          break;
        case 'created_at':
        default:
          aVal = new Date(a.created_at);
          bVal = new Date(b.created_at);
          break;
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredTasks(filtered);
  }, [selectedTeam, selectedAssignee, selectedStatus, selectedPriority, selectedDueDateFilter, searchQuery, sortBy, sortOrder, tasks]);

  const handleTaskSubmit = async (taskData) => {
    setError('');

    let sanitizedTaskForm = null;
    let url = '';
    let method = 'post';

    try {
      if (!taskData.title) {
        setError('Title is required');
        return;
      }
      if (!taskData.team_id) {
        setError('Team is required');
        return;
      }
      sanitizedTaskForm = {
        title: taskData.title,
        description: taskData.description || null,
        team_id: parseInt(taskData.team_id, 10),
        due_date: taskData.due_date || null,
        status: taskData.status || 'To Do',
      };
      if (taskData.assigned_to_id) {
        sanitizedTaskForm.assigned_to_id = parseInt(taskData.assigned_to_id, 10);
      }
      if (taskData.milestone_id) {
        sanitizedTaskForm.milestone_id = parseInt(taskData.milestone_id, 10);
      }

      console.log('Saving task with data:', sanitizedTaskForm);

      url = taskData.id
        ? `${API_BASE_URL}/tasks/${taskData.id}`
        : `${API_BASE_URL}/tasks/create-task`;
      console.log('Request URL:', url);
      method = taskData.id ? 'put' : 'post';

      const response = await axios[method](url, sanitizedTaskForm, {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: true,
      });

      const updatedTask = response.data;
      console.log('Task response:', updatedTask);

      // Handle file uploads if any
      if (taskData.files && taskData.files.length > 0) {
        const formData = new FormData();
        taskData.files.forEach(file => {
          formData.append('file', file);
        });
        try {
          await axios.post(`${API_BASE_URL}/tasks/${updatedTask.id}/attachments`, formData, {
            withCredentials: true,
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          console.log('Files uploaded successfully');
        } catch (uploadErr) {
          console.error('Failed to upload files:', uploadErr);
          // Don't fail the task creation if file upload fails
        }
      }

      if (taskData.id) {
        setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
        setFilteredTasks(filteredTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
      } else {
        setTasks([...tasks, updatedTask]);
        setFilteredTasks([...filteredTasks, updatedTask]);
      }

      setIsModalOpen(false);
      setTaskForm({
        id: null,
        title: '',
        description: '',
        assigned_to_id: '',
        assigned_by_id: loggedInUserId.toString(),
        team_id: '',
        due_date: '',
        status: 'To Do',
        priority: 'Medium',
        milestone_id: '',
      });
    } catch (error) {
      const errorMessage = error.response?.data?.errors?.map((e) => e.msg).join(', ') ||
                          error.response?.data?.error || `Failed to save task: ${error.message}`;
      console.error('Error saving task:', {
        message: error.message,
        response: error.response?.data,
        url,
        task: sanitizedTaskForm,
      });
      setError(errorMessage);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Creating team with data:', teamForm);
    try {
      const response = await axios.post(`${API_BASE_URL}/teams`, teamForm, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });
      console.log('Team creation response:', response.data);

      const newTeam = response.data;
      const membersResponse = await axios.get(`${API_BASE_URL}/teams/${newTeam.id}/members`, {
        withCredentials: true,
      });
      setTeams([...teams, { ...newTeam, members: membersResponse.data || [] }]);

      setIsTeamModalOpen(false);
      setTeamForm({ name: '' });
    } catch (error) {
      console.error('Error creating team:', error);
      setError(error.response?.data?.error || 'Failed to create team');
    }
  };

  const handleAddMemberSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await axios.post(
        `${API_BASE_URL}/teams/${selectedTeamForMembers.id}/members`,
        { userId: parseInt(addMemberForm.userId, 10) },
        {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: true,
        }
      );

      const membersResponse = await axios.get(
        `${API_BASE_URL}/teams/${selectedTeamForMembers.id}/members`,
        { withCredentials: true }
      );
      setTeams(
        teams.map((team) =>
          team.id === selectedTeamForMembers.id ? { ...team, members: membersResponse.data || [] } : team
        )
      );

      setIsAddMemberModalOpen(false);
      setAddMemberForm({ userId: '' });
      setSelectedTeamForMembers(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add member');
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/teams/${teamId}`, { withCredentials: true });
      setTeams(teams.filter((team) => team.id !== teamId));
      if (selectedTeam === teamId) {
        setSelectedTeam('');
        setSelectedAssignee('');
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete team');
    }
  };

  const handleEditTask = (task) => {
    setTaskForm({
      id: task.id,
      title: task.title || '',
      description: task.description || '',
      assigned_to_id: task.assigned_to_id ? task.assigned_to_id.toString() : '',
      assigned_by_id: task.assigned_by_id ? task.assigned_by_id.toString() : loggedInUserId.toString(),
      team_id: task.team_id ? task.team_id.toString() : '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      status: task.status || 'To Do',
      priority: task.priority || 'Medium',
      milestone_id: task.milestone_id ? task.milestone_id.toString() : '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/tasks/${taskId}`, { withCredentials: true });
      setTasks(tasks.filter((task) => task.id !== taskId));
      setFilteredTasks(filteredTasks.filter((task) => task.id !== taskId));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('userId');
      navigate('/login');
    }
  };

  const handleRemoveMember = async (teamId, userId) => {
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/teams/${teamId}/members/${userId}`, { withCredentials: true });
      if (parseInt(userId) === loggedInUserId) {
        // User left the team, remove from local teams list
        setTeams(teams.filter(team => team.id !== parseInt(teamId)));
      } else {
        // Update members list
        const membersResponse = await axios.get(`${API_BASE_URL}/teams/${teamId}/members`, { withCredentials: true });
        setTeams(teams.map(team => team.id === teamId ? { ...team, members: membersResponse.data || [] } : team));
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await axios.post(`${API_BASE_URL}/teams/invitations/${invitationId}/accept`, {}, { withCredentials: true });
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
      // Refresh teams and tasks
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to accept invitation');
    }
  };

  const handleDeclineInvitation = async (invitationId) => {
    try {
      await axios.post(`${API_BASE_URL}/teams/invitations/${invitationId}/decline`, {}, { withCredentials: true });
      setInvitations(invitations.filter(inv => inv.id !== invitationId));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to decline invitation');
    }
  };

  const handleMilestoneSubmit = async (milestoneData) => {
    setError('');
    try {
      if (selectedMilestone) {
        // Update existing milestone
        const res = await axios.put(`${API_BASE_URL}/milestones/${selectedMilestone.id}`, milestoneData, {
          withCredentials: true
        });
        setMilestones(milestones.map(m => m.id === selectedMilestone.id ? res.data : m));
      } else {
        // Create new milestone
        const res = await axios.post(`${API_BASE_URL}/milestones`, milestoneData, {
          withCredentials: true
        });
        setMilestones([...milestones, res.data]);
      }
      setIsMilestoneModalOpen(false);
      setSelectedMilestone(null);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save milestone');
      throw error;
    }
  };

  const handleEditMilestone = (milestone) => {
    setSelectedMilestone(milestone);
    setIsMilestoneModalOpen(true);
  };

  const handleDeleteMilestone = async (milestoneId) => {
    if (!window.confirm('Are you sure you want to delete this milestone?')) return;
    setError('');
    try {
      await axios.delete(`${API_BASE_URL}/milestones/${milestoneId}`, { withCredentials: true });
      setMilestones(milestones.filter(m => m.id !== milestoneId));
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to delete milestone');
    }
  };

  const handleViewMilestoneTasks = async (milestone) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/milestones/${milestone.id}/tasks`, { withCredentials: true });
      setMilestoneTasksModal({ milestone, tasks: res.data });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to fetch milestone tasks');
    }
  };

  const allAssignees = Array.from(
    new Map(
      teams
        .flatMap((team) => team.members || [])
        .map((member) => [member.id, member])
    ).values()
  );

  const getAssigneeName = (task, field = 'assigned_to_id') => {
    const userId = task[field];
    if (!userId) return 'Unassigned';
    const user = users.find((u) => u.id === userId);
    return user?.username || 'Unknown';
  };

  return (
    <div className="flex min-h-screen bg-accent">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-green-200 shadow-lg p-4 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out z-30 overflow-y-auto`}
      >
        <button className="md:hidden mb-4" onClick={() => setIsSidebarOpen(false)}>
          <X className="w-6 h-6 text-green-600" />
        </button>
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold">
            TM
          </div>
          <span className="ml-2 text-lg font-semibold text-green-800">Task Flow</span>
        </div>
        
        {/* User Profile Section */}
        {currentUser && (
          <div className="mb-6 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex flex-col items-center space-y-3">
              <UserAvatar
                username={currentUser.username}
                avatarUrl={currentUser.avatar_url}
                size="w-16 h-16"
              />
              <div className="text-center">
                <p className="font-medium text-green-800">{currentUser.username}</p>
                <p className="text-sm text-green-600">{currentUser.email}</p>
              </div>
              <button
                onClick={() => setShowUserProfile(true)}
                className="text-green-600 hover:text-green-800 text-sm px-3 py-1 rounded border border-green-300 hover:bg-green-100 transition-colors"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
        <nav className="space-y-2">
          <h3 className="text-xs font-medium text-green-600 mb-2 uppercase tracking-wide">Teams</h3>
          <ul className="space-y-1">
            {teams.map((team) => (
              <li key={team.id} className="rounded-lg hover:bg-green-100">
                <button
                  onClick={() => {
                    setSelectedTeam(team.id.toString());
                    setSelectedAssignee('');
                    setIsSidebarOpen(false);
                  }}
                  className={`text-left w-full py-2 px-3 text-sm rounded-lg transition-colors ${
                    selectedTeam === team.id.toString() 
                      ? 'font-semibold text-green-700 bg-green-100' 
                      : 'text-green-700 hover:text-green-800'
                  }`}
                >
                  {team.name}
                  <span className="text-xs text-green-500 block">
                    {(team.members || []).length} members
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1">
            <button
              onClick={() => {
                setSelectedTeam('');
                setSelectedAssignee('');
                setIsSidebarOpen(false);
              }}
              className="block w-full text-left py-2 px-3 text-green-700 text-sm hover:bg-green-100 rounded-lg transition-colors"
            >
              All Teams
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left py-2 px-3 text-red-600 text-sm hover:bg-red-50 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 bg-white shadow-sm border-b border-green-200 p-4 z-10">
          <div className="flex flex-col gap-4">
            {/* Top row: Search and main actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center justify-between sm:flex-1 sm:mr-4">
                <button className="md:hidden" onClick={() => setIsSidebarOpen(true)}>
                  <Menu className="w-6 h-6 text-green-600" />
                </button>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-green-300 bg-white text-green-800 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-end items-center">
                <ActiveTimer />
                <button
                  className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors text-sm shadow-sm"
                  onClick={() => {
                    setTaskForm({
                      id: null,
                      title: '',
                      description: '',
                      assigned_to_id: '',
                      assigned_by_id: loggedInUserId.toString(),
                      team_id: '',
                      due_date: '',
                      status: 'To Do',
                      priority: 'Medium',
                      milestone_id: '',
                    });
                    setIsModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> New Task
                </button>
                <button
                  className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center hover:bg-green-600 transition-colors text-sm shadow-sm"
                  onClick={() => {
                    setTeamForm({ name: '' });
                    setIsTeamModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-1" /> New Team
                </button>
                <button
                  onClick={() => setShowAllTeams(true)}
                  className="bg-green-100 text-green-700 px-3 py-2 rounded-lg flex items-center hover:bg-green-200 transition-colors text-sm border border-green-300"
                >
                  Teams
                </button>
                <button
                  onClick={() => setShowAllTasks(true)}
                  className="bg-green-100 text-green-700 px-3 py-2 rounded-lg flex items-center hover:bg-green-200 transition-colors text-sm border border-green-300"
                >
                  All Tasks
                </button>
                <button
                  onClick={() => setShowTimeReport(true)}
                  className="bg-blue-100 text-blue-700 px-3 py-2 rounded-lg flex items-center hover:bg-blue-200 transition-colors text-sm border border-blue-300"
                >
                  Time Report
                </button>
                <button
                  onClick={() => setShowMilestones(true)}
                  className="bg-purple-100 text-purple-700 px-3 py-2 rounded-lg flex items-center hover:bg-purple-200 transition-colors text-sm border border-purple-300"
                >
                  Milestones
                </button>
                <button
                  onClick={() => {
                    setSelectedMilestone(null);
                    setIsMilestoneModalOpen(true);
                  }}
                  className="bg-indigo-100 text-indigo-700 px-3 py-2 rounded-lg flex items-center hover:bg-indigo-200 transition-colors text-sm border border-indigo-300"
                >
                  <Plus className="w-4 h-4 mr-1" /> New Milestone
                </button>
              </div>
            </div>

            {/* Filters row */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-green-700 mr-2">Filters:</span>
              <select
                value={selectedTeam}
                onChange={(e) => {
                  setSelectedTeam(e.target.value);
                  setSelectedAssignee('');
                }}
                className="px-2 py-1 rounded border border-green-300 bg-white text-green-800 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="px-2 py-1 rounded border border-green-300 bg-white text-green-800 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Assignees</option>
                {(selectedTeam
                  ? teams.find((t) => t.id === parseInt(selectedTeam, 10))?.members || []
                  : allAssignees
                ).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.username}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1 rounded border border-green-300 bg-white text-green-800 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Status</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="px-2 py-1 rounded border border-green-300 bg-white text-green-800 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Priority</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
              <select
                value={selectedDueDateFilter}
                onChange={(e) => setSelectedDueDateFilter(e.target.value)}
                className="px-2 py-1 rounded border border-green-300 bg-white text-green-800 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="">All Due Dates</option>
                <option value="overdue">Overdue</option>
                <option value="today">Due Today</option>
                <option value="this-week">Due This Week</option>
              </select>
              <span className="text-sm font-medium text-green-700 ml-4 mr-2">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-2 py-1 rounded border border-green-300 bg-white text-green-800 text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
              >
                <option value="created_at">Created</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-2 py-1 rounded border border-green-300 bg-white text-green-800 text-xs hover:bg-green-50"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 flex-1 overflow-auto">
          {loading && <Loader />}
          {error && <ErrorAlert message={error} />}

          {/* Reminders */}
          <Reminders reminders={reminders} />

          {/* Real-time Notifications */}
          {notifications.length > 0 && (
            <div className="mb-4 p-4 bg-purple-100 border-l-4 border-purple-500 rounded-r-lg text-purple-800 text-sm">
              <strong>Notifications:</strong>
              <ul className="mt-2 space-y-1">
                {notifications.map((notif, index) => (
                  <li key={index}>{notif.message}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Invitations */}
          {invitations.length > 0 && (
            <div className="mb-4 p-4 bg-blue-100 border-l-4 border-blue-500 rounded-r-lg text-blue-800 text-sm">
              <strong>Pending Invitations:</strong>
              <ul className="mt-2 space-y-2">
                {invitations.map(inv => (
                  <li key={inv.id} className="flex justify-between items-center">
                    <span>Invited to join <strong>{inv.team_name}</strong> by {inv.inviter_name}</span>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleAcceptInvitation(inv.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDeclineInvitation(inv.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Decline
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Team Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {teams.map((team) => (
              <TeamCard
                key={team.id}
                team={team}
                onDelete={handleDeleteTeam}
                onAddMember={(teamObj) => { setSelectedTeamForMembers(teamObj); setAddMemberForm({ userId: '' }); setIsAddMemberModalOpen(true); }}
                onInviteMember={(teamObj) => { setSelectedTeamForInvite(teamObj); setIsInviteModalOpen(true); }}
                onRemoveMember={handleRemoveMember}
                onOpenChat={(team) => {
                  setSelectedTeamForChat(team);
                  setShowTeamChat(true);
                }}
                loggedInUserId={loggedInUserId}
              />
            ))}
          </div>

          {/* Task Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                getAssigneeName={getAssigneeName}
              />
            ))}
          </div>

          {/* Debug info for troubleshooting button visibility */}
          <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 rounded">
            <div>Logged-in User ID: {loggedInUserId || 'Not set'}</div>
            {teams.map(team => (
              <div key={team.id}>
                <strong>Team:</strong> {team.name} | <strong>Creator:</strong> {team.created_by}
                <div>Members: {team.members?.map(m => `${m.username} (ID: ${m.id})`).join(', ')}</div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Modals */}
      <TeamModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        onSubmit={handleTeamSubmit}
        teamForm={teamForm}
        setTeamForm={setTeamForm}
      />
      <InviteMemberModal
        teamId={selectedTeamForInvite?.id}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTaskSubmit}
        taskForm={taskForm}
        setTaskForm={setTaskForm}
        users={users}
        teams={teams}
      />

      <AddMemberModal
        team={selectedTeamForMembers}
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        onSubmit={handleAddMemberSubmit}
        addMemberForm={addMemberForm}
        setAddMemberForm={setAddMemberForm}
        users={users}
      />

      {/* Show All Teams Modal */}
      {showAllTeams && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-card p-8 rounded-xl shadow-card border border-primary w-full max-w-md max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-6">All Teams</h2>
            <TeamList teams={teams} onSelectTeam={(teamId) => { setSelectedTeam(teamId.toString()); setSelectedAssignee(''); setShowAllTeams(false); }} />
            <div className="mt-6 flex justify-end">
              <button type="button" className="bg-gray-300 text-primary px-5 py-3 rounded-xl shadow-card hover:bg-gray-400" onClick={() => setShowAllTeams(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Show All Tasks Modal */}
      {showAllTasks && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-card p-8 rounded-xl shadow-card border border-primary w-full max-w-2xl max-h-96 overflow-y-auto">
            <h2 className="text-xl font-bold text-primary mb-6">All Tasks</h2>
            <TaskList tasks={tasks} onEdit={handleEditTask} onDelete={handleDeleteTask} />
            <div className="mt-6 flex justify-end">
              <button type="button" className="bg-gray-300 text-primary px-5 py-3 rounded-xl shadow-card hover:bg-gray-400" onClick={() => setShowAllTasks(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Time Report Modal */}
      <TimeReport
        isOpen={showTimeReport}
        onClose={() => setShowTimeReport(false)}
      />

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        onClose={() => {
          setIsMilestoneModalOpen(false);
          setSelectedMilestone(null);
        }}
        onSubmit={handleMilestoneSubmit}
        milestone={selectedMilestone}
        teams={teams}
      />

      {/* Milestones View Modal */}
      {showMilestones && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg border w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Project Milestones</h2>
              <button
                onClick={() => setShowMilestones(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Progress Overview */}
              <div className="lg:col-span-1">
                <MilestoneProgress milestones={milestones} />
              </div>

              {/* Milestone Cards */}
              <div className="lg:col-span-2 space-y-4">
                {milestones.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg mb-2">No milestones yet</p>
                    <p>Create your first milestone to track project progress</p>
                  </div>
                ) : (
                  milestones.map(milestone => (
                    <MilestoneCard
                      key={milestone.id}
                      milestone={milestone}
                      onEdit={handleEditMilestone}
                      onDelete={handleDeleteMilestone}
                      onViewTasks={handleViewMilestoneTasks}
                    />
                  ))
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMilestones(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Tasks Modal */}
      {milestoneTasksModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg border w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">
                Tasks for: {milestoneTasksModal.milestone.title}
              </h2>
              <button
                onClick={() => setMilestoneTasksModal(null)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Progress: {milestoneTasksModal.milestone.progress_percentage}%</span>
                <span className="text-sm text-gray-600">
                  {milestoneTasksModal.milestone.completed_tasks || 0} of {milestoneTasksModal.milestone.total_tasks || 0} tasks completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${milestoneTasksModal.milestone.progress_percentage}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-4">
              {milestoneTasksModal.tasks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tasks assigned to this milestone yet</p>
                </div>
              ) : (
                milestoneTasksModal.tasks.map(task => (
                  <div key={task.id} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-800">{task.title}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.status === 'Done' ? 'bg-green-100 text-green-800' :
                        task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <span>Assigned to: {task.assigned_to_name || 'Unassigned'}</span>
                      <span>Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setMilestoneTasksModal(null)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Profile Modal */}
      <UserProfile
        isOpen={showUserProfile}
        onClose={() => {
          setShowUserProfile(false);
          // Refresh user data after profile update
          axios.get(`${API_BASE_URL}/users/profile`, { withCredentials: true })
            .then(res => setCurrentUser(res.data))
            .catch(() => setCurrentUser(null));
        }}
      />

      {/* Team Chat Modal */}
      <TeamChat
        team={selectedTeamForChat}
        isOpen={showTeamChat}
        onClose={() => {
          setShowTeamChat(false);
          setSelectedTeamForChat(null);
        }}
        socket={socket}
        currentUserId={loggedInUserId}
      />
    </div>
  );
};

export default Dashboard;