import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, TrashIcon, CheckIcon, XIcon, WarningIcon, DragIcon } from '../components/Icons';

function Dashboard() {
  const navigate = useNavigate();

  const [modules, setModules] = useState([]);

  // ==========================================
  // API INTEGRATION (React <-> Python)
  // ==========================================

  // (A) Database එකෙන් Modules ටික අරන් එන ෆන්ක්ෂන් එක (GET API)
  const fetchModules = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/modules');
      const data = await response.json();
      
      // දැන් Database එකෙන්ම Order වෙලා එන නිසා කෙලින්ම Set කරනවා. (LocalStorage කෑලි නෑ)
      setModules(data); 
    } catch (error) {
      console.error("Backend එකෙන් ඩේටා ගන්න බැරි වුණා:", error);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newModuleName, setNewModuleName] = useState('');
  const [editingModule, setEditingModule] = useState({ id: null, text: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
  const [draggedModuleIndex, setDraggedModuleIndex] = useState(null);

  // (B) අලුත් Module එකක් Database එකට යවන ෆන්ක්ෂන් එක (POST API)
  const handleAddModule = async () => {
    if (newModuleName.trim() !== '') {
      try {
        const response = await fetch('http://127.0.0.1:5000/modules', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newModuleName })
        });

        if (response.ok) {
          fetchModules(); 
          setNewModuleName('');
          setIsModalOpen(false);
        }
      } catch (error) {
        console.error("Module එක සේව් කරන්න බැරි වුණා:", error);
      }
    }
  };

  // (C) Module එකක් Edit කරන API Call එක (PUT)
  const saveModuleEdit = async () => {
    if (editingModule.text.trim()) {
      try {
        const response = await fetch(`http://127.0.0.1:5000/modules/${editingModule.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: editingModule.text })
        });

        if (response.ok) {
          fetchModules(); 
        }
      } catch (error) {
        console.error("Module එක Edit කරන්න බැරි වුණා:", error);
      }
    }
    setEditingModule({ id: null, text: '' });
  };

  // (D) Module එකක් Delete කරන API Call එක (DELETE)
  const executeDeleteModule = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/modules/${deleteModal.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchModules(); 
      }
    } catch (error) {
      console.error("Module එක මකන්න බැරි වුණා:", error);
    }
    setDeleteModal({ isOpen: false, id: null, name: '' });
  };

  // ==========================================
  // Drag and Drop Logic (Database Integration)
  // ==========================================
  const handleDragStart = (e, index) => {
    setDraggedModuleIndex(index);
    e.dataTransfer.effectAllowed = "move";
  };
  
  const handleDragOver = (e) => e.preventDefault();
  
  const handleDrop = async (e, targetIndex) => {
    e.preventDefault();
    if (draggedModuleIndex !== null && draggedModuleIndex !== targetIndex) {
      const updatedModules = [...modules];
      const [movedItem] = updatedModules.splice(draggedModuleIndex, 1);
      updatedModules.splice(targetIndex, 0, movedItem);
      
      setModules(updatedModules); // UI එකේ ඉක්මනට වෙනස පෙන්නන්න දානවා
      
      // අලුත් Order එකේ ID ටික අරගෙන Backend එකට යවනවා
      const orderedIds = updatedModules.map(m => m.id);
      
      try {
        await fetch('http://127.0.0.1:5000/modules/reorder', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ordered_ids: orderedIds })
        });
      } catch (error) {
        console.error("Order එක සේව් කරන්න බැරි වුණා:", error);
      }
    }
    setDraggedModuleIndex(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto animation-fade-in">
      
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-800">My Workspace</h1>
          <p className="text-gray-500 text-sm mt-1">Select a module to continue</p>
        </div>
        
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition font-bold flex items-center gap-2">
          <span className="text-xl leading-none">+</span> Add Module
        </button>
      </div>

      {modules.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-300 rounded-2xl bg-white flex flex-col items-center justify-center shadow-sm">
          <div className="text-5xl mb-4 opacity-50">📁</div>
          <h4 className="text-2xl font-bold text-gray-700 mb-2">No Modules Found</h4>
          <p className="text-gray-500 mb-6 max-w-md">You haven't added any modules yet. Create your first module to start organizing your study materials.</p>
          <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:bg-blue-700 transition">
            Create First Module
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {modules.map((mod, index) => {
            return (
              <div 
                key={mod.id} 
                draggable
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => navigate(`/module/${mod.id}`)} 
                className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-l-4 border-l-blue-600 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 relative group ${draggedModuleIndex === index ? 'opacity-50 border-dashed border-2 border-blue-400' : ''}`}
              >
                {editingModule.id === mod.id ? (
                  <div className="flex items-center gap-2 w-full mb-2" onClick={(e) => e.stopPropagation()}>
                    <input type="text" value={editingModule.text} onChange={(e) => setEditingModule({...editingModule, text: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') saveModuleEdit(); if(e.key === 'Escape') setEditingModule({id: null, text: ''}); }} className="w-full border-b-2 border-blue-500 bg-blue-50 px-2 py-1 text-gray-800 font-bold outline-none text-xl rounded-t-md" autoFocus />
                    <button onClick={saveModuleEdit} className="text-green-600 hover:text-green-800 bg-green-100 p-1.5 rounded-lg" title="Save"><CheckIcon /></button>
                    <button onClick={() => setEditingModule({id: null, text: ''})} className="text-red-500 hover:text-red-700 bg-red-100 p-1.5 rounded-lg" title="Cancel"><XIcon /></button>
                  </div>
                ) : (
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div title="Drag to move" className="text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing" onClick={(e) => e.stopPropagation()}>
                        <DragIcon />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 pr-8 leading-tight">{mod.name}</h2>
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition flex gap-2" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => setEditingModule({id: mod.id, text: mod.name})} className="text-gray-400 hover:text-blue-600 bg-gray-50 p-2 rounded-lg border border-gray-200 hover:border-blue-300 transition shadow-sm" title="Edit Name"><EditIcon /></button>
                      <button onClick={() => setDeleteModal({isOpen: true, id: mod.id, name: mod.name})} className="text-gray-400 hover:text-red-600 bg-gray-50 p-2 rounded-lg border border-gray-200 hover:border-red-300 transition shadow-sm" title="Delete Module"><TrashIcon /></button>
                    </div>
                  </div>
                )}
                <div className="mt-6 flex gap-3 text-sm font-semibold pl-8">
                  <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100">📄 {mod.notes_count || 0} Notes</span>
                  <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-blue-100">📝 {mod.papers_count || 0} Papers</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px]">
            <h2 className="text-2xl font-extrabold mb-6 text-gray-800">Add New Module</h2>
            <input type="text" placeholder="e.g. Computer Architecture" className="w-full border border-gray-300 p-4 rounded-xl mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 font-medium" value={newModuleName} onChange={(e) => setNewModuleName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddModule()} autoFocus />
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsModalOpen(false)} className="px-6 py-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition font-bold">Cancel</button>
              <button onClick={handleAddModule} className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-bold shadow-md">Add Module</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-[400px] flex flex-col items-center text-center">
            <WarningIcon />
            <h2 className="text-2xl font-extrabold mb-2 text-gray-800">Delete Module?</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteModal.name}"</span>? All notes and papers inside will be permanently lost.</p>
            <div className="flex justify-center gap-4 w-full">
              <button onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })} className="flex-1 py-3 text-gray-600 bg-gray-100 font-bold rounded-xl hover:bg-gray-200 transition">Cancel</button>
              <button onClick={executeDeleteModule} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-md hover:bg-red-700 transition">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;