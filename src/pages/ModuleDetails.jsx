import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WarningIcon, RobotIcon } from '../components/Icons';
import SharedMaterialTab from '../components/SharedMaterialTab';
import AITab from '../components/AITab';

function ModuleDetails() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('lecture_notes');
  const [moduleTitle, setModuleTitle] = useState('Loading Module...');

  const [lectureSections, setLectureSections] = useState([]);
  const [mySections, setMySections] = useState([]);
  const [paperYears, setPaperYears] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); 
  const [newName, setNewName] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingItem, setEditingItem] = useState({ id: null, type: null, text: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, sectionId: null, type: null, isFile: false, fileIndex: null, itemName: '' });

  // ==========================================
  // API: Fetch Data
  // ==========================================
  const fetchModuleDetails = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:5000/modules/${id}/details`);
      const data = await response.json();

      const mappedLectures = data.lecture_topics.map(topic => ({
        id: topic.id, name: topic.name,
        notes: data.files.filter(f => f.topic_id === topic.id && f.topic_type === 'lecture')
          .map(f => ({ id: f.id, real_name: f.file_name, name: f.file_name.split('_').slice(1).join('_'), size: f.file_size }))
      }));
      setLectureSections(mappedLectures);

      const mappedPersonal = data.personal_topics.map(topic => ({
        id: topic.id, name: topic.name,
        notes: data.files.filter(f => f.topic_id === topic.id && f.topic_type === 'personal')
          .map(f => ({ id: f.id, real_name: f.file_name, name: f.file_name.split('_').slice(1).join('_'), size: f.file_size }))
      }));
      setMySections(mappedPersonal);

      const mappedPapers = data.past_papers.map(topic => ({
        id: topic.id, year: topic.year,
        papers: data.files.filter(f => f.topic_id === topic.id && f.topic_type === 'paper')
          .map(f => ({ id: f.id, real_name: f.file_name, name: f.file_name.split('_').slice(1).join('_'), size: f.file_size }))
      }));
      setPaperYears(mappedPapers);
    } catch (error) { console.error("ඩේටා ගන්න බැරි වුණා:", error); }
  };

  useEffect(() => {
    fetch('http://127.0.0.1:5000/modules')
      .then(res => res.json())
      .then(data => {
        const currentModule = data.find(m => m.id.toString() === id);
        if (currentModule) setModuleTitle(currentModule.name);
      });
    fetchModuleDetails();
  }, [id]);

  // ==========================================
  // API: Add & Upload
  // ==========================================
  const handleAddItem = async () => {
    if (newName.trim() !== '') {
      try {
        const response = await fetch(`http://127.0.0.1:5000/modules/${id}/${modalType}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newName }) 
        });
        if (response.ok) { fetchModuleDetails(); setNewName(''); setIsModalOpen(false); }
      } catch (error) { console.error(error); }
    }
  };

  const handleFileUpload = async (event, type, sectionId) => {
    const file = event.target.files[0];
    if (!file || file.type !== "application/pdf") return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('topic_id', sectionId);
    formData.append('topic_type', type);
    try {
      const response = await fetch('http://127.0.0.1:5000/upload', { method: 'POST', body: formData });
      if (response.ok) fetchModuleDetails();
    } catch (error) { console.error(error); }
  };

  // ==========================================
  // API: Edit & Delete
  // ==========================================
  const executeDelete = async () => {
    const { sectionId, type, isFile, fileIndex } = deleteModal;
    try {
      if (isFile) {
        const list = type === 'lecture' ? lectureSections : type === 'personal' ? mySections : paperYears;
        const section = list.find(s => s.id === sectionId);
        const targetFile = (type === 'paper' ? section.papers : section.notes)[fileIndex];
        await fetch(`http://127.0.0.1:5000/files/${targetFile.id}`, { method: 'DELETE' });
      } else {
        await fetch(`http://127.0.0.1:5000/topics/${type}/${sectionId}`, { method: 'DELETE' });
      }
      fetchModuleDetails();
    } catch (error) { console.error(error); }
    setDeleteModal({ ...deleteModal, isOpen: false });
  };

  const saveEditing = async () => {
    if (!editingItem.text.trim()) { cancelEditing(); return; }
    try {
      await fetch(`http://127.0.0.1:5000/topics/${editingItem.type}/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editingItem.text })
      });
      fetchModuleDetails();
    } catch (error) { console.error(error); }
    cancelEditing();
  };

  // ==========================================
  // API: Drag & Drop (Reorder)
  // ==========================================
  const onDrop = async (e, targetIndex, type, sectionId) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) { 
      handleFileUpload({ target: { files: e.dataTransfer.files } }, type, sectionId); 
      return; 
    }
    if (draggedItem && draggedItem.type === type && draggedItem.index !== targetIndex) {
      const list = type === 'lecture' ? [...lectureSections] : type === 'personal' ? [...mySections] : [...paperYears];
      const setter = type === 'lecture' ? setLectureSections : type === 'personal' ? setMySections : setPaperYears;
      const [movedItem] = list.splice(draggedItem.index, 1);
      list.splice(targetIndex, 0, movedItem);
      setter(list); // UI Update
      
      const orderedIds = list.map(item => item.id);
      try {
        await fetch(`http://127.0.0.1:5000/topics/${type}/reorder`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ordered_ids: orderedIds })
        });
      } catch (error) { console.error(error); }
    }
    setDraggedItem(null);
  };

  // Helpers
  const startEditing = (id, type, currentText) => setEditingItem({ id, type, text: currentText });
  const cancelEditing = () => setEditingItem({ id: null, type: null, text: '' });
  const onDragStart = (e, index, type) => { setDraggedItem({ index, type }); e.dataTransfer.effectAllowed = "move"; };
  const onDragOver = (e) => { e.preventDefault(); };
  const openModal = (type) => { setModalType(type); setIsModalOpen(true); };
  const promptDeleteSection = (sectionId, type, itemName) => setDeleteModal({ isOpen: true, sectionId, type, isFile: false, fileIndex: null, itemName });
  const promptDeleteFile = (sectionId, fileIndex, type, itemName) => setDeleteModal({ isOpen: true, sectionId, type, isFile: true, fileIndex, itemName });

  // ==========================================
  // PDF Viewer & AI Tab Helper (New Tab Logic)
  // ==========================================
  const getRealFileName = (displayName) => {
    const allFiles = [...lectureSections.flatMap(s => s.notes), ...mySections.flatMap(s => s.notes), ...paperYears.flatMap(s => s.papers)];
    const found = allFiles.find(f => f.name === displayName);
    return found ? found.real_name : displayName;
  };

  const handleViewFile = (fileName) => {
    // AI කෑල්ලක් නම්
    if (fileName.includes("Feature") || fileName.includes("Generator") || fileName.includes("Chat")) {
      alert(`AI Feature Integration Coming Next!\n(You clicked: ${fileName})`);
      return;
    }
    // ඇත්ත PDF එකක් නම් අලුත් ටැබ් එකක ඕපන් කරනවා
    const realFileName = getRealFileName(fileName);
    window.open(`http://127.0.0.1:5000/uploads/${realFileName}`, '_blank');
  };

  const tabProps = {
    openModal, editingItem, setEditingItem, saveEditing, cancelEditing, startEditing,
    promptDeleteSection, handleFileUpload, onDragStart, onDragOver, onDrop,
    promptDeleteFile, handleViewFile
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="flex-grow p-8">
        
        {/* Header */}
        <div className="flex items-center gap-5 mb-8 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
          <button onClick={() => navigate('/')} className="bg-gray-50 p-3 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition shadow-sm border border-gray-200 group" title="Back to Dashboard">
            <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">{moduleTitle}</h1>
            <p className="text-gray-500 text-sm mt-1">Organize your study materials efficiently.</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-gray-200 pb-4 mb-6 overflow-x-auto">
          <button onClick={() => setActiveTab('lecture_notes')} className={`px-4 py-2 font-semibold rounded-lg whitespace-nowrap transition ${activeTab === 'lecture_notes' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>📚 Lecture Notes</button>
          <button onClick={() => setActiveTab('my_notes')} className={`px-4 py-2 font-semibold rounded-lg whitespace-nowrap transition ${activeTab === 'my_notes' ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-100'}`}>✍️ My Notes</button>
          <button onClick={() => setActiveTab('papers')} className={`px-4 py-2 font-semibold rounded-lg whitespace-nowrap transition ${activeTab === 'papers' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'}`}>📝 Past Papers</button>
          <button onClick={() => setActiveTab('ai')} className={`px-5 py-2 font-bold rounded-lg flex items-center gap-2 whitespace-nowrap transition-all duration-200 ${activeTab === 'ai' ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md border-transparent' : 'bg-white border-2 border-purple-100 text-purple-700 hover:bg-purple-50 hover:border-purple-300'}`}>
            <RobotIcon /> AI Study Guide
          </button>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 min-h-[400px]">
          {activeTab === 'lecture_notes' && (
            <SharedMaterialTab title="Lecture Notes" emptyIcon="📂" emptyTitle="No Topics Added Yet" emptyDesc="Create a topic to start organizing your lecture notes." btnText="Create First Topic" type="lecture" data={lectureSections} nameKey="name" listKey="notes" {...tabProps} />
          )}
          {activeTab === 'my_notes' && (
            <SharedMaterialTab title="My Personal Notes" emptyIcon="✍️" emptyTitle="No Topics Added Yet" emptyDesc="Create a topic to upload your handwritten summaries." btnText="Create First Topic" type="personal" data={mySections} nameKey="name" listKey="notes" {...tabProps} />
          )}
          {activeTab === 'papers' && (
            <SharedMaterialTab title="Past Exam Papers" emptyIcon="📝" emptyTitle="No Past Papers Added" emptyDesc="Add examination years to organize your past papers." btnText="Add First Paper" type="paper" data={paperYears} nameKey="year" listKey="papers" {...tabProps} />
          )}
          {activeTab === 'ai' && (
            <AITab handleAIFeatureClick={(feature) => handleViewFile(feature)} lectureSections={lectureSections} mySections={mySections} paperYears={paperYears} />
          )}
        </div>

        {/* Delete Modal */}
        {deleteModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96 flex flex-col items-center text-center">
              <WarningIcon />
              <h2 className="text-xl font-bold mb-2 text-gray-800">Delete {deleteModal.isFile ? 'File' : 'Section'}?</h2>
              <p className="text-gray-500 mb-6">Are you sure you want to delete <span className="font-bold text-gray-800">"{deleteModal.itemName}"</span>? This action cannot be undone.</p>
              <div className="flex justify-center gap-3 w-full">
                <button onClick={() => setDeleteModal({ ...deleteModal, isOpen: false })} className="flex-1 py-2 text-gray-600 bg-gray-100 font-semibold rounded-lg hover:bg-gray-200 transition">Cancel</button>
                <button onClick={executeDelete} className="flex-1 py-2 bg-red-600 text-white rounded-lg font-semibold shadow-md hover:bg-red-700 transition">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-xl shadow-lg w-96">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Add {modalType === 'paper' ? 'Year' : 'Topic'}</h2>
              <input type="text" className="w-full border p-3 rounded-lg mb-4 focus:ring-2 focus:ring-gray-800 outline-none" placeholder={modalType === 'lecture' ? 'e.g. Week 2: Logic Gates' : modalType === 'personal' ? 'e.g. My Summary - Chapter 1' : 'e.g. 2024'} value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddItem()} autoFocus />
              <div className="flex justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-500 font-semibold hover:bg-gray-100 rounded-lg transition">Cancel</button>
                <button onClick={handleAddItem} className="px-6 py-2 bg-gray-800 text-white rounded-lg font-semibold shadow-md hover:bg-gray-900 transition">Add</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ModuleDetails;