import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TimerIcon, ListIcon, CalendarIcon, ChartIcon, PlayIcon, PauseIcon, ResetIcon, TrashIcon } from '../components/Icons';

function Planner() {
  const navigate = useNavigate();

  // --- Pomodoro State ---
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerMode, setTimerMode] = useState('focus'); // focus, shortBreak, longBreak

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alert(timerMode === 'focus' ? "Time for a break!" : "Break is over! Back to work!");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, timerMode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    if (timerMode === 'focus') setTimeLeft(25 * 60);
    else if (timerMode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const switchMode = (mode) => {
    setTimerMode(mode);
    setIsActive(false);
    if (mode === 'focus') setTimeLeft(25 * 60);
    else if (mode === 'shortBreak') setTimeLeft(5 * 60);
    else setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- To-Do List State ---
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Review Week 2 Slides', completed: false },
    { id: 2, text: 'Complete Past Paper 2024', completed: true }
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim()) {
      setTasks([...tasks, { id: Date.now(), text: newTask, completed: false }]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  const deleteTask = (id) => setTasks(tasks.filter(t => t.id !== id));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-8 max-w-7xl mx-auto w-full animation-fade-in">
        
        {/* Clean Header - Planner.jsx */}
        <div className="mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-extrabold text-gray-800">Focus & Planner</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your time, tasks, and stay productive.</p>
        </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Column 1: Pomodoro Timer */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-red-400 to-orange-500"></div>
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 border border-red-100 shadow-inner">
              <TimerIcon />
            </div>
            <h2 className="text-xl font-extrabold text-gray-800 mb-6">Pomodoro Timer</h2>

            <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl mb-8">
              <button onClick={() => switchMode('focus')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${timerMode === 'focus' ? 'bg-white text-red-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Focus</button>
              <button onClick={() => switchMode('shortBreak')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${timerMode === 'shortBreak' ? 'bg-white text-green-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Short Break</button>
              <button onClick={() => switchMode('longBreak')} className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${timerMode === 'longBreak' ? 'bg-white text-blue-500 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>Long Break</button>
            </div>

            <div className={`text-7xl font-black mb-8 tracking-tighter ${timerMode === 'focus' ? 'text-red-500' : timerMode === 'shortBreak' ? 'text-green-500' : 'text-blue-500'}`}>
              {formatTime(timeLeft)}
            </div>

            <div className="flex items-center gap-4">
              <button onClick={toggleTimer} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-extrabold shadow-lg transition-transform transform hover:scale-105 ${timerMode === 'focus' ? 'bg-red-500 hover:bg-red-600' : timerMode === 'shortBreak' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}>
                {isActive ? <><PauseIcon /> Pause</> : <><PlayIcon /> Start</>}
              </button>
              <button onClick={resetTimer} className="p-3.5 bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800 rounded-xl transition-colors" title="Reset">
                <ResetIcon />
              </button>
            </div>
          </div>

          {/* Column 2: Daily To-Do List */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center border border-blue-100 shadow-inner"><ListIcon /></div>
              <h2 className="text-xl font-extrabold text-gray-800">Today's Tasks</h2>
            </div>

            <div className="flex gap-2 mb-6">
              <input type="text" value={newTask} onChange={(e) => setNewTask(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addTask()} placeholder="Add a new task..." className="flex-grow bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button onClick={addTask} className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-blue-700 shadow-md">+</button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-2">
              {tasks.length === 0 ? <p className="text-gray-400 text-sm text-center py-4">All caught up! 🎉</p> : 
                tasks.map(task => (
                  <div key={task.id} className={`flex justify-between items-center p-4 rounded-xl border transition-all ${task.completed ? 'bg-gray-50 border-gray-200 opacity-60' : 'bg-white border-gray-200 shadow-sm hover:border-blue-300'}`}>
                    <label className="flex items-center gap-3 cursor-pointer flex-grow">
                      <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task.id)} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      <span className={`font-semibold ${task.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{task.text}</span>
                    </label>
                    <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 transition-colors p-1"><TrashIcon /></button>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Column 3: Calendar & Progress */}
          <div className="flex flex-col gap-8">
            
            {/* Smart Calendar Mockup */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden flex-grow">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-400 to-indigo-600"></div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100 shadow-inner"><CalendarIcon /></div>
                <div>
                  <h2 className="text-xl font-extrabold text-gray-800">Upcoming Deadlines</h2>
                  <p className="text-xs text-gray-400">Syncs with Google Calendar 🚀</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-4 items-center">
                  <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-2 text-center min-w-[60px]">
                    <p className="text-xs font-bold uppercase">APR</p><p className="text-xl font-black">10</p>
                  </div>
                  <div><p className="font-bold text-gray-800">Discrete Math Exam</p><p className="text-xs text-gray-500">10:00 AM - Main Hall</p></div>
                </div>
                <div className="flex gap-4 items-center">
                  <div className="bg-orange-50 border border-orange-200 text-orange-600 rounded-lg p-2 text-center min-w-[60px]">
                    <p className="text-xs font-bold uppercase">APR</p><p className="text-xl font-black">14</p>
                  </div>
                  <div><p className="font-bold text-gray-800">Web Dev Assignment</p><p className="text-xs text-gray-500">Submit via EduWave</p></div>
                </div>
              </div>
              <button className="w-full mt-6 py-2 border-2 border-dashed border-gray-300 text-gray-500 rounded-xl font-bold hover:bg-gray-50 transition">+ Add Event</button>
            </div>

            {/* Progress Analytics Mockup */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 to-emerald-600"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center border border-green-100 shadow-inner"><ChartIcon /></div>
                <h2 className="text-lg font-extrabold text-gray-800">Weekly Progress</h2>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-3xl font-black text-gray-800">12<span className="text-lg text-gray-400 font-bold">h</span> 30<span className="text-lg text-gray-400 font-bold">m</span></p>
                  <p className="text-sm text-green-600 font-bold">↑ 2h more than last week</p>
                </div>
                {/* Fake Bar Chart */}
                <div className="flex gap-1.5 items-end h-16">
                  <div className="w-4 bg-gray-200 rounded-t-sm h-8"></div>
                  <div className="w-4 bg-gray-200 rounded-t-sm h-12"></div>
                  <div className="w-4 bg-green-500 rounded-t-sm h-16 shadow-sm"></div>
                  <div className="w-4 bg-gray-200 rounded-t-sm h-10"></div>
                  <div className="w-4 bg-gray-200 rounded-t-sm h-14"></div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

export default Planner;