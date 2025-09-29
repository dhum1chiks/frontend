import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = 'https://backend-xc4z.vercel.app/';

const TaskModal = ({ isOpen, onClose, onSubmit, taskForm, setTaskForm, users, teams }) => {
  const [files, setFiles] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/tasks/templates`, { withCredentials: true });
        setTemplates(res.data);
      } catch (err) {
        console.error('Failed to fetch templates:', err);
      }
    };

    const fetchMilestones = async () => {
      if (taskForm.team_id) {
        try {
          const res = await axios.get(`${API_BASE_URL}/milestones/team/${taskForm.team_id}`, { withCredentials: true });
          setMilestones(res.data);
        } catch (err) {
          console.error('Failed to fetch milestones:', err);
          setMilestones([]);
        }
      } else {
        setMilestones([]);
      }
    };

    if (isOpen) {
      fetchTemplates();
      fetchMilestones();
      setSelectedTemplate(''); // Reset template selection when modal opens
    }
  }, [isOpen, taskForm.team_id]);

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (templateId) {
      const template = templates.find(t => t.id == templateId);
      if (template) {
        setTaskForm({
          ...taskForm,
          title: template.title_template,
          description: template.description_template || '',
          priority: template.priority,
          status: template.status
        });
      }
    } else {
      // Reset to empty if no template selected
      setTaskForm({
        ...taskForm,
        title: '',
        description: '',
        priority: 'Medium',
        status: 'To Do'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare task data
    const taskData = {
      ...taskForm,
      files: files // Include files in the task data
    };

    try {
      // Call parent onSubmit function with the task data
      await onSubmit(taskData);
      setFiles([]);
    } catch (err) {
      console.error('Failed to save task:', err);
      // Error will be handled by parent component
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
      <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl shadow-card border border-primary w-full max-w-md max-h-[90vh] flex flex-col relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-primary mb-6 pr-8">{taskForm.id ? 'Edit Task' : 'Create Task'}</h2>
        <div className="flex-1 overflow-y-auto">
        <select
          value={selectedTemplate}
          onChange={handleTemplateChange}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Select a template (optional)</option>
          {templates.map(template => (
            <option key={template.id} value={template.id}>
              {template.is_default ? '📋 ' : '👤 '}{template.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Task Title"
          value={taskForm.title}
          onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
        <textarea
          placeholder="Description"
          value={taskForm.description}
          onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={taskForm.team_id}
          onChange={e => setTaskForm({ ...taskForm, team_id: e.target.value })}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value="">Select Team</option>
          {teams.map(team => (
            <option key={team.id} value={team.id}>{team.name}</option>
          ))}
        </select>
        <select
          value={taskForm.assigned_to_id}
          onChange={e => setTaskForm({ ...taskForm, assigned_to_id: e.target.value })}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Assign To (Optional)</option>
          {taskForm.team_id && teams.find(t => t.id == taskForm.team_id)?.members?.map(member => (
            <option key={member.id} value={member.id}>{member.username}</option>
          ))}
        </select>
        <select
          value={taskForm.status}
          onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        <select
          value={taskForm.priority || 'Medium'}
          onChange={e => setTaskForm({ ...taskForm, priority: e.target.value })}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="Low">Low Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="High">High Priority</option>
        </select>
        <input
          type="date"
          value={taskForm.due_date}
          onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={taskForm.milestone_id || ''}
          onChange={e => setTaskForm({ ...taskForm, milestone_id: e.target.value })}
          className="w-full mb-4 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">No Milestone</option>
          {milestones.map(milestone => (
            <option key={milestone.id} value={milestone.id}>
              {milestone.title} ({milestone.progress_percentage}% complete)
            </option>
          ))}
        </select>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full mb-6 p-3 rounded-xl border border-primary bg-accent text-text text-base focus:outline-none focus:ring-2 focus:ring-primary"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt,.zip,.rar"
        />
        {files.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-primary">Files to upload: {files.map(f => f.name).join(', ')}</p>
          </div>
        )}
        </div>
        <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200">
          <button type="submit" className="bg-primary text-accent px-5 py-3 rounded-xl shadow-card hover:bg-primary/80">Save</button>
          <button type="button" className="bg-gray-300 text-primary px-5 py-3 rounded-xl shadow-card hover:bg-gray-400" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  ) : null;
};

export default TaskModal;
