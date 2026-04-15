import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SummaryIcon, PaperSupportIcon, MCQIcon, RobotIcon, TrashIcon, XIcon } from './Icons';
import MultiSelectDropdown from './MultiSelectDropdown';

// 🌟 අර ලෙඩේ දෙන ලයිබ්‍රරි ඔක්කොම අයින් කරා. මේ දෙක විතරක් තියාගත්තා.
import katex from 'katex';
import 'katex/dist/katex.min.css';

const StarIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
);
const StarFilledIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" style={{ color: '#F59E0B' }}><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
);

const AITab = ({ lectureSections, mySections, paperYears }) => {
  const { id: moduleId } = useParams(); 

  const allMaterials = [
    ...lectureSections.flatMap(sec => sec.notes.map(note => ({ id: `lec_${sec.id}_${note.real_name}`, name: note.name, sectionName: sec.name }))),
    ...mySections.flatMap(sec => sec.notes.map(note => ({ id: `my_${sec.id}_${note.real_name}`, name: note.name, sectionName: sec.name }))),
    ...paperYears.flatMap(year => year.papers.map(paper => ({ id: `pap_${year.id}_${paper.real_name}`, name: paper.name, sectionName: `Year ${year.year}` })))
  ];

  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [userQuery, setUserQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showStarredModal, setShowStarredModal] = useState(false);

  const chatContainerRef = useRef(null);

  // 🌟 Math & Simple Markdown Formatter (අතින් ලිව්වේ Crash වෙන්නේ නැති වෙන්න)
  const formatMessage = (text) => {
    if (!text || typeof text !== 'string') return { __html: '' };
    let htmlText = text;
    // Block Math $$...$$
    htmlText = htmlText.replace(/\$\$([\s\S]*?)\$\$/g, (m, math) => {
      try { return katex.renderToString(math, { displayMode: true, throwOnError: false }); } catch (e) { return m; }
    });
    // Inline Math $...$
    htmlText = htmlText.replace(/\$([^\$]*?)\$/g, (m, math) => {
      try { return katex.renderToString(math, { displayMode: false, throwOnError: false }); } catch (e) { return m; }
    });
    // Bold
    htmlText = htmlText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-900">$1</strong>');
    // New Lines
    htmlText = htmlText.replace(/\n/g, '<br/>');
    return { __html: htmlText };
  };

  const parseAttachedFiles = (filesStr) => {
    if (!filesStr) return [];
    try { return JSON.parse(filesStr); } catch (e) { return []; }
  };

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/chat/${moduleId}`);
        const data = await res.json();
        if (data.length > 0) {
          const hasActiveMessages = data.some(msg => !msg.is_cleared);
          if (!hasActiveMessages) {
             setChatHistory([...data, { id: `temp_${Date.now()}`, role: 'ai', text: "Hello! මම ඔයාගේ EduWave AI Tutor. අද මොනවද ඉගෙනගන්න ඕනේ?", is_starred: false, is_cleared: false, attached_files: null }]);
          } else { setChatHistory(data); }
        } else {
          setChatHistory([{ id: `temp_${Date.now()}`, role: 'ai', text: "Hello! මම ඔයාගේ EduWave AI Tutor. අද මොනවද ඉගෙනගන්න ඕනේ?", is_starred: false, is_cleared: false, attached_files: null }]);
        }
      } catch (error) { console.error("History fetch error:", error); }
    };
    fetchChatHistory();
  }, [moduleId]);

  useEffect(() => {
    if (chatContainerRef.current) { chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight; }
  }, [chatHistory, isGenerating]);

  const clearChat = async () => {
    try {
      await fetch(`http://127.0.0.1:5000/api/chat/${moduleId}`, { method: 'DELETE' });
      const updatedHistory = chatHistory.filter(msg => msg.is_starred).map(msg => ({ ...msg, is_cleared: true }));
      setChatHistory([...updatedHistory, { id: `temp_${Date.now()}`, role: 'ai', text: "Hello! චැට් එක ක්ලියර් කරා. අලුතින් ප්‍රශ්න අහන්න පුළුවන්!", is_starred: false, is_cleared: false, attached_files: null }]);
    } catch (e) { console.error(e); }
  };

  const toggleStar = async (msgId, currentStatus) => {
    if (typeof msgId === 'string' && msgId.startsWith('temp_')) return; 
    setChatHistory(prev => prev.map(msg => msg.id === msgId ? { ...msg, is_starred: !currentStatus } : msg));
    try { await fetch(`http://127.0.0.1:5000/api/chat/star/${msgId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_starred: !currentStatus }) }); } catch (e) {}
  };

  const handleSend = async (featureType = 'General Chat') => {
    if (!userQuery.trim()) return;
    const attachedNames = selectedMaterials.map(item => item.name);
    const selectedFilesList = selectedMaterials.map(item => item.id.split('_').slice(2).join('_'));
    const displayMsg = userQuery;
    
    setChatHistory(prev => [...prev, { role: 'user', text: displayMsg, attached_files: JSON.stringify(attachedNames), is_starred: false, is_cleared: false }]);
    setUserQuery('');
    setSelectedMaterials([]);
    setIsGenerating(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          module_id: moduleId,
          feature_type: featureType, 
          selected_files: selectedFilesList,
          attached_file_names: attachedNames,
          user_query: displayMsg,
          chat_history: chatHistory.filter(m => !m.is_cleared && (!m.id || !m.id.toString().startsWith('temp_'))) 
        })
      });
      const data = await response.json();
      if (response.ok) { setChatHistory(prev => [...prev, { id: data.id, role: 'ai', text: data.result, attached_files: null, is_starred: false, is_cleared: false }]); }
      else { setChatHistory(prev => [...prev, { role: 'ai', text: `❌ Error: ${data.error}`, attached_files: null, is_starred: false, is_cleared: false }]); }
    } catch (e) { setChatHistory(prev => [...prev, { role: 'ai', text: "❌ Connection Failed.", attached_files: null, is_starred: false, is_cleared: false }]); }
    setIsGenerating(false);
  };

  const starredMessages = chatHistory.filter(msg => msg.is_starred);
  const activeChat = chatHistory.filter(msg => !msg.is_cleared);

  return (
    <div className="flex flex-col h-[65vh] min-h-[500px] w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm animation-fade-in -mt-2 relative">
      <div className="bg-gray-50 p-3 sm:p-4 border-b border-gray-200 flex justify-between items-center z-10">
         <div className="flex items-center gap-2 px-2">
            <RobotIcon className="w-6 h-6 text-purple-600" />
            <div>
               <h2 className="text-base font-extrabold text-gray-800 leading-tight">EduWave AI</h2>
               <p className="text-[10px] text-gray-500 font-medium">Smart Study Assistant</p>
            </div>
         </div>
         <div className="flex gap-2">
            <button onClick={() => setShowStarredModal(true)} className="flex items-center gap-1.5 text-yellow-600 hover:text-yellow-700 bg-yellow-50 border border-yellow-200 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"><StarFilledIcon className="w-3.5 h-3.5" /> Saved ({starredMessages.length})</button>
            <button onClick={clearChat} className="flex items-center gap-1.5 text-gray-500 hover:text-red-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"><TrashIcon className="w-3.5 h-3.5" /> Clear</button>
         </div>
      </div>

      {showStarredModal && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col animation-fade-in">
           <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
             <div className="flex items-center gap-2 text-yellow-600 font-bold"><StarFilledIcon /> <span>Saved Answers</span></div>
             <button onClick={() => setShowStarredModal(false)} className="text-gray-500 hover:text-red-500 transition font-bold p-1 bg-white border border-gray-300 rounded"><XIcon /></button>
           </div>
           <div className="flex-grow overflow-y-auto p-6 bg-slate-50 space-y-4">
              {starredMessages.length === 0 ? <p className="text-center text-gray-400 mt-10">No saved messages.</p> : 
                starredMessages.map(msg => (
                  <div key={msg.id} className="bg-white p-5 border border-yellow-200 rounded-xl shadow-sm relative">
                     <button onClick={() => toggleStar(msg.id, msg.is_starred)} className="absolute top-3 right-3 p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition"><StarFilledIcon /></button>
                     <div className="prose prose-sm prose-purple max-w-none pr-6" dangerouslySetInnerHTML={formatMessage(msg.text)} />
                  </div>
                ))
              }
           </div>
        </div>
      )}

      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 min-h-0">
        <div className="flex flex-col gap-5 max-w-4xl mx-auto pb-4">
          {activeChat.map((msg, index) => {
            const files = parseAttachedFiles(msg.attached_files);
            return (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end gap-3`}>
              {msg.role === 'ai' && <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-200 mb-1"><RobotIcon className="w-4 h-4" /></div>}
              {msg.role === 'user' ? (
                <div className="flex flex-col items-end gap-1.5 max-w-[85%] sm:max-w-[75%]">
                  {files.length > 0 && <div className="flex flex-wrap gap-1 justify-end">{files.map((f, i) => <div key={i} className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-1 rounded-md border border-purple-200 shadow-sm">📎 {f}</div>)}</div>}
                  <div className="p-4 rounded-2xl text-[14px] leading-relaxed shadow-sm bg-purple-600 text-white rounded-br-sm font-medium">{msg.text}</div>
                </div>
              ) : (
                <div className="relative p-4 max-w-[85%] sm:max-w-[75%] rounded-2xl text-[14px] leading-relaxed shadow-sm group bg-white border border-gray-200 text-gray-800 rounded-bl-sm pb-8">
                  <div className="prose prose-sm prose-purple max-w-none" dangerouslySetInnerHTML={formatMessage(msg.text)} />
                  {msg.id && !msg.id.toString().startsWith('temp_') && (
                    <button onClick={() => toggleStar(msg.id, msg.is_starred)} className="absolute bottom-2 right-2 p-1.5 bg-gray-50 border border-gray-200 rounded-lg transition text-gray-400 hover:text-yellow-500 opacity-0 group-hover:opacity-100 flex items-center gap-1">
                      {msg.is_starred ? <StarFilledIcon className="w-3.5 h-3.5" /> : <StarIcon className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-bold">{msg.is_starred ? "Saved" : "Save"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
            );
          })}
          {isGenerating && <div className="flex justify-start items-end gap-3"><div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200"><RobotIcon className="w-4 h-4 animate-pulse" /></div><div className="bg-white border border-gray-200 p-4 rounded-2xl flex gap-1.5 items-center h-[45px]"><span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span><span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{animationDelay:'0.4s'}}></span></div></div>}
        </div>
      </div>

      <div className="p-3 sm:p-4 border-t border-gray-200 bg-white z-10">
        {activeChat.length <= 2 && !isGenerating && (
           <div className="flex flex-wrap justify-start gap-2 mb-3 pl-1 sm:pl-2">
              <button onClick={() => setUserQuery('Please summarize the key concepts of the selected documents.')} className="bg-white border border-purple-200 text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"><SummaryIcon /> Summary</button>
              <button onClick={() => setUserQuery('Generate a practice MCQ quiz based on the selected documents.')} className="bg-white border border-teal-200 text-teal-700 hover:bg-teal-50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"><MCQIcon /> MCQ Quiz</button>
              <button onClick={() => setUserQuery('Make a detailed study plan based on the selected documents.')} className="bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5"><PaperSupportIcon /> Study Plan</button>
              <button onClick={() => setUserQuery('Please answer the questions in the selected past papers.')} className="bg-white border border-orange-200 text-orange-700 hover:bg-orange-50 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm transition flex items-center gap-1.5">📎 Answer Papers</button>
           </div>
        )}
        <div className="flex flex-col sm:flex-row items-center gap-2 bg-gray-50 border border-gray-300 rounded-xl p-1.5 sm:pl-2 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
          <div className="w-full sm:w-[180px] flex-shrink-0 relative"><MultiSelectDropdown options={allMaterials} selectedFiles={selectedMaterials} setSelectedFiles={setSelectedMaterials} placeholder="📎 Select PDFs..." colorTheme="purple" /></div>
          <div className="hidden sm:block w-px h-6 bg-gray-300 mx-1"></div>
          <input type="text" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Ask anything..." disabled={isGenerating} className="flex-grow w-full bg-transparent border-none py-2 px-3 focus:outline-none text-gray-800 text-sm font-medium disabled:opacity-50" />
          <button onClick={() => handleSend()} disabled={isGenerating || (!userQuery.trim() && selectedMaterials.length === 0)} className="bg-purple-600 text-white w-10 h-10 rounded-lg hover:bg-purple-700 transition flex items-center justify-center flex-shrink-0 disabled:bg-gray-400 m-0.5">
             <svg className="w-5 h-5 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ transform: 'rotate(90deg)' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AITab;