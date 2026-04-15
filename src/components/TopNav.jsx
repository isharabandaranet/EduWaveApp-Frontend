import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { EduWaveLogo } from './EduWaveLogo';
import { UsersIcon, TimerIcon, BookIcon } from './Icons'; // <--- BookIcon එක ගත්තා

const TopNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm sticky top-0 z-50">
      
      <div className="flex items-center gap-8">
        <div className="cursor-pointer" onClick={() => navigate('/')}>
          <EduWaveLogo />
        </div>

        <div className="hidden md:flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${path === '/' || path.startsWith('/module') ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <BookIcon /> Modules {/* <--- මෙතන ඉමෝජි එක වෙනුවට BookIcon එක දැම්මා */}
          </button>
          
          <button
            onClick={() => navigate('/planner')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${path === '/planner' ? 'bg-white text-purple-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <TimerIcon /> Focus Planner
          </button>
          
          <button
            onClick={() => navigate('/community')}
            className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold text-sm transition-all ${path === '/community' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <UsersIcon /> Community
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-purple-500 text-white rounded-full flex items-center justify-center font-bold shadow-md cursor-pointer hover:scale-105 transition-transform">
          ME
        </div>
      </div>

    </div>
  );
};

export default TopNav;