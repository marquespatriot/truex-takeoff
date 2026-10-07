import React, { useState } from 'react';
import { 
  Printer, 
  Send, 
  FileSpreadsheet, 
  Building2, 
  User, 
  MapPin, 
  Copy, 
  Check,
  Sparkles,
  Percent,
  Ruler,
  Layers,
  FileCheck,
  Camera
} from 'lucide-react';

import { getCategoryTotals, getProjectGrandTotals, formatSqFt } from '../utils/calculations';

export default function ProjectSummary({ project, allSections, onOpenEditInfo }) {
  const [showCrmModal, setShowCrmModal] = useState(false);
  const [showEstimateModal, setShowEstimateModal] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [displayMode, setDisplayMode] = useState(project?.settings?.displayMode || 'net');
  const [selectedEstimateItems, setSelectedEstimateItems] = useState([]);

  const grandTotals = getProjectGrandTotals(project, allSections);
  const info = project?.info || {};
  const settings = project?.settings || {};

  const handlePrint = () => {
    window.print();
  };

  const activeSectionsBreakdown = allSections.map(section => {
    const categories = section.categories.map(cat => {
      const key = `${section.id}:${cat.id}`;
      const catData = project?.measurements[key];
      const catTotals = getCategoryTotals(catData);
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        grossSqFt: catTotals.grossSqFt,
        subtractionsSqFt: catTotals.subtractionsSqFt,
        netSqFt: catTotals.netSqFt,
        linearFt: catTotals.linearFt,
        itemCount: catTotals.itemCount,
        framing: catData?.framing || 'N/A',
        material: catData?.material || 'N/A',
        thickness: catData?.thickness || 'N/A',
        notes: catData?.notes || '',
        items: catData?.items || []
      };
    }).filter(c => c.itemCount > 0);

    return {
      sectionId: section.id,
      sectionName: section.name,
      categories
    };
  }).filter(s => s.categories.length > 0);

  const crmPayload = {
    system: "TRUEX_FIELD_TAKEOFF",
    version: "2.0.0",
    customer: {
      name: info.customerName,
      email: info.customerEmail,
      phone: info.customerPhone,
      address: info.address,
      gpsCoords: info.locationCoords || null
    },
    projectDetails: {
      salesRep: info.salesRep,
      estimator: info.estimator || info.salesRep,
      date: info.date,
      createdAt: info.createdAt,
      updatedAt: info.updatedAt,
      status: info.status,
      projectCondition: info.projectCondition,
      jobTypes: info.jobTypes,
      ceilingHeight: info.ceilingHeight,
      generalNotes: info.notes
    },
    takeoffSettings: {
      wasteFactor: settings.wasteFactor || '0%',
      displayModeSelected: displayMode
    },
    takeoffTotals: {
      grossSquareFeet: grandTotals.grossSqFt,
      subtractionsSquareFeet: grandTotals.subtractionsSqFt,
      netSquareFeet: grandTotals.netSqFt,
      adjustedSquareFeetWithWaste: grandTotals.adjustedSqFt,
      linearFeet: grandTotals.linearFt,
      adjustedLinearFeetWithWaste: grandTotals.adjustedLinearFt
    },
    sectionsBreakdown: activeSectionsBreakdown,
    auditTrail: project?.auditLog || []
  };

  const handleCopyCrmPayload = () => {
    navigator.clipboard.writeText(JSON.stringify(crmPayload, null, 2));
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleToggleEstimateItem = (key) => {
    if (selectedEstimateItems.includes(key)) {
      setSelectedEstimateItems(selectedEstimateItems.filter(k => k !== key));
    } else {
      setSelectedEstimateItems([...selectedEstimateItems, key]);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Actions */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase flex items-center gap-2">
            <FileSpreadsheet className="text-lime-400" />
            FIELD TAKEOFF REPORT
          </h2>
          <p className="text-xs text-zinc-400 mt-0.5">TRUEX INSULATION • Internal Estimating Summary</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          
          {/* Display Mode Toggle */}
          <div className="flex items-center bg-black border border-zinc-800 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => setDisplayMode('net')}
              className={`px-3 py-1.5 rounded-lg transition ${
                displayMode === 'net' ? 'bg-lime-500 text-black font-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Net Area
            </button>
            <button
              onClick={() => setDisplayMode('gross')}
              className={`px-3 py-1.5 rounded-lg transition ${
                displayMode === 'gross' ? 'bg-lime-500 text-black font-black shadow' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Gross Area
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
          >
            <Printer size={16} />
            <span>Generate Field Report PDF</span>
          </button>

          <button
            onClick={() => setShowEstimateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-lime-400 border border-lime-500/30 font-extrabold text-xs transition"
          >
            <FileCheck size={16} />
            <span>CREATE ESTIMATE</span>
          </button>

          <button
            onClick={() => setShowCrmModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black text-xs shadow-lg shadow-lime-500/20 transition active:scale-95"
          >
            <Send size={16} />
            <span>SEND TO CRM</span>
          </button>

        </div>
      </div>

      {/* Printable Internal Field Report Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 print:bg-white print:text-black print:border-none print:shadow-none">
        
        {/* Header with Logo */}
        <div className="border-b border-zinc-800 pb-6 flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-black p-2 rounded-xl border border-zinc-800">
                <img src="/logo.png" alt="TRUEX INSULATION Logo" className="h-10 object-contain" />
              </div>
            </div>

            <div className="mt-4 space-y-1 text-sm text-zinc-300">
              <div className="flex items-center gap-2 font-semibold">
                <User size={15} className="text-lime-400" />
                <span className="text-white font-black text-base">{info.customerName || 'N/A'}</span>
              </div>
              {info.address && (
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <MapPin size={14} className="text-lime-400" />
                  <span>{info.address}</span>
                </div>
              )}
              {info.customerPhone && (
                <div className="text-xs text-zinc-400">Phone: {info.customerPhone}</div>
              )}
              {info.customerEmail && (
                <div className="text-xs text-zinc-400">Email: {info.customerEmail}</div>
              )}
            </div>
          </div>

          <div className="text-right space-y-1 text-xs text-zinc-400">
            <div><strong>Estimator:</strong> {info.estimator || info.salesRep || 'N/A'}</div>
            <div><strong>Date:</strong> {info.date || new Date().toLocaleDateString()}</div>
            <div><strong>Condition:</strong> <span className="text-white font-bold">{info.projectCondition}</span></div>
            <div><strong>Job Type:</strong> <span className="text-lime-400 font-bold">{(info.jobTypes || []).join(', ')}</span></div>
            <div><strong>Status:</strong> <span className="text-lime-400 font-bold">{info.status}</span></div>
          </div>
        </div>

        {/* Global Total Highlight Banner */}
        <div className="bg-black border-2 border-lime-500/50 rounded-2xl p-6 text-center space-y-2 shadow-inner">
          <div className="text-xs font-black uppercase tracking-widest text-lime-400">
            TOTAL TAKEOFF {displayMode.toUpperCase()} AREA
          </div>
          
          <div className="text-4xl md:text-5xl font-black text-lime-400 mono-font tracking-tight">
            {formatSqFt(displayMode === 'gross' ? grandTotals.grossSqFt : grandTotals.netSqFt)}{' '}
            <span className="text-xl md:text-2xl font-black text-lime-300">SQ FT</span>
          </div>

          {grandTotals.wastePercent > 0 && (
            <div className="text-sm font-bold text-lime-300">
              Adjusted Area ({grandTotals.wastePercent}% Waste): <strong className="text-white mono-font">{formatSqFt(grandTotals.adjustedSqFt)} SQ FT</strong>
            </div>
          )}

          {grandTotals.linearFt > 0 && (
            <div className="text-sm font-bold text-amber-300 pt-1">
              Linear Feet Items Total: <strong className="text-white mono-font">{formatSqFt(grandTotals.linearFt)} LIN FT</strong>
            </div>
          )}
        </div>

        {/* Active Sections Breakdown */}
        <div className="space-y-6">
          <h3 className="text-base font-bold text-white uppercase tracking-wider border-b border-zinc-800 pb-2">
            Measured Area Breakdown
          </h3>

          {activeSectionsBreakdown.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No measurements recorded in any area yet.
            </div>
          ) : (
            activeSectionsBreakdown.map(sec => (
              <div key={sec.sectionName} className="bg-black/60 border border-zinc-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <h4 className="text-sm font-extrabold text-lime-400 uppercase tracking-wider flex items-center gap-2">
                    <Building2 size={16} />
                    {sec.sectionName}
                  </h4>
                </div>

                <div className="space-y-3">
                  {sec.categories.map(cat => (
                    <div key={cat.categoryName} className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-xs space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
                        <span className="font-extrabold text-white text-base">{cat.categoryName}</span>

                        <div className="text-right mono-font">
                          <div className="text-base font-black text-lime-400">
                            {formatSqFt(displayMode === 'gross' ? cat.grossSqFt : cat.netSqFt)} SQ FT
                            {cat.linearFt > 0 && <span className="text-amber-400 ml-2">| {formatSqFt(cat.linearFt)} LIN FT</span>}
                          </div>
                        </div>
                      </div>

                      {/* Specs badges */}
                      <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-zinc-400">
                        {cat.framing !== 'N/A' && <span className="bg-black px-2 py-0.5 rounded border border-zinc-800">Framing: {cat.framing}</span>}
                        {cat.material !== 'N/A' && <span className="bg-black px-2 py-0.5 rounded border border-zinc-800 text-lime-300">Material: {cat.material}</span>}
                        {cat.thickness !== 'N/A' && <span className="bg-black px-2 py-0.5 rounded border border-zinc-800">Thickness: {cat.thickness}</span>}
                      </div>

                      {cat.notes && (
                        <p className="text-[11px] text-zinc-300 italic">
                          Note: {cat.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* General Notes */}
        {info.notes && (
          <div className="border-t border-zinc-800 pt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-1">
              General Project Notes:
            </h4>
            <p className="text-xs text-zinc-300 whitespace-pre-wrap bg-black p-4 rounded-xl border border-zinc-800">
              {info.notes}
            </p>
          </div>
        )}

      </div>

      {/* CREATE ESTIMATE MODAL */}
      {showEstimateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            
            <div className="bg-zinc-800/90 px-6 py-4 border-b border-zinc-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold">
                  <FileCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Create Estimate from Takeoff</h3>
                  <p className="text-xs text-zinc-400">Select measured areas to transfer to TRUEX Estimate System</p>
                </div>
              </div>
              <button onClick={() => setShowEstimateModal(false)} className="text-zinc-400 hover:text-white text-sm font-bold">Close</button>
            </div>

            <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
              {activeSectionsBreakdown.map(sec => (
                <div key={sec.sectionId} className="space-y-2">
                  <span className="text-xs font-bold text-lime-400 uppercase">{sec.sectionName}</span>
                  {sec.categories.map(cat => {
                    const itemKey = `${sec.sectionId}:${cat.categoryId}`;
                    const isSelected = selectedEstimateItems.includes(itemKey);
                    return (
                      <label key={cat.categoryId} className="flex items-center justify-between p-3 bg-black border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleEstimateItem(itemKey)}
                            className="w-4 h-4 accent-lime-500"
                          />
                          <span className="text-xs font-bold text-white">{cat.categoryName}</span>
                        </div>
                        <span className="text-xs font-extrabold text-lime-400 mono-font">
                          {formatSqFt(cat.netSqFt)} SQ FT
                        </span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-4 bg-black border-t border-zinc-800 flex justify-end gap-3">
              <button onClick={() => setShowEstimateModal(false)} className="px-4 py-2 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-xl">Cancel</button>
              <button 
                onClick={() => {
                  alert(`Created estimate items for ${selectedEstimateItems.length} selected areas.`);
                  setShowEstimateModal(false);
                }}
                className="px-5 py-2 bg-lime-500 text-black text-xs font-black rounded-xl shadow"
              >
                Transfer Selected to Estimate
              </button>
            </div>

          </div>
        </div>
      )}

      {/* CRM Modal */}
      {showCrmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            
            <div className="bg-zinc-800/90 px-6 py-4 border-b border-zinc-700/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold">
                  <Send size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">TRUEX CRM Pro Integration Payload</h3>
                  <p className="text-xs text-zinc-400">Ready to transmit complete takeoff data directly to CRM</p>
                </div>
              </div>
              <button onClick={() => setShowCrmModal(false)} className="text-zinc-400 hover:text-white text-sm font-bold">Close</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-black border border-zinc-800 rounded-xl p-4 max-h-72 overflow-y-auto">
                <pre className="text-xs font-mono text-lime-400 whitespace-pre-wrap">
                  {JSON.stringify(crmPayload, null, 2)}
                </pre>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-zinc-400 flex items-center gap-1">
                  <Sparkles size={14} className="text-lime-400" /> Formatted JSON Payload Ready for CRM API
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopyCrmPayload}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
                  >
                    {copiedPayload ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                    <span>{copiedPayload ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
                  </button>

                  <button
                    onClick={() => {
                      alert('Takeoff data successfully dispatched to TRUEX CRM Pro (Demo)');
                      setShowCrmModal(false);
                    }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-bold text-xs shadow-lg shadow-lime-500/20 transition"
                  >
                    <Send size={16} />
                    <span>Dispatch to CRM</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
