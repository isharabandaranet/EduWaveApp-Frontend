import React from 'react';
import { EditIcon, TrashIcon, UpIcon, DownIcon, XIcon, DragIcon, CheckIcon } from './Icons';

const SharedMaterialTab = ({ 
  title, emptyIcon, emptyTitle, emptyDesc, btnText, type, data, nameKey, listKey, 
  openModal, editingItem, setEditingItem, saveEditing, cancelEditing, startEditing, 
  handleMove, promptDeleteSection, handleFileUpload, onDragStart, onDragOver, onDrop, 
  handleViewFile, promptDeleteFile 
}) => {
  
  const colors = {
    lecture: { btn: 'bg-blue-100 text-blue-700 hover:bg-blue-200', upload: 'bg-blue-600 hover:bg-blue-700', border: 'border-blue-500 bg-blue-50', text: 'text-blue-600 hover:text-blue-800' },
    personal: { btn: 'bg-green-100 text-green-700 hover:bg-green-200', upload: 'bg-green-600 hover:bg-green-700', border: 'border-green-500 bg-green-50', text: 'text-green-600 hover:text-green-800' },
    paper: { btn: 'bg-orange-100 text-orange-700 hover:bg-orange-200', upload: 'bg-orange-600 hover:bg-orange-700', border: 'border-orange-500 bg-orange-50', text: 'text-orange-600 hover:text-orange-800' }
  };
  const c = colors[type];

  return (
    <div className="max-w-4xl mx-auto animation-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <button onClick={() => openModal(type)} className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-900 transition font-semibold text-sm">
          {type === 'paper' ? '+ Add Year' : '+ Add Topic'}
        </button>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center">
          <div className="text-4xl mb-3 opacity-50">{emptyIcon}</div>
          <h4 className="text-lg font-bold text-gray-600 mb-1">{emptyTitle}</h4>
          <p className="text-sm text-gray-500 mb-4">{emptyDesc}</p>
          <button onClick={() => openModal(type)} className={`px-4 py-2 rounded-lg font-semibold transition ${c.btn}`}>
            {btnText}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((item, idx) => (
            <div key={item.id} draggable onDragStart={(e) => onDragStart(e, idx, type)} onDragOver={onDragOver} onDrop={(e) => onDrop(e, idx, type, item.id)} className="border border-gray-200 rounded-xl bg-gray-50 p-5 shadow-sm hover:shadow-md transition relative border-dashed border-2 border-transparent hover:border-gray-300">
              <div className="flex justify-between items-center border-b border-gray-200 pb-3 mb-4">
                <div className="flex items-center gap-3 w-full max-w-sm">
                  {editingItem.id === item.id && editingItem.type === type ? (
                    <div className="flex items-center gap-2 w-full">
                      <input type="text" value={editingItem.text} onChange={(e) => setEditingItem({...editingItem, text: e.target.value})} onKeyDown={(e) => { if(e.key === 'Enter') saveEditing(); if(e.key === 'Escape') cancelEditing(); }} className={`w-full border-b-2 px-2 py-1 text-gray-800 font-bold outline-none ${c.border}`} autoFocus />
                      <button onClick={saveEditing} className="text-green-600 hover:text-green-800 bg-green-100 p-1 rounded" title="Save"><CheckIcon /></button>
                      <button onClick={cancelEditing} className="text-red-500 hover:text-red-700 bg-red-100 p-1 rounded" title="Cancel"><XIcon /></button>
                    </div>
                  ) : (
                    <>
                      <div title="Drag to move" className="cursor-grab text-gray-400 hover:text-gray-600"><DragIcon /></div>
                      <h4 className="text-lg font-bold text-gray-700 truncate">{type === 'paper' ? `Year: ${item[nameKey]}` : item[nameKey]}</h4>
                      <button onClick={() => startEditing(item.id, type, item[nameKey])} className={`text-gray-400 transition flex-shrink-0 ${c.text}`} title="Edit"><EditIcon /></button>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-px h-5 bg-gray-300 mx-1 hidden sm:block"></div>
                  <button onClick={() => promptDeleteSection(item.id, type, item[nameKey])} className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition" title="Delete"><TrashIcon /></button>
                  <label className={`text-white px-3 py-1.5 rounded cursor-pointer text-xs font-bold ml-3 shadow-sm transition ${c.upload}`}>
                    + Upload <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, type, item.id)} />
                  </label>
                </div>
              </div>
              {item[listKey].length === 0 ? <p className="text-sm text-gray-400 italic text-center py-2">Drag and drop a PDF file here, or click upload.</p> : 
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item[listKey].map((file, i) => (
                    <div key={file.id || i} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-200 shadow-sm text-sm group">
                      <span className="truncate mr-2 font-medium text-gray-700" title={file.name}>📄 {file.name}</span>
                      <div className="flex items-center gap-3">
                        
                        {/* මෙතන තමයි අලුත් ෆන්ක්ෂන් එකට කතා කරන්නේ */}
                        <button onClick={() => handleViewFile(file.name)} className={`font-bold hover:underline ${c.text}`}>View</button>
                        
                        <button onClick={() => promptDeleteFile(item.id, i, type, file.name)} className="text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100" title="Delete File"><XIcon /></button>
                      </div>
                    </div>
                  ))}
                </div>
              }
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SharedMaterialTab;