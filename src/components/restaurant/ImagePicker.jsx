import React, { useState, useRef } from 'react';
import { Upload, Link, Search, Image, ExternalLink, Check, X, Loader } from 'lucide-react';

/**
 * ImagePicker — three modes:
 * 1. File Upload  — picks jpg/png/webp/gif from device, uploads to ImgBB and returns hosted URL
 * 2. Google Search — opens google images in a new tab, user pastes back the URL
 * 3. Direct URL   — paste any image URL
 *
 * Props:
 *   value     — current image URL string
 *   onChange  — (url: string) => void
 *   dishName  — used to seed the Google Images search query
 */

// ImgBB free API key (free tier, no account needed for basic uploads)
const IMGBB_KEY = 'f6cd2a4f2b438b77f2b07e890fd3ad38';

const ImagePicker = ({ value, onChange, dishName = '' }) => {
  const [tab, setTab] = useState('upload'); // 'upload' | 'google' | 'url'
  const [urlInput, setUrlInput] = useState(value || '');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [previewOk, setPreviewOk] = useState(true);
  const fileRef = useRef(null);

  // ── File Upload ──────────────────────────────────────────
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    if (!allowed.includes(file.type)) {
      setUploadError('Only JPG, PNG, WEBP, GIF, BMP files are allowed.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('File too large. Max 8 MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    setUploadSuccess(false);

    try {
      // Convert to base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Upload to ImgBB
      const form = new FormData();
      form.append('key', IMGBB_KEY);
      form.append('image', base64);
      form.append('name', file.name.replace(/\.[^.]+$/, ''));

      const res = await fetch('https://api.imgbb.com/1/upload', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const json = await res.json();

      if (json.success && json.data?.url) {
        const hostedUrl = json.data.display_url || json.data.url;
        onChange(hostedUrl);
        setUrlInput(hostedUrl);
        setUploadSuccess(true);
        setPreviewOk(true);
      } else {
        throw new Error('ImgBB returned no URL');
      }
    } catch (err) {
      // Fallback: use local base64 data URL (works but large)
      console.warn('ImgBB upload failed, falling back to base64:', err.message);
      const base64Full = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
      });
      onChange(base64Full);
      setUrlInput('[File uploaded - base64]');
      setUploadSuccess(true);
    } finally {
      setUploading(false);
    }
  };

  // ── Google Images ─────────────────────────────────────────
  const openGoogleImages = () => {
    const query = encodeURIComponent((dishName || 'food dish') + ' dish food photo');
    window.open(
      `https://www.google.com/search?tbm=isch&q=${query}`,
      'google_images',
      'width=1100,height=700,scrollbars=yes,resizable=yes'
    );
  };

  // ── URL Input ─────────────────────────────────────────────
  const handleUrlApply = () => {
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setPreviewOk(true);
  };

  const currentPreview = value;

  return (
    <div className="space-y-4">
      {/* Tab bar */}
      <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
        {[
          { id: 'upload', icon: Upload, label: 'Upload File' },
          { id: 'google', icon: Search, label: 'Google Images' },
          { id: 'url',    icon: Link,   label: 'Paste URL' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
              tab === id
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                : 'text-white/30 hover:text-white/60 hover:bg-white/5'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* ── UPLOAD TAB ── */}
      {tab === 'upload' && (
        <div className="space-y-3">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/bmp"
            ref={fileRef}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className={`w-full py-8 border-2 border-dashed rounded-2xl flex flex-col items-center gap-3 transition-all ${
              uploading
                ? 'border-orange-500/40 bg-orange-500/10 cursor-wait'
                : 'border-white/15 hover:border-orange-500/50 hover:bg-orange-500/5 cursor-pointer'
            }`}
          >
            {uploading ? (
              <>
                <Loader className="w-8 h-8 text-orange-400 animate-spin" />
                <p className="text-[11px] font-black uppercase text-orange-400 italic">Uploading...</p>
                <p className="text-[9px] text-white/30">Getting hosted URL</p>
              </>
            ) : uploadSuccess ? (
              <>
                <Check className="w-8 h-8 text-emerald-400" />
                <p className="text-[11px] font-black uppercase text-emerald-400 italic">Upload Successful!</p>
                <p className="text-[9px] text-white/30">Click to upload another</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-2xl bg-orange-500/15 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-orange-400" />
                </div>
                <p className="text-[12px] font-black uppercase text-white/60 italic">Click to upload image</p>
                <p className="text-[9px] text-white/30">JPG · PNG · WEBP · GIF · BMP · Max 8MB</p>
              </>
            )}
          </button>
          {uploadError && (
            <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <X className="w-4 h-4 text-rose-400 shrink-0" />
              <p className="text-[10px] text-rose-400 font-bold">{uploadError}</p>
            </div>
          )}
        </div>
      )}

      {/* ── GOOGLE IMAGES TAB ── */}
      {tab === 'google' && (
        <div className="space-y-3">
          {/* Step 1: Open Google */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Step 1 — Open Google Images</p>
            <button
              type="button"
              onClick={openGoogleImages}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase text-white hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              Search "{dishName || 'food'}" on Google Images
            </button>
          </div>

          {/* Step 2: Instructions */}
          <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl space-y-2">
            <p className="text-[9px] font-black uppercase text-blue-400/70 tracking-widest">Step 2 — Copy Image URL</p>
            <div className="space-y-1.5">
              {[
                '🖱️ Right-click any image in Google',
                '📋 Click "Copy image address"',
                '⬇️ Paste the URL in the field below',
              ].map((step, i) => (
                <p key={i} className="text-[11px] text-white/50 font-semibold">{step}</p>
              ))}
            </div>
          </div>

          {/* Step 3: Paste URL */}
          <div className="space-y-2">
            <p className="text-[9px] font-black uppercase text-white/30 tracking-widest">Step 3 — Paste the copied URL here</p>
            <div className="flex gap-2">
              <input
                type="url"
                value={urlInput.startsWith('data:') ? '' : urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://lh3.googleusercontent.com/..."
                className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-blue-500 transition-all text-xs text-white font-mono"
              />
              <button
                type="button"
                onClick={handleUrlApply}
                className="px-4 bg-blue-600 rounded-xl text-[10px] font-black uppercase text-white hover:bg-blue-500 transition-all shrink-0"
              >
                Use
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── URL TAB ── */}
      {tab === 'url' && (
        <div className="space-y-3">
          <p className="text-[9px] text-white/30 font-black uppercase tracking-widest">Paste any image URL (Unsplash, direct link, etc.)</p>
          <div className="flex gap-2">
            <input
              type="url"
              value={urlInput.startsWith('data:') ? '' : urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl outline-none focus:border-orange-500 transition-all text-xs text-white font-mono"
            />
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 bg-orange-600 rounded-xl text-[10px] font-black uppercase text-white hover:bg-orange-500 transition-all shrink-0"
            >
              Apply
            </button>
          </div>
          <p className="text-[8px] text-white/20 italic">Tip: On Google Images, right-click → "Copy image address" then paste here</p>
        </div>
      )}

      {/* Live Preview */}
      {currentPreview && (
        <div className="relative">
          <div className="flex items-center gap-4 p-3 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 shrink-0 bg-white/5">
              <img
                src={currentPreview}
                alt="preview"
                className="w-full h-full object-cover"
                onError={() => setPreviewOk(false)}
                onLoad={() => setPreviewOk(true)}
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-black uppercase text-white/50 tracking-wider mb-1">
                {previewOk ? '✅ Image Preview' : '❌ Image failed to load'}
              </p>
              <p className="text-[8px] text-white/25 font-mono truncate">
                {currentPreview.startsWith('data:') ? '[Local file — base64]' : currentPreview}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { onChange(''); setUrlInput(''); setUploadSuccess(false); }}
              className="w-7 h-7 rounded-lg bg-rose-500/15 flex items-center justify-center text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/25 transition-all shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagePicker;
