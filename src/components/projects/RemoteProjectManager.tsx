import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProjectTask } from '../../types';
import {
  Plus,
  Clock,
  MessageSquare,
  Calendar,
  Send,
  Sparkles,
  Search,
} from 'lucide-react';

const COLUMNS: { id: ProjectTask['status']; title: string }[] = [
  { id: 'backlog', title: 'Backlog' },
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'review', title: 'Review / QA' },
  { id: 'done', title: 'Completed' },
];

export const RemoteProjectManager: React.FC = () => {
  const { tasks, teamMembers, addTask, updateTaskStatus, addTaskComment, activityStream } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);
  const [newCommentText, setNewCommentText] = useState<string>('');
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<ProjectTask['category']>('Kitchen Operations');
  const [newTaskPriority, setNewTaskPriority] = useState<ProjectTask['priority']>('medium');
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState('team-2');
  const [newTaskDueDate, setNewTaskDueDate] = useState('2026-11-20');

  const filteredTasks = tasks.filter((t) => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const member = teamMembers.find((m) => m.id === newTaskAssigneeId) || teamMembers[0];

    addTask({
      title: newTaskTitle,
      description: newTaskDescription,
      category: newTaskCategory,
      status: 'todo',
      priority: newTaskPriority,
      assignee: {
        id: member.id,
        name: member.name,
        role: member.role,
        avatar: member.avatar,
      },
      dueDate: newTaskDueDate,
      tags: [newTaskCategory.split(' ')[0], 'Operations'],
    });

    setNewTaskTitle('');
    setNewTaskDescription('');
    setShowNewTaskModal(false);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;

    addTaskComment(selectedTask.id, newCommentText);
    setSelectedTask((prev) =>
      prev
        ? {
            ...prev,
            comments: [
              ...prev.comments,
              {
                id: `comm-${Date.now()}`,
                author: 'David Tarimo (GM)',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
                text: newCommentText,
                timestamp: 'Just now',
              },
            ],
          }
        : null
    );
    setNewCommentText('');
  };

  const completedCount = tasks.filter((t) => t.status === 'done').length;
  const progressPct = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="flex-1 flex flex-col min-h-[calc(100vh-61px)] bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 p-4 sm:p-6 space-y-6 transition-colors">
      {/* Top Banner: Remote Collaboration Presence & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Remote Operations & Project Management</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Real-Time Collaboration
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
            Coordinate kitchen workflows, FDM tablet rollouts, compliance audits, and team sprints across remote HQ and floor units.
          </p>
        </div>

        {/* Active Remote Team Members Online Presence */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-300 dark:border-neutral-800 shadow-xs">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Team Online:</span>
            <div className="flex -space-x-2 overflow-hidden">
              {teamMembers.map((member) => (
                <div key={member.id} className="relative group cursor-pointer" title={`${member.name} (${member.role})`}>
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-7 h-7 rounded-full ring-2 ring-white dark:ring-neutral-950 object-cover"
                  />
                  <span
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full ring-1 ring-white dark:ring-neutral-950 ${
                      member.status === 'online'
                        ? 'bg-emerald-500'
                        : member.status === 'busy'
                        ? 'bg-amber-500'
                        : 'bg-neutral-400 dark:bg-neutral-500'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Project Task</span>
          </button>
        </div>
      </div>

      {/* Sprints & Progress Metric Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs md:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-neutral-900 dark:text-white">Hospitality & FDM Rollout Sprint Completion</span>
            <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">{progressPct}% ({completedCount}/{tasks.length} Tasks)</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-950 h-2.5 rounded-full overflow-hidden border border-neutral-300 dark:border-neutral-800">
            <div
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
            <span>Current Milestone: FDM Tablet Integration & Kitchen Audio Chime Calibration</span>
            <span>Target: Nov 2026</span>
          </div>
        </div>

        {/* Live Activity Stream Snippet */}
        <div className="p-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" /> Recent Stream
          </span>
          <div className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-400 space-y-1">
            {activityStream.slice(0, 2).map((a) => (
              <div key={a.id} className="truncate">
                <strong className="text-neutral-900 dark:text-neutral-200">{a.user}:</strong> {a.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {['all', 'Kitchen Operations', 'Inventory & Sourcing', 'Floor & Service', 'Menu R&D', 'Compliance & Audit'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-semibold'
                  : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white border border-neutral-200 dark:border-neutral-800'
              }`}
            >
              {cat === 'all' ? 'All Tracks' : cat}
            </button>
          ))}
        </div>

        <div className="relative w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-neutral-900 dark:text-neutral-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-[1000px] items-start">
          {COLUMNS.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div key={col.id} className="flex-1 flex flex-col bg-neutral-100/80 dark:bg-neutral-900/60 rounded-xl border border-neutral-200 dark:border-neutral-800/80 p-3 min-w-[220px]">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{col.title}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-400 font-semibold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 flex-1 min-h-[300px]">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => setSelectedTask(task)}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 rounded-xl p-3.5 cursor-pointer shadow-xs transition-all group"
                    >
                      {/* Priority tag & Category */}
                      <div className="flex items-center justify-between text-[10px] mb-2">
                        <span
                          className={`font-semibold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300'
                              : task.priority === 'high'
                              ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                              : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                        <span className="text-neutral-400 dark:text-neutral-500">{task.category.split(' ')[0]}</span>
                      </div>

                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors line-clamp-2">
                        {task.title}
                      </h4>
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 line-clamp-2 leading-relaxed">
                        {task.description}
                      </p>

                      {/* Card Footer: Assignee & Meta */}
                      <div className="mt-3 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-1.5" title={task.assignee.name}>
                          <img
                            src={task.assignee.avatar}
                            alt={task.assignee.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span className="text-[10px] text-neutral-700 dark:text-neutral-300 truncate max-w-[80px]">
                            {task.assignee.name.split(' ')[0]}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                          {task.comments.length > 0 && (
                            <span className="flex items-center gap-0.5">
                              <MessageSquare className="w-2.5 h-2.5" /> {task.comments.length}
                            </span>
                          )}
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" /> {task.dueDate.slice(5)}
                          </span>
                        </div>
                      </div>

                      {/* Quick Move Status Buttons */}
                      <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/50 flex items-center justify-between text-[10px] text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>Advance to:</span>
                        <select
                          value={task.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                          className="bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-300 text-[10px] rounded px-1.5 py-0.5 focus:outline-none"
                        >
                          {COLUMNS.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Details & Collaborative Comments Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 max-w-xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col text-neutral-900 dark:text-white">
            <div className="flex items-start justify-between gap-3 border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/15 text-amber-800 dark:text-amber-400 border border-amber-500/30">
                  {selectedTask.category}
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-1.5">{selectedTask.title}</h3>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block mb-1">Description</span>
                <p className="text-neutral-800 dark:text-neutral-200 leading-relaxed bg-neutral-50 dark:bg-neutral-950 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  {selectedTask.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-neutral-50 dark:bg-neutral-950 p-3 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Assigned Lead</span>
                  <div className="flex items-center gap-2 mt-1">
                    <img
                      src={selectedTask.assignee.avatar}
                      alt={selectedTask.assignee.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-semibold text-neutral-900 dark:text-white">{selectedTask.assignee.name}</div>
                      <div className="text-[10px] text-neutral-500 dark:text-neutral-400">{selectedTask.assignee.role}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] text-neutral-500 block">Due Date & Priority</span>
                  <div className="mt-1 font-mono font-medium text-neutral-800 dark:text-neutral-200">
                    {selectedTask.dueDate} · <span className="uppercase text-amber-600 dark:text-amber-400">{selectedTask.priority}</span>
                  </div>
                </div>
              </div>

              {/* Collaborative Comments Thread */}
              <div>
                <span className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 block mb-2">
                  Collaboration Thread ({selectedTask.comments.length})
                </span>

                <div className="space-y-2 mb-3">
                  {selectedTask.comments.length === 0 ? (
                    <p className="text-neutral-400 dark:text-neutral-500 italic text-[11px]">No notes yet. Add an update or comment below.</p>
                  ) : (
                    selectedTask.comments.map((comm) => (
                      <div key={comm.id} className="p-2.5 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-200 dark:border-neutral-800 flex items-start gap-2.5">
                        <img src={comm.avatar} alt={comm.author} className="w-5 h-5 rounded-full object-cover shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-semibold text-neutral-900 dark:text-neutral-200">{comm.author}</span>
                            <span className="text-neutral-400 dark:text-neutral-500 font-mono">{comm.timestamp}</span>
                          </div>
                          <p className="text-neutral-700 dark:text-neutral-300 text-xs mt-0.5">{comm.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Write a message or update..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="flex-1 bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-1.5 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-500 text-neutral-950 rounded-lg text-xs font-semibold hover:bg-amber-400 flex items-center gap-1"
                  >
                    <Send className="w-3 h-3" /> Post
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTask}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Create Operations Task</h3>

            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Task Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Calibrate Kitchen Line Printers"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Description</label>
              <textarea
                rows={2}
                placeholder="Operational instructions, deliverables, requirements..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Category</label>
                <select
                  value={newTaskCategory}
                  onChange={(e) => setNewTaskCategory(e.target.value as any)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="Kitchen Operations">Kitchen Operations</option>
                  <option value="Inventory & Sourcing">Inventory & Sourcing</option>
                  <option value="Floor & Service">Floor & Service</option>
                  <option value="Menu R&D">Menu R&D</option>
                  <option value="Compliance & Audit">Compliance & Audit</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Assignee</label>
                <select
                  value={newTaskAssigneeId}
                  onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  {teamMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.role.split(' ')[0]})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-neutral-600 dark:text-neutral-400 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-amber-500 text-neutral-950 rounded-lg hover:bg-amber-400"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
