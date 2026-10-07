import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  UserCheck, 
  FileText, 
  CheckCircle2,
  Navigation,
  Percent,
  Layers,
  Wrench
} from 'lucide-react';

import { 
  PROJECT_CONDITIONS, 
  JOB_TYPES, 
  CEILING_HEIGHT_OPTIONS, 
  WASTE_FACTOR_OPTIONS,
  PROJECT_TEMPLATES 
} from '../constants/defaultData';

export default function ProjectInfoModal({ 
  isOpen, 
  onClose, 
  projectInfo, 
  projectSettings,
  projectTemplate,
  onSave 
}) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    salesRep: '',
    estimator: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Measuring',
    projectCondition: 'New Construction',
    jobTypes: ['Spray Foam'],
    ceilingHeight: '9 ft',
    wasteFactor: '0%',
    template: 'RESIDENTIAL',
    notes: '',
    locationCoords: null
  });

  useEffect(() => {
    if (projectInfo) {
      setFormData({
        customerName: projectInfo.customerName || '',
        customerEmail: projectInfo.customerEmail || '',
        customerPhone: projectInfo.customerPhone || '',
        address: projectInfo.address || '',
        salesRep: projectInfo.salesRep || '',
        estimator: projectInfo.estimator || projectInfo.salesRep || '',
        date: projectInfo.date || new Date().toISOString().split('T')[0],
        status: projectInfo.status || 'Measuring',
        projectCondition: projectInfo.projectCondition || 'New Construction',
        jobTypes: projectInfo.jobTypes || ['Spray Foam'],
        ceilingHeight: projectInfo.ceilingHeight || '9 ft',
        wasteFactor: projectSettings?.wasteFactor || '0%',
        template: projectTemplate || 'RESIDENTIAL',
        notes: projectInfo.notes || '',
        locationCoords: projectInfo.locationCoords || null
      });
    }
  }, [projectInfo, projectSettings, projectTemplate, isOpen]);

  if (!isOpen) return null;

  const handleToggleJobType = (jt) => {
    const current = formData.jobTypes;
    if (current.includes(jt)) {
      setFormData({ ...formData, jobTypes: current.filter(j => j !== jt) });
    } else {
      setFormData({ ...formData, jobTypes: [...current, jt] });
    }
  };

  const handleGetGpsLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setFormData({
            ...formData,
            locationCoords: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`
          });
        },
        (err) => {
          alert('GPS location permission declined or unavailable.');
        }
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="bg-zinc-800/90 px-6 py-4 border-b border-zinc-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Project & Job Setup</h2>
              <p className="text-xs text-zinc-400">Customer details, condition, waste factor & job parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Project Template Switcher */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-lime-400 mb-1.5 flex items-center gap-1">
              <Layers size={14} /> Project Template
            </label>
            <select
              value={formData.template}
              onChange={(e) => setFormData({ ...formData, template: e.target.value })}
              className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-sm font-bold"
            >
              {PROJECT_TEMPLATES.map(t => (
                <option key={t.id} value={t.id}>{t.name} — {t.desc}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Customer Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5 flex items-center gap-1.5">
                <User size={14} /> Customer Name *
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. John Smith"
                className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-base font-semibold placeholder:text-zinc-600 transition"
              />
            </div>

            {/* Sales Rep / Estimator */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck size={14} /> Estimator / Sales Rep
              </label>
              <input
                type="text"
                value={formData.salesRep}
                onChange={(e) => setFormData({ ...formData, salesRep: e.target.value, estimator: e.target.value })}
                placeholder="e.g. Mike Johnson"
                className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-base font-semibold placeholder:text-zinc-600 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Mail size={14} /> Email Address
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                placeholder="customer@example.com"
                className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-base font-semibold placeholder:text-zinc-600 transition"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <Phone size={14} /> Phone Number
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                placeholder="(617) 555-0192"
                className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-base font-semibold placeholder:text-zinc-600 transition"
              />
            </div>

          </div>

          {/* Address & GPS */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                <MapPin size={14} /> Project Address & Location
              </label>

              <button
                type="button"
                onClick={handleGetGpsLocation}
                className="text-xs text-lime-400 hover:underline flex items-center gap-1 font-bold"
              >
                <Navigation size={12} />
                <span>{formData.locationCoords ? `GPS: ${formData.locationCoords}` : 'Verify GPS Coordinates'}</span>
              </button>
            </div>

            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="e.g. 123 Main Street, Quincy, MA 02169"
              className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-base font-semibold placeholder:text-zinc-600 transition"
            />
          </div>

          {/* Project Condition & Job Types */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                Project Condition
              </label>
              <select
                value={formData.projectCondition}
                onChange={(e) => setFormData({ ...formData, projectCondition: e.target.value })}
                className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-sm font-bold"
              >
                {PROJECT_CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                General Ceiling Height
              </label>
              <select
                value={formData.ceilingHeight}
                onChange={(e) => setFormData({ ...formData, ceilingHeight: e.target.value })}
                className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-sm font-bold"
              >
                {CEILING_HEIGHT_OPTIONS.map(ch => <option key={ch} value={ch}>{ch}</option>)}
              </select>
            </div>

          </div>

          {/* Job Types Multiselect Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1">
              <Wrench size={14} /> Job Type (Select Multiple)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {JOB_TYPES.map(jt => {
                const isSelected = formData.jobTypes.includes(jt);
                return (
                  <button
                    key={jt}
                    type="button"
                    onClick={() => handleToggleJobType(jt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      isSelected
                        ? 'bg-lime-500 text-black border-lime-400 shadow'
                        : 'bg-black text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}{jt}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Waste Factor & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-lime-400 mb-1.5 flex items-center gap-1">
                <Percent size={14} /> Optional Waste Factor
              </label>
              <select
                value={formData.wasteFactor}
                onChange={(e) => setFormData({ ...formData, wasteFactor: e.target.value })}
                className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-sm font-bold"
              >
                {WASTE_FACTOR_OPTIONS.map(wf => <option key={wf} value={wf}>{wf}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 size={14} /> Takeoff Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl px-4 py-3 text-white text-sm font-bold"
              >
                <option value="Draft">Draft</option>
                <option value="Measuring">Measuring</option>
                <option value="Measurement Complete">Measurement Complete</option>
                <option value="Ready for Estimate">Ready for Estimate</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} /> General Project Notes
            </label>
            <textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter job site notes, access details, insulation specifications..."
              className="w-full bg-black border border-zinc-700 focus:border-lime-500 rounded-xl p-4 text-white text-sm placeholder:text-zinc-600 transition resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
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
              <Save size={18} />
              <span>Save Project Info</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
