import React, { useState } from 'react';
import { Building2, Home, Plus, Copy, Trash2, ChevronRight, Layers } from 'lucide-react';

export default function HierarchyManager({
  project,
  activeBuildingId,
  activeUnitId,
  onSelectBuilding,
  onSelectUnit,
  onAddBuilding,
  onAddUnit,
  onDuplicateUnit,
  onDeleteUnit
}) {
  const [newBuildingInput, setNewBuildingInput] = useState('');
  const [newUnitInput, setNewUnitInput] = useState('');
  const [showAddBuilding, setShowAddBuilding] = useState(false);
  const [showAddUnit, setShowAddUnit] = useState(false);

  const buildings = project?.buildings || [];
  const units = project?.units || [];

  const handleCreateBuilding = (e) => {
    e.preventDefault();
    if (!newBuildingInput.trim()) return;
    onAddBuilding(newBuildingInput.trim());
    setNewBuildingInput('');
    setShowAddBuilding(false);
  };

  const handleCreateUnit = (e) => {
    e.preventDefault();
    if (!newUnitInput.trim()) return;
    onAddUnit(newUnitInput.trim());
    setNewUnitInput('');
    setShowAddUnit(false);
  };

  if (buildings.length === 0 && units.length === 0 && project?.info?.projectCondition !== 'Multifamily' && project?.info?.projectCondition !== 'Commercial') {
    return null; // Keep screen clean for single-family residential unless user activates buildings/units
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-3">
      
      {/* Buildings Row (Optional) */}
      {(buildings.length > 0 || project?.info?.projectCondition === 'Commercial') && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-black uppercase text-lime-400 flex items-center gap-1">
              <Building2 size={14} /> Buildings:
            </span>
            
            <button
              onClick={() => onSelectBuilding(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                !activeBuildingId ? 'bg-lime-500 text-black font-black' : 'bg-black text-zinc-400 border border-zinc-800'
              }`}
            >
              Main Structure
            </button>

            {buildings.map(b => (
              <button
                key={b.id}
                onClick={() => onSelectBuilding(b.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeBuildingId === b.id ? 'bg-lime-500 text-black font-black' : 'bg-black text-zinc-400 border border-zinc-800'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowAddBuilding(!showAddBuilding)}
            className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-lime-400 text-xs font-bold flex items-center gap-1"
          >
            <Plus size={14} /> Add Building
          </button>
        </div>
      )}

      {/* Add Building Input Drawer */}
      {showAddBuilding && (
        <form onSubmit={handleCreateBuilding} className="flex gap-2 animate-fadeIn">
          <input
            type="text"
            value={newBuildingInput}
            onChange={(e) => setNewBuildingInput(e.target.value)}
            placeholder="e.g. Building A, Building B, West Wing..."
            className="flex-1 bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-lime-500 text-black font-bold text-xs">
            Save Building
          </button>
        </form>
      )}

      {/* Units Row for Multifamily */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-black uppercase text-lime-400 flex items-center gap-1">
            <Home size={14} /> Dwelling Units:
          </span>

          <button
            onClick={() => onSelectUnit(null)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              !activeUnitId ? 'bg-lime-500 text-black font-black' : 'bg-black text-zinc-400 border border-zinc-800'
            }`}
          >
            All Units / Default
          </button>

          {units.map(u => (
            <div key={u.id} className="relative group flex items-center">
              <button
                onClick={() => onSelectUnit(u.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  activeUnitId === u.id ? 'bg-lime-500 text-black font-black' : 'bg-black text-zinc-400 border border-zinc-800'
                }`}
              >
                {u.name}
              </button>

              <button
                onClick={() => onDuplicateUnit(u)}
                className="p-1 text-zinc-400 hover:text-lime-400 ml-1 hidden group-hover:block"
                title="Duplicate Unit"
              >
                <Copy size={12} />
              </button>
            </div>
          ))}
        </div>

        <button
          onClick={() => setShowAddUnit(!showAddUnit)}
          className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-lime-400 text-xs font-bold flex items-center gap-1"
        >
          <Plus size={14} /> + ADD UNIT
        </button>
      </div>

      {/* Add Unit Drawer */}
      {showAddUnit && (
        <form onSubmit={handleCreateUnit} className="flex gap-2 animate-fadeIn pt-1">
          <input
            type="text"
            value={newUnitInput}
            onChange={(e) => setNewUnitInput(e.target.value)}
            placeholder="e.g. Unit 101, Unit 102, Unit A, Unit B..."
            className="flex-1 bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-lime-500 text-black font-bold text-xs">
            Save Unit
          </button>
        </form>
      )}

    </div>
  );
}
