import React, { useState } from 'react';
import { X, Plus, Layers } from 'lucide-react';

export default function CustomAreaModal({ isOpen, onClose, onAddCustomArea }) {
  const [areaName, setAreaName] = useState('');
  const [selectedPresets, setSelectedPresets] = useState([
    'Exterior Walls',
    'Interior Walls',
    'Ceiling',
    'Floor'
  ]);
  const [customCatInput, setCustomCatInput] = useState('');

  if (!isOpen) return null;

  const PRESET_CATEGORIES = [
    'Exterior Walls',
    'Interior Walls',
    'Ceiling',
    'Floor',
    'Framed Walls',
    'Concrete Walls',
    'Under Side of Roof',
    'Knee Walls',
    'Rim Joist'
  ];

  const PRESET_AREA_NAMES = [
    'Third Floor',
    'Addition',
    'Mechanical Room',
    'Bonus Room',
    'Porch',
    'Custom Commercial Area'
  ];

  const handleToggleCategory = (catName) => {
    if (selectedPresets.includes(catName)) {
      setSelectedPresets(selectedPresets.filter(c => c !== catName));
    } else {
      setSelectedPresets([...selectedPresets, catName]);
    }
  };

  const handleAddCustomCat = () => {
    if (customCatInput.trim() && !selectedPresets.includes(customCatInput.trim())) {
      setSelectedPresets([...selectedPresets, customCatInput.trim()]);
      setCustomCatInput('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!areaName.trim()) return;

    const newSection = {
      id: `custom_${Date.now()}`,
      name: areaName.trim().toUpperCase(),
      isCustom: true,
      categories: selectedPresets.map((name, idx) => ({
        id: `cat_${idx}_${Date.now()}`,
        name: name
      }))
    };

    onAddCustomArea(newSection);
    setAreaName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-zinc-800/90 px-6 py-4 border-b border-zinc-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold">
              <Layers size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">+ Create Custom Area</h2>
              <p className="text-xs text-zinc-400">Add any additional section to this takeoff</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Quick Suggestions */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Quick Suggestions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_AREA_NAMES.map(name => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setAreaName(name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                    areaName === name
                      ? 'bg-lime-500 text-black border-lime-400 shadow'
                      : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Area Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5">
              Custom Area Name *
            </label>
            <input
              type="text"
              required
              value={areaName}
              onChange={(e) => setAreaName(e.target.value)}
              placeholder="e.g. Third Floor, Mechanical Room, Bonus Room..."
              className="w-full bg-black border border-zinc-700 focus:border-lime-500 focus:ring-2 focus:ring-lime-500/20 rounded-xl px-4 py-3 text-white text-base font-semibold placeholder:text-zinc-600 transition uppercase"
            />
          </div>

          {/* Sub-Categories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-2">
              Measurement Categories to Include
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESET_CATEGORIES.map(cat => {
                const isSelected = selectedPresets.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleToggleCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-zinc-800 text-lime-400 border-lime-500/50'
                        : 'bg-black text-zinc-500 border-zinc-800 hover:text-zinc-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{cat}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customCatInput}
                onChange={(e) => setCustomCatInput(e.target.value)}
                placeholder="Add custom category..."
                className="flex-1 bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
              />
              <button
                type="button"
                onClick={handleAddCustomCat}
                className="px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold"
              >
                Add Category
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-lime-500 hover:bg-lime-400 active:scale-95 text-black font-black text-sm shadow-lg shadow-lime-500/20 flex items-center gap-2 transition"
            >
              <Plus size={18} strokeWidth={3} />
              <span>Create Area</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
