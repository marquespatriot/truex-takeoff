import React, { useState } from 'react';
import { 
  FolderOpen, 
  Search, 
  Plus, 
  Copy, 
  Trash2, 
  ArrowRight, 
  User, 
  MapPin, 
  Calendar, 
  CheckCircle2
} from 'lucide-react';
import { getProjectGrandTotals, formatSqFt } from '../utils/calculations';
import { DEFAULT_SECTIONS } from '../constants/defaultData';

export default function SavedProjects({
  projects,
  activeProjectId,
  onOpenProject,
  onNewProject,
  onDuplicateProject,
  onDeleteProject
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredProjects = projects.filter(p => {
    const info = p.info || {};
    const q = searchQuery.toLowerCase();

    const matchesSearch = 
      (info.customerName || '').toLowerCase().includes(q) ||
      (info.address || '').toLowerCase().includes(q) ||
      (info.customerPhone || '').toLowerCase().includes(q) ||
      (info.customerEmail || '').toLowerCase().includes(q) ||
      (info.salesRep || '').toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || info.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Measuring':
        return 'bg-lime-500/20 text-lime-400 border-lime-500/40';
      case 'Measurement Complete':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'Ready for Estimate':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
      default:
        return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40';
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <FolderOpen className="text-lime-400" />
            SAVED MEASUREMENTS ({projects.length})
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">Manage customer job sites and field takeoffs</p>
        </div>

        <button
          onClick={onNewProject}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-lime-500 hover:bg-lime-400 active:scale-95 text-black font-black text-sm shadow-lg shadow-lime-500/20 transition"
        >
          <Plus size={18} strokeWidth={3} />
          <span>New Measurement Project</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[260px]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by customer name, address, phone, email, or sales rep..."
            className="w-full bg-black border border-zinc-700 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-lime-500 outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['All', 'Measuring', 'Measurement Complete', 'Ready for Estimate', 'Draft'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-2 rounded-xl text-xs font-black transition min-w-max ${
                statusFilter === st
                  ? 'bg-lime-500 text-black shadow'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

      </div>

      {/* Project Cards Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center">
          <FolderOpen size={48} className="text-zinc-600 mx-auto mb-3" />
          <p className="text-zinc-300 font-bold text-lg">No Projects Found</p>
          <p className="text-zinc-500 text-xs mt-1">Try adjusting your search criteria or create a new project.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredProjects.map(project => {
            const info = project.info || {};
            const allSections = [...DEFAULT_SECTIONS, ...(project.customSections || [])];
            const totals = getProjectGrandTotals(project, allSections);
            const isActive = project.id === activeProjectId;

            return (
              <div
                key={project.id}
                className={`bg-zinc-900 border rounded-2xl p-6 space-y-4 shadow-xl flex flex-col justify-between transition ${
                  isActive ? 'border-lime-500/80 bg-zinc-900/90 ring-2 ring-lime-500/20' : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  
                  {/* Top Bar with Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-md font-bold border ${getStatusBadge(info.status)}`}>
                      {info.status || 'Measuring'}
                    </span>

                    {isActive && (
                      <span className="text-[10px] font-black uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/30">
                        ACTIVE PROJECT
                      </span>
                    )}
                  </div>

                  {/* Customer Name & Address */}
                  <h3 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <User size={20} className="text-lime-400" />
                    <span>{info.customerName || 'Untitled Project'}</span>
                  </h3>

                  {info.address && (
                    <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1.5 font-medium">
                      <MapPin size={14} className="text-zinc-500" />
                      <span>{info.address}</span>
                    </p>
                  )}

                  {/* Metadata line */}
                  <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                    <div><strong>Sales Rep:</strong> {info.salesRep || 'N/A'}</div>
                    <div><strong>Date:</strong> {info.date || 'N/A'}</div>
                  </div>

                  {/* SQ FT Output */}
                  <div className="mt-4 bg-black border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-400">TOTAL TAKEOFF</span>
                    <span className="text-lg font-black text-lime-400 mono-font">
                      {formatSqFt(totals.netSqFt)} <span className="text-xs font-bold text-lime-300">SQ FT</span>
                    </span>
                  </div>

                </div>

                {/* Actions */}
                <div className="flex items-center justify-between gap-2 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onDuplicateProject(project)}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                      title="Duplicate Project"
                    >
                      <Copy size={16} />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete project for "${info.customerName}"?`)) {
                          onDeleteProject(project.id);
                        }
                      }}
                      className="p-2.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                      title="Delete Project"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <button
                    onClick={() => onOpenProject(project.id)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black text-xs shadow-lg shadow-lime-500/20 transition active:scale-95"
                  >
                    <span>{isActive ? 'Continue Measurement' : 'Open Measurement'}</span>
                    <ArrowRight size={16} />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
