import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Camera,
  RotateCcw,
  CornerDownLeft,
  Copy,
  Check,
  FileText,
  Sliders,
  Maximize2,
  Sparkles,
} from 'lucide-react';
import { CameraViewPreset } from '../types';

interface TypewriterUIProps {
  lines: string[];
  currentCol: number;
  maxCols: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  cameraPreset: CameraViewPreset;
  onSelectCameraPreset: (preset: CameraViewPreset) => void;
  badgeText: string;
  onChangeBadgeText: (text: string) => void;
  onCarriageReturn: () => void;
  onSpace: () => void;
  onClearPaper: () => void;
  onLoadSampleText: () => void;
}

export const TypewriterUI: React.FC<TypewriterUIProps> = ({
  lines,
  currentCol,
  maxCols,
  soundEnabled,
  onToggleSound,
  cameraPreset,
  onSelectCameraPreset,
  badgeText,
  onChangeBadgeText,
  onCarriageReturn,
  onSpace,
  onClearPaper,
  onLoadSampleText,
}) => {
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPaperSheet, setShowPaperSheet] = useState(false);

  const handleCopy = () => {
    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cameraButtons: { id: CameraViewPreset; label: string; desc: string }[] = [
    { id: 'studio', label: 'Studio 3/4', desc: 'Reference photography view' },
    { id: 'side', label: 'Wedge Profile', desc: 'Verify rising low-profile silhouette' },
    { id: 'top', label: 'Top-Down', desc: 'Recessed keyboard cavity' },
    { id: 'platen', label: 'Paper & Platen', desc: 'Close-up on roller & typed text' },
    { id: 'typebars', label: 'Mechanics', desc: 'Internal typebars & ribbon' },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 md:p-6 select-none">
      {/* Top Bar: Title, Badge Switcher & Utilities */}
      <header id="app-header" className="pointer-events-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 bg-neutral-900/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-neutral-700/50 shadow-lg text-neutral-100">
          <div className="w-3.5 h-3.5 rounded-full bg-[#2a685e] border border-teal-300/40 shadow-sm" />
          <div>
            <h1 className="text-sm font-semibold tracking-wide flex items-center gap-2">
              Olivetti Lettera 32
              <span className="text-[10px] font-mono uppercase bg-neutral-800 text-teal-300 px-1.5 py-0.5 rounded border border-teal-500/30">
                1963 Marcello Nizzoli
              </span>
            </h1>
            <p className="text-[11px] text-neutral-400 font-mono">
              Continuous Molded Enamel Shell • Recessed Cavity
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            id="btn-toggle-sound"
            onClick={onToggleSound}
            className={`pointer-events-auto p-2.5 rounded-xl backdrop-blur-md border transition-all flex items-center gap-1.5 shadow-md ${
              soundEnabled
                ? 'bg-neutral-900/80 text-teal-300 border-teal-600/40 hover:bg-neutral-800/90'
                : 'bg-neutral-900/60 text-neutral-400 border-neutral-700/50 hover:bg-neutral-800/80'
            }`}
            title={soundEnabled ? 'Mechanical Sound On' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="text-xs font-mono hidden sm:inline">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>

          {/* Quick Settings (Badge Plate & Options) */}
          <button
            id="btn-toggle-settings"
            onClick={() => setShowSettings(!showSettings)}
            className="pointer-events-auto p-2.5 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 text-neutral-200 hover:bg-neutral-800/90 shadow-md transition-all flex items-center gap-1.5"
            title="Typewriter options"
          >
            <Sliders className="w-4 h-4" />
            <span className="text-xs font-mono hidden sm:inline">CUSTOMIZE</span>
          </button>

          {/* View Typed Page Drawer */}
          <button
            id="btn-toggle-paper-view"
            onClick={() => setShowPaperSheet(!showPaperSheet)}
            className="pointer-events-auto p-2.5 rounded-xl bg-neutral-900/80 backdrop-blur-md border border-neutral-700/50 text-neutral-200 hover:bg-neutral-800/90 shadow-md transition-all flex items-center gap-1.5"
            title="Inspect typed document"
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs font-mono hidden sm:inline">PAPER</span>
          </button>
        </div>
      </header>

      {/* Settings Modal Popover */}
      {showSettings && (
        <div
          id="settings-panel"
          className="pointer-events-auto self-end mt-2 w-80 bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/60 rounded-2xl p-4 shadow-2xl text-neutral-200 z-20 space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Badge Plate Inscription
            </span>
            <button
              onClick={() => setShowSettings(false)}
              className="text-neutral-400 hover:text-neutral-100 text-xs"
            >
              ✕
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-neutral-400">Embossed Brushed Aluminum Plate:</label>
            <input
              type="text"
              value={badgeText}
              maxLength={28}
              onChange={(e) => onChangeBadgeText(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-xs font-mono text-teal-300 focus:outline-none focus:border-teal-500"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => onChangeBadgeText('STUDIO -- VIBE CODING 1.0')}
                className="text-[10px] font-mono px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 border border-neutral-700"
              >
                Photo Badge
              </button>
              <button
                onClick={() => onChangeBadgeText('OLIVETTI -- LETTERA 32')}
                className="text-[10px] font-mono px-2 py-1 bg-neutral-800 hover:bg-neutral-700 rounded text-neutral-300 border border-neutral-700"
              >
                Classic 1963
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <span className="text-xs text-neutral-400">Quick Actions:</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onLoadSampleText}
                className="flex items-center justify-center gap-1 text-xs py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200 border border-neutral-700"
              >
                <Sparkles className="w-3 h-3 text-teal-400" />
                Reset Reference
              </button>
              <button
                onClick={onClearPaper}
                className="flex items-center justify-center gap-1 text-xs py-1.5 px-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200 border border-neutral-700"
              >
                <RotateCcw className="w-3 h-3 text-amber-400" />
                Fresh Page
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paper Document Preview Popover */}
      {showPaperSheet && (
        <div
          id="paper-preview-modal"
          className="pointer-events-auto self-center my-auto w-full max-w-md bg-[#faf6ea] text-neutral-900 rounded-xl shadow-2xl p-6 border border-neutral-300 font-mono space-y-4 z-30"
        >
          <div className="flex items-center justify-between border-b border-neutral-300 pb-2">
            <span className="text-xs uppercase tracking-widest text-neutral-500 font-sans font-medium">
              Typed Document Sheet
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-xs bg-neutral-200 hover:bg-neutral-300 text-neutral-800 px-2.5 py-1 rounded transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
              <button
                onClick={() => setShowPaperSheet(false)}
                className="text-neutral-500 hover:text-neutral-900 text-sm font-sans"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="min-h-[140px] max-h-[320px] overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed p-2 bg-[#f4f0e2] rounded border border-neutral-300">
            {lines.join('\n')}
          </div>

          <div className="text-[11px] text-neutral-500 flex justify-between font-sans">
            <span>Lines: {lines.length} • Column: {currentCol} / {maxCols}</span>
            <span>Pitch: 10 CPI Pica</span>
          </div>
        </div>
      )}

      {/* Bottom Bar: Camera Presets, Carriage Return & Typing status */}
      <footer id="app-footer" className="pointer-events-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Camera Perspective Presets */}
        <div className="flex flex-wrap items-center gap-1.5 bg-neutral-900/80 backdrop-blur-md p-1.5 rounded-2xl border border-neutral-700/50 shadow-lg">
          <div className="flex items-center gap-1 px-2 text-neutral-400">
            <Camera className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider hidden md:inline">View</span>
          </div>

          {cameraButtons.map((btn) => (
            <button
              key={btn.id}
              id={`btn-cam-${btn.id}`}
              onClick={() => onSelectCameraPreset(btn.id)}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                cameraPreset === btn.id
                  ? 'bg-[#275951] text-teal-100 shadow-sm border border-teal-400/40'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
              title={btn.desc}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Interactive Typing Controls */}
        <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md px-3 py-2 rounded-2xl border border-neutral-700/50 shadow-lg">
          {/* Column margin indicator */}
          <div className="text-right pr-2 border-r border-neutral-800 hidden sm:block">
            <div className="text-[10px] font-mono text-neutral-400">COL</div>
            <div className="text-xs font-mono font-semibold text-teal-300">
              {currentCol} / {maxCols}
            </div>
          </div>

          {/* Quick Space Button */}
          <button
            id="btn-quick-space"
            onClick={onSpace}
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-mono rounded-xl border border-neutral-700 active:scale-95 transition-all"
            title="Advance space"
          >
            SPACE
          </button>

          {/* Carriage Return Lever Button */}
          <button
            id="btn-carriage-return"
            onClick={onCarriageReturn}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-teal-900/60 hover:bg-teal-800/80 text-teal-200 text-xs font-medium rounded-xl border border-teal-600/50 shadow-sm active:scale-95 transition-all"
            title="Throw Carriage Return Lever & Advance Line"
          >
            <CornerDownLeft className="w-3.5 h-3.5" />
            <span>RETURN LEVER</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
