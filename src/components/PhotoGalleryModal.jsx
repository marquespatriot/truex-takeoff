import React, { useState, useRef } from 'react';
import { X, Camera, Upload, Trash2, Edit3, Image as ImageIcon, Sparkles, Check } from 'lucide-react';

export default function PhotoGalleryModal({
  isOpen,
  onClose,
  title = "Project Photos",
  photos = [],
  onAddPhoto,
  onDeletePhoto
}) {
  const [caption, setCaption] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [markupMode, setMarkupMode] = useState(false);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (dataUrl) {
        onAddPhoto({
          id: `photo_${Date.now()}`,
          url: dataUrl,
          caption: caption.trim() || 'Job Site Photo',
          timestamp: new Date().toISOString()
        });
        setCaption('');
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-6">
        
        {/* Header */}
        <div className="bg-zinc-800/90 px-6 py-4 border-b border-zinc-700/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-500/20 border border-lime-500/30 flex items-center justify-center text-lime-400 font-bold">
              <Camera size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">{title}</h2>
              <p className="text-xs text-zinc-400">Capture job site conditions and access photos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-zinc-700/50 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          
          {/* Add Photo Controls */}
          <div className="bg-black border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Optional caption (e.g. Existing fiberglass needs removal, HVAC in area)..."
                className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:border-lime-500 outline-none"
              />

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-black font-black text-xs shadow-md transition active:scale-95"
              >
                <Camera size={16} />
                <span>Take / Upload Photo</span>
              </button>
            </div>
          </div>

          {/* Photo Grid */}
          {photos.length === 0 ? (
            <div className="p-10 text-center border-2 border-dashed border-zinc-800 rounded-2xl">
              <ImageIcon size={40} className="text-zinc-600 mx-auto mb-2" />
              <p className="text-zinc-400 text-sm font-semibold">No photos attached yet.</p>
              <p className="text-zinc-600 text-xs mt-1">Tap 'Take / Upload Photo' above to capture site conditions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {photos.map(photo => (
                <div key={photo.id} className="bg-black border border-zinc-800 rounded-xl overflow-hidden group relative flex flex-col justify-between">
                  <div className="aspect-video bg-zinc-950 relative overflow-hidden">
                    <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                    <button
                      onClick={() => onDeletePhoto(photo.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/90 hover:bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow"
                      title="Delete Photo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="p-3 bg-zinc-900 border-t border-zinc-800 text-xs">
                    <p className="font-bold text-white truncate">{photo.caption || 'Job Photo'}</p>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Future Markup Readiness Note */}
          <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-lime-400" />
              Photo Markup Ready: Draw arrows, circles, & text overlays ready for future releases.
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
