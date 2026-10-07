import React from 'react';
import { 
  Building2, 
  Ruler, 
  FileText, 
  FolderOpen, 
  Plus, 
  CheckCircle2, 
  FileSpreadsheet,
  Search,
  History,
  Moon,
  Sun,
  LogOut,
  ShieldCheck,
  User,
  RefreshCw,
  CloudCheck,
  CloudOff,
  CloudUpload
} from 'lucide-react';
import { formatSqFt } from '../utils/calculations';
import { useAuth } from '../context/AuthContext';

export default function Header({ 
  activeProject, 
  grandTotals, 
  activeTab, 
  setActiveTab, 
  onNewProject, 
  onEditProjectInfo,
  onOpenAuditLog,
  searchQuery,
  setSearchQuery,
  themeMode = 'dark',
  onToggleTheme,
  connectionStatus = 'saved', // 'saved', 'saving', 'syncing', 'offline'
  isOnline = true
}) {
  const { user, logout } = useAuth();
  const info = activeProject?.info || {};

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

  const renderConnectionStatus = () => {
    if (!isOnline || connectionStatus === 'offline') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-bold text-zinc-400 bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded-xl">
          <CloudOff size={14} className="text-zinc-500" />
          <span>Offline</span>
        </span>
      );
    }

    if (connectionStatus === 'saving') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl animate-pulse">
          <CloudUpload size={14} />
          <span>Saving...</span>
        </span>
      );
    }

    if (connectionStatus === 'syncing') {
      return (
        <span className="flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-1 rounded-xl">
          <RefreshCw size={14} className="animate-spin" />
          <span>Syncing...</span>
        </span>
      );
    }

    return (
      <span className="flex items-center gap-1.5 text-xs font-extrabold text-lime-400 bg-lime-500/10 border border-lime-500/30 px-2.5 py-1 rounded-xl">
        <CheckCircle2 size={14} />
        <span>✓ Saved</span>
      </span>
    );
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/95 backdrop-blur border-b border-zinc-800 shadow-2xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Project Info */}
        <div className="flex items-center gap-3">
          <div className="h-11 flex items-center bg-black px-3 py-1 rounded-xl border border-zinc-800 shadow-md">
            <img 
              src="/logo.png" 
              alt="TRUEX INSULATION Logo" 
              className="h-8 object-contain" 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black tracking-tight text-white uppercase flex items-center gap-1.5">
                <span>FIELD TAKEOFF SYSTEM</span>
              </h1>
              
              {/* Connection Status Pill */}
              {renderConnectionStatus()}
            </div>

            <div className="flex items-center gap-2 text-xs text-zinc-300 font-medium truncate max-w-xs sm:max-w-md">
              <span className="text-lime-400 font-bold">{info.customerName || 'No Active Project'}</span>
              {info.address && <span className="text-zinc-600">•</span>}
              <span className="text-zinc-400 truncate">{info.address}</span>
            </div>
          </div>
        </div>

        {/* Account Info, Search Bar & Actions */}
        <div className="flex items-center gap-2">
          
          {/* User Badge */}
          {user && (
            <div className="hidden xl:flex items-center gap-2 bg-black px-3 py-1.5 rounded-xl border border-zinc-800 text-xs">
              <User size={14} className="text-lime-400" />
              <span className="font-bold text-white max-w-[120px] truncate">{user.name || user.email}</span>
              <span className="text-[10px] font-black uppercase text-lime-400 bg-lime-500/20 px-1.5 py-0.5 rounded border border-lime-500/30">
                {user.role || 'ADMIN'}
              </span>
            </div>
          )}

          {/* Quick Search */}
          <div className="relative hidden lg:block w-36">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full bg-black border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-zinc-600 focus:border-lime-500 outline-none"
            />
          </div>

          {/* Audit Log Launcher */}
          <button
            onClick={onOpenAuditLog}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
            title="View Project Audit Log"
          >
            <History size={16} />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-800 transition"
            title="Toggle Light / Dark Visibility Mode"
          >
            {themeMode === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} />}
          </button>

          {/* Live Total Badge */}
          <div 
            onClick={() => setActiveTab('summary')}
            className="cursor-pointer bg-zinc-900 hover:bg-zinc-850 border border-lime-500/30 hover:border-lime-500/60 rounded-xl px-3 py-1.5 flex items-center gap-3 transition shadow-inner group"
            title="Click to view full project takeoff summary"
          >
            <div className="text-right">
              <div className="text-[9px] uppercase font-extrabold tracking-wider text-zinc-400 group-hover:text-lime-400 transition">
                NET TAKEOFF
              </div>
              <div className="text-lg font-black text-lime-400 mono-font leading-none tracking-tight">
                {formatSqFt(grandTotals.netSqFt)} <span className="text-[10px] font-bold text-lime-300">SQ FT</span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-lg bg-lime-500/10 flex items-center justify-center text-lime-400 group-hover:bg-lime-500 group-hover:text-black transition">
              <FileSpreadsheet size={18} />
            </div>
          </div>

          {/* LOG OUT BUTTON */}
          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-xs font-black transition active:scale-95"
            title="Destroy session and log out"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">LOG OUT</span>
          </button>

        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-black/90 px-4 border-t border-zinc-800/80">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar py-1 gap-2">
          <div className="flex items-center gap-1.5 min-w-max">
            
            <button
              onClick={() => setActiveTab('calculator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'calculator'
                  ? 'bg-lime-500 text-black shadow-md shadow-lime-500/20 font-black'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Ruler size={16} />
              <span>Measurements</span>
            </button>

            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'summary'
                  ? 'bg-lime-500 text-black shadow-md shadow-lime-500/20 font-black'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <FileText size={16} />
              <span>Project Summary</span>
            </button>

            <button
              onClick={() => setActiveTab('info')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'info'
                  ? 'bg-lime-500 text-black shadow-md shadow-lime-500/20 font-black'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <Building2 size={16} />
              <span>Project Info</span>
            </button>

            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition ${
                activeTab === 'projects'
                  ? 'bg-lime-500 text-black shadow-md shadow-lime-500/20 font-black'
                  : 'text-zinc-300 hover:text-white hover:bg-zinc-800/60'
              }`}
            >
              <FolderOpen size={16} />
              <span>Saved Projects</span>
            </button>

          </div>

          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={onEditProjectInfo}
              className="px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 border border-zinc-700 transition"
            >
              Edit Info
            </button>

            <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold border ${getStatusBadge(info.status)}`}>
              {info.status || 'Measuring'}
            </span>
          </div>

        </div>
      </div>
    </header>
  );
}
