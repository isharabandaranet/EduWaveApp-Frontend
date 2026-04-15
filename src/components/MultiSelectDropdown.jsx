import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from './Icons';

const MultiSelectDropdown = ({ options, selectedFiles, setSelectedFiles, placeholder, colorTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectAll = () => {
    if (selectedFiles.length === options.length) setSelectedFiles([]); 
    else setSelectedFiles([...options]); // මුළු object එකම සේව් කරනවා AI එකට ලේසි වෙන්න
  };

  const handleSelectOne = (opt) => {
    const isSelected = selectedFiles.some(item => item.id === opt.id);
    if (isSelected) {
      setSelectedFiles(selectedFiles.filter(item => item.id !== opt.id));
    } else {
      setSelectedFiles([...selectedFiles, opt]); // මුළු object එකම සේව් කරනවා
    }
  };

  return (
    <div className="relative flex-grow" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-50 border border-gray-300 text-gray-700 rounded-xl px-3 sm:px-4 py-2 sm:py-3 focus:outline-none focus:ring-2 focus:border-transparent flex justify-between items-center font-medium shadow-sm transition-all h-[40px] sm:h-[50px]"
        style={{ '--tw-ring-color': `var(--tw-colors-${colorTheme}-400)` }}
      >
        <span className="truncate pr-4 text-xs sm:text-sm">
          {selectedFiles.length === 0 ? placeholder : `${selectedFiles.length} file(s) selected`}
        </span>
        <ChevronDown />
      </button>

      {/* මෙන්න මේ පේළිය තමයි උඩට අරින්න වෙනස් කරේ (bottom-full mb-2) */}
      {isOpen && (
        <div className="absolute z-20 w-full bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {options.length === 0 ? (
            <div className="p-4 text-gray-500 text-sm text-center">No files uploaded yet. Please upload files in the other tabs first.</div>
          ) : (
            <div className="p-2 space-y-1">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer border-b border-gray-100 mb-1">
                <input type="checkbox" checked={selectedFiles.length === options.length && options.length > 0} onChange={handleSelectAll} className={`w-4 h-4 rounded border-gray-300 accent-${colorTheme}-600 cursor-pointer`} />
                <span className="font-bold text-gray-800 text-sm">Select All</span>
              </label>
              {options.map((opt) => (
                <label key={opt.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                  <input type="checkbox" checked={selectedFiles.some(item => item.id === opt.id)} onChange={() => handleSelectOne(opt)} className={`w-4 h-4 rounded border-gray-300 accent-${colorTheme}-600 cursor-pointer`} />
                  <div className="flex flex-col truncate">
                    <span className="text-gray-700 text-sm font-medium truncate">{opt.name}</span>
                    <span className="text-gray-400 text-[10px] sm:text-xs truncate">In: {opt.sectionName}</span>
                  </div>
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;