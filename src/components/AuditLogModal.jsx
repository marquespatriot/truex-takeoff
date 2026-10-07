import React from 'react';
import { X, History, User, Clock } from 'lucide-react';

export default function AuditLogModal({ isOpen, onClose, auditLog = [] }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="bg-zinc-800/90 px-6 py-4 border-b border-zinc-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold">
              <History size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Project Audit Log</h2>
              <p className="text-xs text-zinc-400">Activity trail of estimators and field updates</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Audit Log Entries */}
        <div className="p-6 max-h-96 overflow-y-auto divide-y divide-zinc-800/80 space-y-3">
          {auditLog.length === 0 ? (
            <p className="text-center text-zinc-500 text-xs py-6">No activity logged yet.</p>
          ) : (
            auditLog.slice().reverse().map(entry => (
              <div key={entry.id || Math.random()} className="pt-3 first:pt-0 flex items-center justify-between text-xs gap-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-white">
                    <User size={13} className="text-lime-400" />
                    <span>{entry.user || 'Estimator'}</span>
                  </div>
                  <p className="text-zinc-300 mt-0.5">{entry.action}</p>
                </div>
                <div className="text-right text-[11px] text-zinc-500 min-w-max flex items-center gap-1">
                  <Clock size={12} />
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
