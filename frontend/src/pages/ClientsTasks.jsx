import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Users, Plus, Edit2, Trash2, Mail, Building, Briefcase, PlusCircle, CheckSquare, Calendar, ChevronRight, Check, Play, AlertTriangle, HelpCircle, Clock } from 'lucide-react';

export const ClientsTasks = () => {
  const {
    currentRoute,
    clients,
    addClient,
    updateClient,
    deleteClient,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    activities
  } = useApp();

  // ------------------------------------------------------------------
  // CLIENT MANAGEMENT HUB (Route: "/clients")
  // ------------------------------------------------------------------
  // New Client Form States
  const [showAddClientForm, setShowAddClientForm] = useState(false);
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientCompany, setClientCompany] = useState('');
  const [clientIndustry, setClientIndustry] = useState('');
  const [clientHourlyRate, setClientHourlyRate] = useState(150);
  const [clientNotes, setClientNotes] = useState('');

  // Editing client ID & states
  const [editingClientId, setEditingClientId] = useState(null);
  const [editClientName, setEditClientName] = useState('');
  const [editClientCompany, setEditClientCompany] = useState('');
  const [editClientHourlyRate, setEditClientHourlyRate] = useState(150);

  const handleAddClient = (e) => {
    e.preventDefault();
    if (!clientName || !clientCompany) return;

    addClient({
      name: clientName,
      email: clientEmail || `${clientName.toLowerCase().replace(/\s/g, '')}@example.com`,
      company: clientCompany,
      industry: clientIndustry || 'Tech Enterprise',
      hourlyRate: clientHourlyRate,
      status: 'Active',
      notes: clientNotes
    });

    // Reset Form
    setClientName('');
    setClientEmail('');
    setClientCompany('');
    setClientIndustry('');
    setClientHourlyRate(150);
    setClientNotes('');
    setShowAddClientForm(false);
  };

  const handleSaveClientEdit = (id) => {
    updateClient(id, {
      name: editClientName,
      company: editClientCompany,
      hourlyRate: editClientHourlyRate
    });
    setEditingClientId(null);
  };

  const handleStartClientEdit = (client) => {
    setEditingClientId(client.id);
    setEditClientName(client.name);
    setEditClientCompany(client.company);
    setEditClientHourlyRate(client.hourlyRate);
  };

  // ------------------------------------------------------------------
  // REVENUE-IMPACT TASK MANAGER (Route: "/tasks")
  // ------------------------------------------------------------------
  // New Task Form States
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState('Medium');
  const [taskDueDate, setTaskDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskClientName, setTaskClientName] = useState('');
  const [taskImpact, setTaskImpact] = useState('Medium');
  const [taskHours, setTaskHours] = useState(2);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskTitle) return;

    addTask({
      title: taskTitle,
      priority: taskPriority,
      status: 'Pending',
      dueDate: taskDueDate,
      clientName: taskClientName || undefined,
      revenueImpact: taskImpact,
      estimatedHours: taskHours
    });

    setTaskTitle('');
    setTaskPriority('Medium');
    setTaskImpact('Medium');
    setTaskHours(2);
    setTaskClientName('');
    setShowAddTaskForm(false);
  };

  const handleToggleTaskStatus = (id, currentStatus) => {
    const nextStatus = 
      currentStatus === 'Pending' ? 'In Progress' :
      currentStatus === 'In Progress' ? 'Completed' : 'Pending';
    updateTask(id, { status: nextStatus });
  };

  // ------------------------------------------------------------------
  // SCENE RENDERER: CLIENTS HUB
  // ------------------------------------------------------------------
  if (currentRoute === '/clients') {
    return (
      <div id="clients-portfolio-page" className="space-y-6 animate-in fade-in duration-200">
        
        {/* Hub Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Portfolio Client Roster</h3>
            <p className="text-xs text-slate-500">Add, configure, and monitor financials across your consulting accounts.</p>
          </div>
          <button
            id="add-client-toggle-btn"
            onClick={() => setShowAddClientForm(!showAddClientForm)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New Client</span>
          </button>
        </div>

        {/* Onboarding Form Card */}
        {showAddClientForm && (
          <div id="add-client-form-container" className="bg-white rounded-lg border border-slate-200 p-6 shadow-md max-w-2xl animate-in slide-in-from-top-4 duration-200">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 font-mono">Onboard Client Information</h4>
            <form onSubmit={handleAddClient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Contact Name</label>
                  <input
                    id="new-client-name"
                    type="text"
                    required
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Company / Corporate Identity</label>
                  <input
                    id="new-client-company"
                    type="text"
                    required
                    value={clientCompany}
                    onChange={(e) => setClientCompany(e.target.value)}
                    placeholder="e.g. Acme Corporation"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Industry Classification</label>
                  <input
                    id="new-client-industry"
                    type="text"
                    value={clientIndustry}
                    onChange={(e) => setClientIndustry(e.target.value)}
                    placeholder="e.g. E-Commerce"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Billing Hourly Rate ($ USD)</label>
                  <input
                    id="new-client-rate"
                    type="number"
                    value={clientHourlyRate}
                    onChange={(e) => setClientHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Email Address</label>
                  <input
                    id="new-client-email"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="billing@acme.com"
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-slate-500 font-semibold mb-1">Contract Notes / Scope</label>
                  <textarea
                    id="new-client-notes"
                    value={clientNotes}
                    onChange={(e) => setClientNotes(e.target.value)}
                    placeholder="Provide standard contract duration and focus deliverables..."
                    className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white h-20"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddClientForm(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="client-submit-btn"
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Onboard Client
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Client Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map(client => {
            // Calculate actual client statistics from activity logs
            const clientLogs = activities.filter(act => act.clientId === client.id);
            const totalClientHours = clientLogs.reduce((sum, act) => sum + act.duration, 0);
            const totalClientRevenue = clientLogs.reduce((sum, act) => sum + (act.revenueGenerated || 0), 0);
            const isEditing = editingClientId === client.id;

            return (
              <div
                key={client.id}
                className={`bg-white rounded-lg border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative ${
                  client.status === 'Inactive' ? 'opacity-60' : ''
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600">
                      <Users className="w-5 h-5" />
                    </div>
                    
                    {/* Active/Inactive badge and status options */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          const nextStatus = client.status === 'Active' ? 'Inactive' : 'Active';
                          updateClient(client.id, { status: nextStatus });
                        }}
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono border ${
                          client.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {client.status}
                      </button>
                    </div>
                  </div>

                  {/* Client Metadata Info */}
                  {isEditing ? (
                    <div className="space-y-3 mb-4 text-xs">
                      <input
                        type="text"
                        value={editClientName}
                        onChange={(e) => setEditClientName(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                      />
                      <input
                        type="text"
                        value={editClientCompany}
                        onChange={(e) => setEditClientCompany(e.target.value)}
                        className="w-full px-2 py-1 border border-slate-300 rounded"
                      />
                      <div className="flex items-center space-x-2">
                        <span>Rate:</span>
                        <input
                          type="number"
                          value={editClientHourlyRate}
                          onChange={(e) => setEditClientHourlyRate(Number(e.target.value))}
                          className="w-20 px-2 py-1 border border-slate-300 rounded"
                        />
                      </div>
                      <div className="flex space-x-1.5 justify-end">
                        <button onClick={() => setEditingClientId(null)} className="px-2 py-1 bg-slate-200 rounded text-[10px]">Cancel</button>
                        <button onClick={() => handleSaveClientEdit(client.id)} className="px-2 py-1 bg-blue-600 text-white font-semibold rounded text-[10px] cursor-pointer">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1 mb-4">
                      <h4 className="font-bold text-slate-950 text-sm leading-tight hover:text-blue-600 transition-colors">
                        {client.name}
                      </h4>
                      <p className="text-xs text-slate-505 flex items-center">
                        <Building className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {client.company}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono flex items-center">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400 mr-1" />
                        {client.industry} • {client.email}
                      </p>
                    </div>
                  )}

                  {client.notes && !isEditing && (
                    <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-3 leading-relaxed">
                      "{client.notes}"
                    </p>
                  )}
                </div>

                {/* Account Financials summary */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-medium block">Contract rate</span>
                    <span className="font-mono font-bold text-slate-800 text-xs">${client.hourlyRate}/hr</span>
                  </div>
                  <div className="bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-sans font-medium block">Gross Billings</span>
                    <span className="font-mono font-bold text-emerald-600 text-xs">${totalClientRevenue.toLocaleString()}</span>
                  </div>
                  <div className="col-span-2 flex items-center justify-between text-[10px] text-slate-500 px-1 font-mono">
                    <span>Total Hours Tracked:</span>
                    <span className="font-bold text-slate-800">{totalClientHours.toFixed(1)}h</span>
                  </div>
                </div>

                {/* Edit & Delete Actions */}
                {!isEditing && (
                  <div className="flex items-center justify-end space-x-3 mt-4 border-t border-slate-55 pt-3">
                    <button
                      id={`edit-client-btn-${client.id}`}
                      onClick={() => handleStartClientEdit(client)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-blue-600 transition-colors flex items-center cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Configure
                    </button>
                    <button
                      id={`delete-client-btn-${client.id}`}
                      onClick={() => deleteClient(client.id)}
                      className="text-[10px] font-semibold text-slate-400 hover:text-red-500 transition-colors flex items-center cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Remove Account
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------
  // SCENE RENDERER: TASK MANAGER
  // ------------------------------------------------------------------
  return (
    <div id="tasks-page" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Revenue-Impact Task Matrix</h3>
          <p className="text-xs text-slate-505">Keep laser focus on high-yield actions. Delegate low-impact tasks.</p>
        </div>
        <button
          id="add-task-toggle-btn"
          onClick={() => setShowAddTaskForm(!showAddTaskForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-colors shadow-sm flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Queue High-Impact Task</span>
        </button>
      </div>

      {/* Task Creation Modal Form */}
      {showAddTaskForm && (
        <div id="add-task-form-container" className="bg-white rounded-lg border border-slate-200 p-6 shadow-md max-w-xl animate-in slide-in-from-top-4 duration-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4 font-mono">Log Task Into Execution Matrix</h4>
          <form onSubmit={handleAddTask} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-slate-505 font-semibold mb-1">Task Title</label>
                <input
                  id="new-task-title"
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="e.g. Deploy Webhook Sync server and check API logs"
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-505 font-semibold mb-1">Impact Level (Value Generated)</label>
                <select
                  id="new-task-impact"
                  value={taskImpact}
                  onChange={(e) => setTaskImpact(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                >
                  <option value="High">High Revenue Impact (Primary Focus)</option>
                  <option value="Medium">Medium Revenue Impact</option>
                  <option value="Low">Low Revenue Impact (Delegate Candidate)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-505 font-semibold mb-1">Due Date</label>
                <input
                  id="new-task-date"
                  type="date"
                  required
                  value={taskDueDate}
                  onChange={(e) => setTaskDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-slate-505 font-semibold mb-1">Priority Order</label>
                <select
                  id="new-task-priority"
                  value={taskPriority}
                  onChange={(e) => setTaskPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                >
                  <option value="High">High Urgency</option>
                  <option value="Medium">Medium Urgency</option>
                  <option value="Low">Low Urgency</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-505 font-semibold mb-1">Est. Completion Time (Hours)</label>
                <input
                  id="new-task-hours"
                  type="number"
                  step="0.5"
                  value={taskHours}
                  onChange={(e) => setTaskHours(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-505 font-semibold mb-1">Client Association (Optional)</label>
                <select
                  id="new-task-client"
                  value={taskClientName}
                  onChange={(e) => setTaskClientName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 bg-slate-50 rounded-lg focus:outline-none focus:bg-white font-sans"
                >
                  <option value="">-- No Association --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddTaskForm(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="task-submit-btn"
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
              >
                Queue Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task Kanban Board Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Pending (To Do) */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Pending Tasks ({tasks.filter(t => t.status === 'Pending').length})</h4>
            <div className="w-2 h-2 rounded-full bg-red-400" />
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin">
            {tasks.filter(t => t.status === 'Pending').map(task => (
              <TaskCard key={task.id} task={task} onStatusToggle={handleToggleTaskStatus} onDelete={deleteTask} />
            ))}
          </div>
        </div>

        {/* Column 2: In Progress */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">In Progress ({tasks.filter(t => t.status === 'In Progress').length})</h4>
            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin">
            {tasks.filter(t => t.status === 'In Progress').map(task => (
              <TaskCard key={task.id} task={task} onStatusToggle={handleToggleTaskStatus} onDelete={deleteTask} />
            ))}
          </div>
        </div>

        {/* Column 3: Completed */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-200 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 font-mono">Completed ({tasks.filter(t => t.status === 'Completed').length})</h4>
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin">
            {tasks.filter(t => t.status === 'Completed').map(task => (
              <TaskCard key={task.id} task={task} onStatusToggle={handleToggleTaskStatus} onDelete={deleteTask} />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

// Internal reusable card item for Task Kanban board
const TaskCard = ({ task, onStatusToggle, onDelete }) => {
  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
      <div className="space-y-2 text-xs">
        
        {/* Dynamic Badges Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            {/* Urgency Badge */}
            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full uppercase border ${
              task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-200' :
              task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
              'bg-slate-100 text-slate-600 border-slate-200'
            }`}>
              {task.priority} Priority
            </span>
            
            {/* Revenue impact label */}
            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-full uppercase border ${
              task.revenueImpact === 'High' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
              task.revenueImpact === 'Medium' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-slate-55 text-slate-500 border-slate-200'
            }`}>
              {task.revenueImpact} Impact
            </span>
          </div>

          <button
            onClick={() => onDelete(task.id)}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 text-slate-400 hover:text-red-600 rounded transition-opacity cursor-pointer"
            title="Delete task"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>

        {/* Task Title */}
        <h5 className={`font-semibold text-slate-900 leading-relaxed ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
          {task.title}
        </h5>

        {/* Client Metadata */}
        {task.clientName && (
          <div className="text-[10px] text-blue-600 font-sans font-medium">
            Account: {task.clientName}
          </div>
        )}

        {/* Footer Meta: Est hours + due date */}
        <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
          <span className="flex items-center">
            <Clock className="w-3 h-3 mr-1" />
            {task.estimatedHours}h
          </span>
          <span className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            {new Date(task.dueDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Transition trigger button */}
        <button
          onClick={() => onStatusToggle(task.id, task.status)}
          className="w-full mt-2 py-1 bg-slate-55 hover:bg-slate-100 text-slate-600 font-bold text-[9px] uppercase tracking-wider border border-slate-200 rounded flex items-center justify-center space-x-1 cursor-pointer"
        >
          <span>Advance Status</span>
          <ChevronRight className="w-3 h-3" />
        </button>

      </div>
    </div>
  );
};
