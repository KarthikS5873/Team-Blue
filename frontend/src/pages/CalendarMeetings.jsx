import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar as CalendarIcon, Clock, Plus, Video, Target, Users, DollarSign, ListTodo, Clipboard, Sparkles, CheckSquare, Trash2, HelpCircle } from 'lucide-react';

export const CalendarMeetings = () => {
  const {
    currentRoute,
    meetings,
    clients,
    activities,
    addMeeting,
    updateMeeting,
    deleteMeeting,
    user
  } = useApp();

  if (!user) return null;

  // ------------------------------------------------------------------
  // MEETING MANAGER STATE & CRUD (Route: "/meetings")
  // ------------------------------------------------------------------
  const [showAddForm, setShowAddForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState(new Date().toISOString().split('T')[0]);
  const [meetingTime, setMeetingTime] = useState('10:00');
  const [meetingDuration, setMeetingDuration] = useState(45); // in minutes
  const [meetingClientId, setMeetingClientId] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [meetingTasks, setMeetingTasks] = useState('');

  const handleCreateMeeting = (e) => {
    e.preventDefault();
    if (!meetingTitle) return;

    const assocClient = clients.find(c => c.id === meetingClientId);

    addMeeting({
      title: meetingTitle,
      date: meetingDate,
      time: meetingTime,
      duration: meetingDuration,
      clientId: meetingClientId || undefined,
      clientName: assocClient ? assocClient.name : undefined,
      agenda: meetingAgenda,
      notes: meetingNotes,
      actionableTasks: meetingTasks ? meetingTasks.split('\n').filter(t => t.trim()) : []
    });

    // Reset Form
    setMeetingTitle('');
    setMeetingAgenda('');
    setMeetingNotes('');
    setMeetingTasks('');
    setMeetingClientId('');
    setMeetingDuration(45);
    setShowAddForm(false);
  };

  // Checklist handler
  const handleToggleChecklistTask = (meetingId, taskIndex, currentTasks) => {
    const updatedTasks = [...currentTasks];
    const task = updatedTasks[taskIndex];
    if (task.startsWith('[x] ')) {
      updatedTasks[taskIndex] = task.replace('[x] ', '');
    } else {
      updatedTasks[taskIndex] = `[x] ${task}`;
    }
    updateMeeting(meetingId, { actionableTasks: updatedTasks });
  };

  // ------------------------------------------------------------------
  // INTERACTIVE CALENDAR STATE & RENDERING (Route: "/calendar")
  // ------------------------------------------------------------------
  // Generate a list of dates for the current week starting from today
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().split('T')[0]);

  const getWeekDays = () => {
    const today = new Date();
    const days = [];
    // Start from Monday of the current week
    const currentDay = today.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today.setDate(today.getDate() + distanceToMonday));

    for (let i = 0; i < 7; i++) {
      const nextDay = new Date(monday);
      nextDay.setDate(monday.getDate() + i);
      days.push(nextDay.toISOString().split('T')[0]);
    }
    return days;
  };

  const weekDays = getWeekDays();

  // Find all items on a specific date
  const getItemsForDate = (dateStr) => {
    const dayMeetings = meetings.filter(m => m.date === dateStr);
    const dayActivities = activities.filter(a => a.date === dateStr);
    return { meetings: dayMeetings, activities: dayActivities };
  };

  // ------------------------------------------------------------------
  // RENDERING SCENE: WEEKLY CALENDAR
  // ------------------------------------------------------------------
  if (currentRoute === '/calendar') {
    const dayDetails = getItemsForDate(selectedDay);

    return (
      <div id="calendar-page" className="space-y-6 animate-in fade-in duration-200">
        
        {/* Responsive Grid Calendar Header */}
        <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
          <h3 className="text-sm font-bold text-neutral-900 mb-4">Focus Hour Calendar</h3>
          
          <div className="grid grid-cols-7 gap-2.5">
            {weekDays.map(dateStr => {
              const d = new Date(dateStr + 'T00:00:00');
              const isSelected = selectedDay === dateStr;
              const isToday = new Date().toISOString().split('T')[0] === dateStr;
              
              const dayItems = getItemsForDate(dateStr);
              const totalItemsCount = dayItems.meetings.length + dayItems.activities.length;

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDay(dateStr)}
                  className={`p-3.5 rounded-xl border text-center cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-neutral-900 border-neutral-900 text-white shadow-md shadow-neutral-900/15'
                      : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-800'
                  }`}
                >
                  <p className="text-[10px] font-mono uppercase tracking-wider opacity-60">
                    {d.toLocaleDateString(undefined, { weekday: 'short' })}
                  </p>
                  <p className="text-lg font-black font-mono mt-1">
                    {d.getDate()}
                  </p>

                  {/* Bubble indicators */}
                  {totalItemsCount > 0 && (
                    <div className="flex items-center justify-center space-x-1 mt-2">
                      {dayItems.meetings.map(m => (
                        <div key={m.id} className="w-1.5 h-1.5 rounded-full bg-blue-500" title={`Meeting: ${m.title}`} />
                      ))}
                      {dayItems.activities.map(a => (
                        <div key={a.id} className="w-1.5 h-1.5 rounded-full bg-emerald-500" title={`Logged: ${a.title}`} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Detail panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Section A: Selected Day Meetings */}
          <div className="bg-white p-6 rounded-lg border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 text-blue-600 mb-4">
                <Video className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Day's Scheduled Syncs ({dayDetails.meetings.length})</h4>
              </div>

              <div className="space-y-4 divide-y divide-neutral-100">
                {dayDetails.meetings.length === 0 ? (
                  <p className="text-xs text-neutral-400 py-6">No client consultations scheduled on this day.</p>
                ) : (
                  dayDetails.meetings.map(meet => (
                    <div key={meet.id} className="pt-4 first:pt-0 text-xs">
                      <div className="flex items-start justify-between">
                        <div>
                          <h5 className="font-semibold text-neutral-900">{meet.title}</h5>
                          <p className="text-[10px] text-neutral-400 mt-1 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {meet.time} ({meet.duration}m)
                            {meet.clientName && (
                              <span className="ml-1.5 text-blue-600 font-sans font-semibold">• {meet.clientName}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right font-mono font-semibold text-neutral-500 text-[10px]">
                          Opp Cost: <span className="text-neutral-800 font-bold">${meet.opportunityCost}</span>
                        </div>
                      </div>
                      
                      {meet.agenda && (
                        <p className="mt-2 text-[11px] text-neutral-505 leading-relaxed font-sans bg-neutral-50 px-3 py-1.5 rounded border border-neutral-100">
                          <span className="font-bold text-neutral-700">Agenda:</span> {meet.agenda}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Section B: Selected Day Activities Logged */}
          <div className="bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
            <div className="flex items-center space-x-2 text-emerald-600 mb-4">
              <Clock className="w-4 h-4" />
              <h4 className="text-xs font-bold uppercase tracking-wider font-mono">Completed Logged Blocks ({dayDetails.activities.length})</h4>
            </div>

            <div className="space-y-4 divide-y divide-neutral-100">
              {dayDetails.activities.length === 0 ? (
                <p className="text-xs text-neutral-400 py-6">No completed hours recorded in the database ledger.</p>
              ) : (
                dayDetails.activities.map(act => (
                  <div key={act.id} className="pt-4 first:pt-0 text-xs flex justify-between items-center">
                    <div>
                      <h5 className="font-semibold text-neutral-900">{act.title}</h5>
                      <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mt-1">{act.category}</p>
                    </div>
                    <div className="text-right flex-shrink-0 font-mono">
                      <div className="font-bold text-neutral-800">{act.duration}h</div>
                      {act.billable ? (
                        <div className="text-[10px] text-emerald-600 font-bold">+${act.revenueGenerated}</div>
                      ) : (
                        <div className="text-[10px] text-amber-600">-${act.duration * (user.targetHourlyRate || 150)} leak</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>
    );
  }

  // ------------------------------------------------------------------
  // RENDERING SCENE: MEETING MANAGER HUB
  // ------------------------------------------------------------------
  return (
    <div id="meetings-hub-page" className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header toolbar */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-neutral-900">High-Value Meeting Syncs</h3>
          <p className="text-xs text-neutral-500">Track client agenda alignment and monitor unbillable cost values.</p>
        </div>
        <button
          id="add-meeting-toggle-btn"
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition-all shadow-md flex items-center space-x-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Meeting</span>
        </button>
      </div>

      {/* Schedule Form */}
      {showAddForm && (
        <div id="add-meeting-form-container" className="bg-white rounded-lg border border-neutral-200 p-6 shadow-md max-w-2xl animate-in slide-in-from-top-4 duration-200">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 font-mono font-semibold">Schedule Strategic Sync Info</h4>
          <form onSubmit={handleCreateMeeting} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-neutral-500 font-semibold mb-1">Meeting Title / Topic</label>
                <input
                  id="new-meeting-title"
                  type="text"
                  required
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  placeholder="e.g. Acme Corp Cloud Retainer Alignment"
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-500 font-semibold mb-1">Date</label>
                <input
                  id="new-meeting-date"
                  type="date"
                  required
                  value={meetingDate}
                  onChange={(e) => setMeetingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-505 font-semibold mb-1">Start Time</label>
                <input
                  id="new-meeting-time"
                  type="time"
                  required
                  value={meetingTime}
                  onChange={(e) => setMeetingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-neutral-505 font-semibold mb-1">Duration (Minutes)</label>
                <select
                  id="new-meeting-duration"
                  value={meetingDuration}
                  onChange={(e) => setMeetingDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes (Quick Sync)</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes (1 Hour Focus)</option>
                  <option value={90}>90 minutes (Deep Sync)</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-505 font-semibold mb-1">Associated Account</label>
                <select
                  id="new-meeting-client"
                  value={meetingClientId}
                  onChange={(e) => setMeetingClientId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">-- No Account Association --</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-505 font-semibold mb-1">Strategic Agenda Outline</label>
                <input
                  id="new-meeting-agenda"
                  type="text"
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  placeholder="Outline key discussion focus points..."
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-neutral-505 font-semibold mb-1">Actionable Checklist Tasks (One per line)</label>
                <textarea
                  id="new-meeting-checklist"
                  value={meetingTasks}
                  onChange={(e) => setMeetingTasks(e.target.value)}
                  placeholder="Write clear task items to complete during the sync..."
                  className="w-full px-3 py-2 border border-neutral-200 bg-neutral-50 rounded-lg h-16 font-mono focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Opportunity Cost Live tracker */}
            <div className="p-4 rounded-lg bg-slate-900 border text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                <span className="text-xs font-semibold font-mono uppercase tracking-wider text-slate-400">Meeting Cost Auditor:</span>
              </div>
              <div className="text-base font-bold text-amber-400 font-mono">
                -${(meetingDuration / 60) * (user.targetHourlyRate || 150)} USD Opportunity Cost
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-semibold rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                id="meeting-submit-btn"
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
              >
                Onboard Sync Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Meetings Card Listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {meetings.map(meet => {
          const optCost = meet.opportunityCost;
          return (
            <div key={meet.id} className="bg-white rounded-lg border border-neutral-200 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              
              <div className="space-y-4">
                {/* Meeting Header */}
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex-shrink-0">
                    <Video className="w-5 h-5" />
                  </div>
                  <div className="text-right font-mono text-[10px] text-neutral-400">
                    <div>Opportunity Expense:</div>
                    <div className="text-amber-600 font-bold text-xs">${optCost}</div>
                  </div>
                </div>

                {/* Info Text */}
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm leading-snug">{meet.title}</h4>
                  <div className="flex items-center space-x-2 text-[10px] text-neutral-400 mt-1.5 font-mono">
                    <span className="flex items-center">
                      <CalendarIcon className="w-3.5 h-3.5 mr-1" />
                      {new Date(meet.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {meet.time} ({meet.duration}m)
                    </span>
                    {meet.clientName && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 font-sans font-semibold">{meet.clientName}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Agenda Banner */}
                {meet.agenda && (
                  <div className="bg-neutral-50 px-3.5 py-2 rounded-lg border border-neutral-100 text-[11px] text-neutral-600 leading-relaxed font-sans">
                    <span className="font-bold text-neutral-800">Agenda Target:</span> {meet.agenda}
                  </div>
                )}

                {/* Actionable Checklist Checklist */}
                {meet.actionableTasks.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-neutral-100">
                    <h5 className="text-[10px] uppercase font-bold text-neutral-500 font-mono tracking-wider flex items-center">
                      <ListTodo className="w-3.5 h-3.5 mr-1 text-neutral-400" />
                      Actionable Sync Checklist
                    </h5>
                    <div className="space-y-1.5">
                      {meet.actionableTasks.map((task, idx) => {
                        const isChecked = task.startsWith('[x] ');
                        const label = isChecked ? task.replace('[x] ', '') : task;
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleChecklistTask(meet.id, idx, meet.actionableTasks)}
                            className="flex items-center space-x-2 text-[11px] text-neutral-600 cursor-pointer select-none hover:text-black transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className={isChecked ? 'line-through text-neutral-400' : ''}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Delete Button */}
              <div className="flex items-center justify-end mt-6 border-t border-neutral-50 pt-3">
                <button
                  id={`delete-meeting-btn-${meet.id}`}
                  onClick={() => deleteMeeting(meet.id)}
                  className="text-[10px] text-neutral-400 hover:text-red-500 font-semibold flex items-center transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  Cancel Sync
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
