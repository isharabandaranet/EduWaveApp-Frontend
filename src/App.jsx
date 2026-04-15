import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ModuleDetails from './pages/ModuleDetails';
import Planner from './pages/Planner';
import Community from './pages/Community';
import TopNav from './components/TopNav';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        
        <TopNav /> 
        
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/module/:id" element={<ModuleDetails />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/community" element={<Community />} />
          </Routes>
        </div>
        
        {/* App.jsx එකේ අන්තිම ටික */}
        <footer className="text-center py-6 text-xs text-gray-400 font-medium tracking-wide mt-auto">
          &copy; {new Date().getFullYear()} A Desinup Group Software Solution.
        </footer>

      </div>
    </BrowserRouter>
  );
}

export default App;