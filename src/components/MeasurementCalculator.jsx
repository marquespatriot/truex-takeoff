import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, 
  Minus, 
  Lock, 
  Unlock, 
  Copy, 
  Trash2, 
  Edit2, 
  Calculator, 
  Check, 
  FileText,
  ChevronDown,
  ChevronUp,
  Triangle,
  Square,
  RotateCcw,
  Mic,
  MicOff,
  Camera,
  Layers,
  Sparkles,
  Tag,
  Star
} from 'lucide-react';

import { 
  formatSqFt, 
  getCategoryTotals, 
  calculateItemSqFt,
  parseWastePercent
} from '../utils/calculations';

import { 
  FRAMING_OPTIONS, 
  MATERIAL_OPTIONS, 
  THICKNESS_OPTIONS, 
  PRESET_NOTES,
  OPENING_PRESETS,
  ROOM_PRESETS
} from '../constants/defaultData';

export default function MeasurementCalculator({
  activeSection,
  activeCategory,
  categoryData = { items: [], notes: '', framing: '', material: '', thickness: '', photos: [] },
  onAddMeasurement,
  onUpdateMeasurement,
  onDeleteMeasurement,
  onDuplicateMeasurement,
  onUndoLastMeasurement,
  onUpdateAreaMeta,
  onUpdateNotes,
  onOpenAreaPhotos,
  wasteFactor = '0%',
  isFavorite = false,
  onToggleFavorite
}) {
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [qty, setQty] = useState(1);
  const [label, setLabel] = useState('');
  const [room, setRoom] = useState('');
  const [comment, setComment] = useState('');
  const [shape, setShape] = useState('RECTANGLE'); // 'RECTANGLE' or 'TRIANGLE'
  const [unit, setUnit] = useState('SQ_FT'); // 'SQ_FT' or 'LINEAR_FT'

  const [isHeightLocked, setIsHeightLocked] = useState(false);
  const [isLengthLocked, setIsLengthLocked] = useState(false);
  const [isSubtractionMode, setIsSubtractionMode] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Area Specifications
  const [framing, setFraming] = useState(categoryData.framing || '');
  const [material, setMaterial] = useState(categoryData.material || '');
  const [thickness, setThickness] = useState(categoryData.thickness || '');

  // Voice Notes
  const [isListening, setIsListening] = useState(false);
  const [showNotesDrawer, setShowNotesDrawer] = useState(false);
  const [showNumpad, setShowNumpad] = useState(false);
  const [activeNumpadTarget, setActiveNumpadTarget] = useState('length');

  const lengthInputRef = useRef(null);
  const heightInputRef = useRef(null);

  useEffect(() => {
    setFraming(categoryData.framing || '');
    setMaterial(categoryData.material || '');
    setThickness(categoryData.thickness || '');
  }, [categoryData.framing, categoryData.material, categoryData.thickness, activeCategory?.id]);

  useEffect(() => {
    if (lengthInputRef.current && !editingId) {
      lengthInputRef.current.focus();
    }
  }, [activeSection?.id, activeCategory?.id]);

  const totals = getCategoryTotals(categoryData);
  const wastePercent = parseWastePercent(wasteFactor);
  const adjustedNetSqFt = totals.netSqFt * (1 + wastePercent / 100);

  const currentPreviewSqFt = calculateItemSqFt(
    length, 
    height, 
    qty, 
    shape, 
    isSubtractionMode ? 'subtraction' : 'addition',
    unit
  );

  const handleAddOrUpdate = (e) => {
    if (e) e.preventDefault();

    const l = parseFloat(length);
    const h = parseFloat(height);

    if (isNaN(l) || (unit === 'SQ_FT' && (isNaN(h) || h <= 0)) || l <= 0) {
      return;
    }

    const newItem = {
      id: editingId || `m_${Date.now()}`,
      length: l,
      height: unit === 'LINEAR_FT' ? 1 : h,
      qty: parseInt(qty, 10) || 1,
      shape: unit === 'LINEAR_FT' ? 'RECTANGLE' : shape,
      unit: unit,
      type: isSubtractionMode ? 'subtraction' : 'addition',
      label: label.trim() || (isSubtractionMode ? 'Opening Subtraction' : `${shape === 'TRIANGLE' ? 'Triangle' : 'Wall'} Section`),
      room: room.trim(),
      comment: comment.trim(),
      sqft: currentPreviewSqFt
    };

    if (editingId) {
      onUpdateMeasurement(newItem);
      setEditingId(null);
    } else {
      onAddMeasurement(newItem);
    }

    // Workflow Reset
    if (!isLengthLocked) setLength('');
    if (!isHeightLocked) setHeight('');
    setLabel('');
    setComment('');
    setQty(1);
    setIsSubtractionMode(false);

    // Auto Focus
    setTimeout(() => {
      if (lengthInputRef.current && !isLengthLocked) {
        lengthInputRef.current.focus();
      } else if (heightInputRef.current && !isHeightLocked) {
        heightInputRef.current.focus();
      }
    }, 50);
  };

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setLength(item.length.toString());
    setHeight((item.height || 1).toString());
    setQty(item.qty || 1);
    setShape(item.shape || 'RECTANGLE');
    setUnit(item.unit || 'SQ_FT');
    setLabel(item.label || '');
    setRoom(item.room || '');
    setComment(item.comment || '');
    setIsSubtractionMode(item.type === 'subtraction');
    if (lengthInputRef.current) {
      lengthInputRef.current.focus();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    if (!isLengthLocked) setLength('');
    if (!isHeightLocked) setHeight('');
    setLabel('');
    setComment('');
    setQty(1);
    setIsSubtractionMode(false);
  };

  const handleSelectOpeningPreset = (preset) => {
    if (preset.sqft === 0) {
      setIsSubtractionMode(true);
      return;
    }
    setLength(preset.length.toString());
    setHeight(preset.height.toString());
    setLabel(preset.label);
    setIsSubtractionMode(true);
  };

  const handleAreaMetaChange = (field, value) => {
    if (field === 'framing') setFraming(value);
    if (field === 'material') setMaterial(value);
    if (field === 'thickness') setThickness(value);

    onUpdateAreaMeta({
      framing: field === 'framing' ? value : framing,
      material: field === 'material' ? value : material,
      thickness: field === 'thickness' ? value : thickness
    });
  };

  // Voice Notes Handler via Web Speech API
  const handleToggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can still type notes directly.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const existing = categoryData.notes || '';
        const updated = existing ? `${existing} | ${transcript}` : transcript;
        onUpdateNotes(updated);
      };

      recognition.start();
    } catch (err) {
      console.error('Voice input error:', err);
      setIsListening(false);
    }
  };

  const handleNumpadTap = (val) => {
    const targetSetter = activeNumpadTarget === 'length' ? setLength : setHeight;
    const currentVal = activeNumpadTarget === 'length' ? length : height;

    if (val === 'CLEAR') {
      targetSetter('');
    } else if (val === 'BACK') {
      targetSetter(currentVal.slice(0, -1));
    } else if (val === '.') {
      if (!currentVal.includes('.')) targetSetter(currentVal + '.');
    } else {
      targetSetter(currentVal + val);
    }
  };

  const handleAddPresetNote = (presetText) => {
    const existing = categoryData.notes || '';
    if (existing.includes(presetText)) return;
    const updated = existing ? `${existing} | ${presetText}` : presetText;
    onUpdateNotes(updated);
  };

  return (
    <div className="space-y-6">
      
      {/* Category Live Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-lime-400">
            <span>{activeSection?.name}</span>
            <span className="text-zinc-600">•</span>
            <span>{activeCategory?.name}</span>
            
            <button
              onClick={onToggleFavorite}
              className={`p-1 rounded-md transition ${isFavorite ? 'text-lime-400 bg-lime-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Favorite Area"
            >
              <Star size={14} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mt-0.5 flex items-center gap-3">
            <span>{activeCategory?.name} Takeoff</span>
          </h2>
        </div>

        {/* Live Area Subtotal & Photos */}
        <div className="flex items-center gap-3">
          
          <button
            onClick={onOpenAreaPhotos}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-black border border-zinc-800 hover:border-lime-500/40 text-zinc-300 hover:text-white text-xs font-bold transition"
          >
            <Camera size={16} className="text-lime-400" />
            <span>Photos ({categoryData.photos?.length || 0})</span>
          </button>

          <div className="bg-black border border-zinc-800 rounded-xl px-4 py-2 text-right">
            <div className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">GROSS AREA</div>
            <div className="text-lg font-black text-zinc-200 mono-font">
              {formatSqFt(totals.grossSqFt)} <span className="text-xs text-zinc-400">SQ FT</span>
            </div>
          </div>

          {totals.subtractionsSqFt > 0 && (
            <div className="bg-black border border-red-500/30 rounded-xl px-4 py-2 text-right">
              <div className="text-[10px] font-extrabold text-red-400 uppercase tracking-wider">OPENINGS</div>
              <div className="text-lg font-black text-red-400 mono-font">
                -{formatSqFt(totals.subtractionsSqFt)} <span className="text-xs text-red-400/80">SQ FT</span>
              </div>
            </div>
          )}

          <div className="bg-zinc-900 border-2 border-lime-500/60 rounded-xl px-5 py-2.5 text-right shadow-lg shadow-lime-500/10">
            <div className="text-[10px] font-black text-lime-400 uppercase tracking-wider">
              NET AREA {wastePercent > 0 ? `(+${wastePercent}% WASTE)` : ''}
            </div>
            <div className="text-2xl font-black text-lime-400 mono-font">
              {formatSqFt(adjustedNetSqFt)} <span className="text-xs font-black text-lime-300">SQ FT</span>
            </div>
          </div>

        </div>
      </div>

      {/* Area Specifications Row (Framing, Material, Thickness) */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Framing Size (Optional)</label>
          <select
            value={framing}
            onChange={(e) => handleAreaMetaChange('framing', e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-lime-500 outline-none"
          >
            <option value="">Select Framing...</option>
            {FRAMING_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Material Type (Optional)</label>
          <select
            value={material}
            onChange={(e) => handleAreaMetaChange('material', e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-lime-500 outline-none"
          >
            <option value="">Select Material...</option>
            {MATERIAL_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase text-zinc-400 mb-1">Thickness (Optional)</label>
          <select
            value={thickness}
            onChange={(e) => handleAreaMetaChange('thickness', e.target.value)}
            className="w-full bg-black border border-zinc-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:border-lime-500 outline-none"
          >
            <option value="">Select Thickness...</option>
            {THICKNESS_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Main Touch Calculator Card */}
      <div className={`bg-zinc-900 border rounded-2xl p-5 md:p-6 shadow-2xl transition ${
        isSubtractionMode 
          ? 'border-red-500/50 bg-red-950/10' 
          : editingId 
            ? 'border-blue-500/50 bg-blue-950/10' 
            : 'border-lime-500/40'
      }`}>
        
        {/* Calculator Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-4 border-b border-zinc-800">
          
          {/* Shape & Unit Selector */}
          <div className="flex items-center gap-2">
            
            {/* Shape Switcher */}
            <div className="flex items-center bg-black border border-zinc-800 rounded-xl p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setShape('RECTANGLE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  shape === 'RECTANGLE' ? 'bg-lime-500 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Square size={14} /> Rectangle
              </button>

              <button
                type="button"
                onClick={() => setShape('TRIANGLE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition ${
                  shape === 'TRIANGLE' ? 'bg-lime-500 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
                title="Triangle: Base × Height ÷ 2"
              >
                <Triangle size={14} /> Triangle
              </button>
            </div>

            {/* SQ FT vs LINEAR FT Switcher */}
            <div className="flex items-center bg-black border border-zinc-800 rounded-xl p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setUnit('SQ_FT')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  unit === 'SQ_FT' ? 'bg-lime-500 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                SQ FT
              </button>

              <button
                type="button"
                onClick={() => setUnit('LINEAR_FT')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  unit === 'LINEAR_FT' ? 'bg-lime-500 text-black font-black' : 'text-zinc-400 hover:text-white'
                }`}
              >
                LINEAR FT
              </button>
            </div>

          </div>

          <div className="flex items-center gap-2">
            
            {/* Lock Length Toggle */}
            <button
              type="button"
              onClick={() => setIsLengthLocked(!isLengthLocked)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                isLengthLocked
                  ? 'bg-lime-500 text-black border-lime-400'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600'
              }`}
              title="Lock Length for consecutive entries"
            >
              {isLengthLocked ? <Lock size={14} /> : <Unlock size={14} />}
              <span>Lock L</span>
            </button>

            {/* Lock Height Toggle */}
            <button
              type="button"
              onClick={() => setIsHeightLocked(!isHeightLocked)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                isHeightLocked
                  ? 'bg-lime-500 text-black border-lime-400'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-700 hover:border-zinc-600'
              }`}
              title="Lock Height for consecutive entries"
            >
              {isHeightLocked ? <Lock size={14} /> : <Unlock size={14} />}
              <span>Lock H</span>
            </button>

            {/* Subtract Opening Mode Switch */}
            <button
              type="button"
              onClick={() => setIsSubtractionMode(!isSubtractionMode)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-extrabold border transition ${
                isSubtractionMode
                  ? 'bg-red-600 text-white border-red-400'
                  : 'bg-zinc-800 text-red-400 border-red-500/30 hover:bg-red-500/10'
              }`}
            >
              <Minus size={14} />
              <span>{isSubtractionMode ? 'Subtraction' : '+ SUBTRACT OPENING'}</span>
            </button>

            {/* Touch Numpad Toggle */}
            <button
              type="button"
              onClick={() => setShowNumpad(!showNumpad)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                showNumpad ? 'bg-zinc-700 text-lime-400 border-lime-400' : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              Numpad
            </button>

          </div>
        </div>

        {/* Quick Opening Subtraction Presets Bar */}
        {isSubtractionMode && (
          <div className="mb-4 p-3 bg-red-950/20 border border-red-500/30 rounded-xl space-y-2 animate-fadeIn">
            <span className="text-xs font-bold uppercase text-red-400">Quick Subtraction Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              {OPENING_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOpeningPreset(preset)}
                  className="px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-600/30 text-red-300 text-xs font-semibold border border-red-500/20 transition"
                >
                  - {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Fields Row */}
        <form onSubmit={handleAddOrUpdate} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            
            {/* LENGTH */}
            <div className={unit === 'LINEAR_FT' ? 'sm:col-span-8' : 'sm:col-span-4'}>
              <label className="block text-xs font-black uppercase tracking-wider text-lime-400 mb-1.5 flex items-center justify-between">
                <span>{shape === 'TRIANGLE' ? 'BASE LENGTH (FT) *' : 'LENGTH (FT) *'}</span>
                {isLengthLocked && <Lock size={13} className="text-lime-400" />}
              </label>
              <div className="relative">
                <input
                  ref={lengthInputRef}
                  type="number"
                  step="any"
                  required
                  value={length}
                  onFocus={() => setActiveNumpadTarget('length')}
                  onChange={(e) => setLength(e.target.value)}
                  placeholder="e.g. 16"
                  className={`w-full bg-black border-2 rounded-2xl px-5 py-4 text-2xl font-black text-white mono-font transition ${
                    isLengthLocked ? 'border-lime-500 bg-lime-950/20 text-lime-300' : 'border-zinc-700 focus:border-lime-400'
                  }`}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                  FT
                </span>
              </div>
            </div>

            {unit === 'SQ_FT' && (
              <>
                <div className="hidden sm:flex col-span-1 items-center justify-center pb-4 text-2xl font-black text-zinc-600">
                  ×
                </div>

                {/* HEIGHT / WIDTH */}
                <div className="sm:col-span-4">
                  <label className="block text-xs font-black uppercase tracking-wider text-lime-400 mb-1.5 flex items-center justify-between">
                    <span>HEIGHT / WIDTH (FT) *</span>
                    {isHeightLocked && <Lock size={13} className="text-lime-400" />}
                  </label>
                  <div className="relative">
                    <input
                      ref={heightInputRef}
                      type="number"
                      step="any"
                      required
                      value={height}
                      onFocus={() => setActiveNumpadTarget('height')}
                      onChange={(e) => setHeight(e.target.value)}
                      placeholder="e.g. 8"
                      className={`w-full bg-black border-2 rounded-2xl px-5 py-4 text-2xl font-black text-white mono-font transition ${
                        isHeightLocked ? 'border-lime-500 bg-lime-950/20 text-lime-300' : 'border-zinc-700 focus:border-lime-400'
                      }`}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-500">
                      FT
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* QTY */}
            <div className={unit === 'LINEAR_FT' ? 'sm:col-span-4' : 'sm:col-span-3'}>
              <label className="block text-xs font-black uppercase tracking-wider text-zinc-300 mb-1.5">
                QTY (REPEATS)
              </label>
              <div className="flex items-center bg-black border-2 border-zinc-700 rounded-2xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-12 h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-lg active:scale-95 transition"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full text-center bg-transparent text-xl font-extrabold text-white mono-font outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="w-12 h-14 bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center text-lg active:scale-95 transition"
                >
                  +
                </button>
              </div>
            </div>

          </div>

          {/* Description, Room Tag & Line Comment */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Description (e.g. North Wall, Window #2)..."
              className="sm:col-span-5 bg-black border border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold text-white placeholder:text-zinc-600 focus:border-lime-500 outline-none"
            />

            <select
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              className="sm:col-span-3 bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-semibold text-white focus:border-lime-500 outline-none"
            >
              <option value="">Optional Room...</option>
              {ROOM_PRESETS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Comment (e.g. Scaffolding needed)..."
              className="sm:col-span-4 bg-black border border-zinc-800 rounded-xl px-4 py-2 text-xs font-semibold text-white placeholder:text-zinc-600 focus:border-lime-500 outline-none"
            />
          </div>

          {/* Preview & Big Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            
            {/* UNDO LAST MEASUREMENT BUTTON */}
            {categoryData.items.length > 0 && !editingId && (
              <button
                type="button"
                onClick={onUndoLastMeasurement}
                className="px-4 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-amber-400 font-extrabold text-sm flex items-center gap-1.5 transition active:scale-95"
                title="Undo last added measurement"
              >
                <RotateCcw size={18} />
                <span>UNDO LAST</span>
              </button>
            )}

            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-sm transition"
              >
                Cancel Edit
              </button>
            )}

            <button
              type="submit"
              disabled={!length || (unit === 'SQ_FT' && !height)}
              className={`flex-1 py-4 px-6 rounded-2xl font-black text-lg tracking-wide uppercase shadow-xl flex items-center justify-center gap-2 active:scale-98 transition ${
                isSubtractionMode
                  ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 disabled:opacity-50'
                  : editingId
                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    : 'bg-lime-500 hover:bg-lime-400 text-black shadow-lime-500/25 disabled:opacity-50'
              }`}
            >
              {editingId ? (
                <>
                  <Check size={24} strokeWidth={3} />
                  <span>Update Measurement</span>
                </>
              ) : isSubtractionMode ? (
                <>
                  <Minus size={24} strokeWidth={3} />
                  <span>Subtract Opening ({formatSqFt(Math.abs(currentPreviewSqFt))} {unit === 'LINEAR_FT' ? 'LIN FT' : 'SQ FT'})</span>
                </>
              ) : (
                <>
                  <Plus size={24} strokeWidth={3} />
                  <span>+ ADD MEASUREMENT ({formatSqFt(currentPreviewSqFt)} {unit === 'LINEAR_FT' ? 'LIN FT' : 'SQ FT'})</span>
                </>
              )}
            </button>
          </div>

        </form>

        {/* Numpad Drawer */}
        {showNumpad && (
          <div className="mt-4 p-4 bg-black border border-zinc-800 rounded-2xl animate-fadeIn">
            <div className="flex items-center justify-between mb-3 text-xs font-bold text-zinc-400">
              <span>ACTIVE TARGET: <strong className="text-lime-400 uppercase">{activeNumpadTarget}</strong></span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setActiveNumpadTarget('length')}
                  className={`px-2.5 py-1 rounded-md ${activeNumpadTarget === 'length' ? 'bg-lime-500 text-black font-black' : 'bg-zinc-800 text-zinc-300'}`}
                >
                  Length
                </button>
                <button 
                  onClick={() => setActiveNumpadTarget('height')}
                  className={`px-2.5 py-1 rounded-md ${activeNumpadTarget === 'height' ? 'bg-lime-500 text-black font-black' : 'bg-zinc-800 text-zinc-300'}`}
                >
                  Height
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {['7', '8', '9', 'BACK', '4', '5', '6', 'CLEAR', '1', '2', '3', '.', '0', '00', '8', '10'].map((btn, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleNumpadTap(btn)}
                  className={`py-3.5 rounded-xl font-extrabold text-lg transition active:scale-95 ${
                    btn === 'BACK' || btn === 'CLEAR'
                      ? 'bg-zinc-800 text-red-400 text-sm'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white border border-zinc-800'
                  }`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Measurement History */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="bg-zinc-800/80 px-6 py-4 border-b border-zinc-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400"></span>
            <h3 className="text-base font-bold text-white uppercase tracking-wider">
              Measurement History ({totals.itemCount} Entries)
            </h3>
          </div>
          <span className="text-xs text-zinc-400">Tap line item to edit or duplicate</span>
        </div>

        {categoryData.items.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 text-zinc-600 flex items-center justify-center mx-auto mb-3">
              <Calculator size={32} />
            </div>
            <p className="text-zinc-400 text-base font-semibold">No measurements entered for this area yet.</p>
            <p className="text-zinc-600 text-xs mt-1">Enter Length & Height above and press + ADD MEASUREMENT</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/80">
            {categoryData.items.map((item, index) => {
              const isSubtraction = item.type === 'subtraction';
              const isTriangle = item.shape === 'TRIANGLE';
              const isLinear = item.unit === 'LINEAR_FT';
              const sqft = item.sqft !== undefined ? item.sqft : calculateItemSqFt(item.length, item.height, item.qty, item.shape, item.type, item.unit);

              return (
                <div
                  key={item.id || index}
                  className={`p-4 sm:px-6 flex flex-wrap items-center justify-between gap-4 transition ${
                    isSubtraction ? 'bg-red-950/10 hover:bg-red-950/20' : 'hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 font-extrabold text-sm flex items-center justify-center border border-zinc-700">
                      {index + 1}
                    </span>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-white mono-font">
                          {isLinear ? `${item.length}' Linear` : `${item.length}' × ${item.height}'`}
                        </span>

                        {isTriangle && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-xs flex items-center gap-1 border border-amber-500/30">
                            <Triangle size={10} /> Triangle
                          </span>
                        )}

                        {item.qty > 1 && (
                          <span className="px-2 py-0.5 rounded-md bg-lime-500/20 text-lime-300 font-bold text-xs">
                            x{item.qty} Qty
                          </span>
                        )}

                        {isSubtraction && (
                          <span className="px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 font-bold text-xs border border-red-500/30">
                            Subtraction
                          </span>
                        )}
                      </div>
                      
                      <div className="text-xs text-zinc-400 font-medium flex items-center gap-2">
                        <span>{item.label || (isSubtraction ? 'Opening' : 'Section')}</span>
                        {item.room && <span className="text-lime-400/90 font-bold">• {item.room}</span>}
                        {item.comment && <span className="text-zinc-500 italic">("{item.comment}")</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className={`text-xl font-black mono-font ${isSubtraction ? 'text-red-400' : 'text-lime-400'}`}>
                        {isSubtraction ? '-' : ''}{formatSqFt(Math.abs(sqft))} <span className="text-xs font-bold text-zinc-400">{isLinear ? 'LIN FT' : 'SQ FT'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                        title="Edit Measurement"
                      >
                        <Edit2 size={16} />
                      </button>

                      <button
                        onClick={() => onDuplicateMeasurement(item)}
                        className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-lime-400 transition"
                        title="Duplicate Measurement"
                      >
                        <Copy size={16} />
                      </button>

                      <button
                        onClick={() => onDeleteMeasurement(item.id)}
                        className="p-2.5 rounded-xl bg-zinc-800 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 transition"
                        title="Delete Measurement"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Area Notes with Voice Input & Presets */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
        <button
          onClick={() => setShowNotesDrawer(!showNotesDrawer)}
          className="w-full px-6 py-4 bg-zinc-800/60 hover:bg-zinc-800 flex items-center justify-between text-left transition"
        >
          <div className="flex items-center gap-2">
            <FileText size={18} className="text-lime-400" />
            <span className="font-bold text-sm text-white uppercase tracking-wider">
              {activeCategory?.name} Notes & Speech Input
            </span>
            {categoryData.notes && <span className="w-2 h-2 rounded-full bg-lime-400"></span>}
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400 font-semibold">
            <span>{showNotesDrawer ? 'Hide Notes' : 'Edit Notes & Voice'}</span>
            {showNotesDrawer ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </button>

        {showNotesDrawer && (
          <div className="p-6 space-y-4 border-t border-zinc-800">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
                Quick Job Presets (Tap to Add Tag)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_NOTES.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPresetNote(preset)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-lime-500/20 hover:text-lime-300 text-xs font-semibold text-zinc-300 border border-zinc-700 transition"
                  >
                    + {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase text-zinc-400">Written Notes</label>
                
                {/* Voice Input Button */}
                <button
                  type="button"
                  onClick={handleToggleVoiceInput}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border transition ${
                    isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-800 text-lime-400 border-lime-500/40 hover:bg-lime-500/20'
                  }`}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isListening ? 'Listening (Speak Now)...' : 'Voice Input (Speech-to-Text)'}</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={categoryData.notes || ''}
                onChange={(e) => onUpdateNotes(e.target.value)}
                placeholder="Enter specific notes or use microphone above..."
                className="w-full bg-black border border-zinc-700 rounded-xl p-4 text-xs font-medium text-white placeholder:text-zinc-600 focus:border-lime-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
