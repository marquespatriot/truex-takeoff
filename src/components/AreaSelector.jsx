import React from 'react';
import { Plus, Home, Trash2, ShieldCheck, Layers, Layers3 } from 'lucide-react';
import { getSectionTotals, formatSqFt } from '../utils/calculations';

export default function AreaSelector({
  allSections,
  activeSectionId,
  activeCategoryId,
  onSelectArea,
  onOpenCustomModal,
  onDeleteCustomSection,
  project
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-xl">
      
      {/* Floor / Section Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 min-w-max">
          {allSections.map(section => {
            const isSelected = section.id === activeSectionId;
            const secTotals = getSectionTotals(project, section.id, allSections);
            const hasData = secTotals.grossSqFt > 0;

            return (
              <div key={section.id} className="relative group">
                <button
                  onClick={() => onSelectArea(section.id, section.categories[0]?.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl font-black text-sm tracking-wide transition ${
                    isSelected
                      ? 'bg-lime-500 text-black shadow-lg shadow-lime-500/20'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700 hover:text-white'
                  }`}
                >
                  <Home size={16} />
                  <span>{section.name}</span>

                  {hasData && (
                    <span className={`text-xs px-2 py-0.5 rounded-md font-black mono-font ${
                      isSelected ? 'bg-black/20 text-black' : 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                    }`}>
                      {formatSqFt(secTotals.netSqFt)} SQ FT
                    </span>
                  )}
                </button>

                {section.isCustom && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm(`Delete custom section "${section.name}"?`)) {
                        onDeleteCustomSection(section.id);
                      }
                    }}
                    className="absolute -top-1 -right-1 p-1 bg-red-600 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition shadow"
                    title="Delete Custom Section"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom Area Button */}
        <button
          onClick={onOpenCustomModal}
          className="flex items-center gap-1.5 px-4 py-3 rounded-xl bg-zinc-800 hover:bg-lime-500/20 text-lime-400 border border-lime-500/40 font-extrabold text-xs uppercase tracking-wider min-w-max transition active:scale-95"
        >
          <Plus size={16} strokeWidth={3} />
          <span>+ Custom Area</span>
        </button>
      </div>

      {/* Sub-Category Pills for Active Floor */}
      {activeSectionId && (
        <div className="pt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 mr-1">Categories:</span>
          {allSections
            .find(s => s.id === activeSectionId)
            ?.categories.map(cat => {
              const isSelected = cat.id === activeCategoryId;
              const key = `${activeSectionId}:${cat.id}`;
              const catData = project?.measurements[key];
              const itemCount = catData?.items?.length || 0;

              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectArea(activeSectionId, cat.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-lime-400/20 text-lime-300 border-2 border-lime-500 shadow-md'
                      : 'bg-black text-zinc-400 border border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                  }`}
                >
                  <span>{cat.name}</span>
                  {itemCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-lime-500 text-black font-black text-[10px] flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      )}

    </div>
  );
}
