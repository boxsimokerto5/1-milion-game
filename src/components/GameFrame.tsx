import React, { useState } from 'react';
import { Loader2, RefreshCw, AlertTriangle, ExternalLink, ShieldAlert } from 'lucide-react';

interface GameFrameProps {
  url: string;
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  onReload: () => void;
  keyTrigger: number;
  bottomSpacing?: number;
}

export const GameFrame: React.FC<GameFrameProps> = ({
  url,
  iframeRef,
  onReload,
  keyTrigger,
  bottomSpacing = 56,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div
      className="relative w-full h-full bg-slate-950 overflow-hidden select-none transition-all duration-300"
      style={{
        paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomSpacing}px)`,
      }}
    >
      {/* Loading Overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/95 backdrop-blur-sm transition-opacity duration-500">
          <div className="relative flex items-center justify-center mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-sky-100 border-t-[#108EE9] animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-[#108EE9] animate-pulse" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-wider text-slate-100">
            Memuat Game Saldo DANA...
          </h2>
          <p className="mt-2 text-sm text-slate-400 max-w-xs text-center">
            Menyiapkan canvas WebGL dan engine game ke layar penuh.
          </p>
          <div className="mt-4 flex items-center gap-2 text-xs text-sky-300 bg-sky-950/60 border border-sky-800/60 px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            Mode Layar Penuh Siap
          </div>
        </div>
      )}

      {/* Error State Fallback */}
      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950 p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-950/60 border border-red-800/80 flex items-center justify-center mb-4 text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Gagal Memuat Iframe Game
          </h3>
          <p className="text-sm text-slate-400 max-w-md mb-6">
            Koneksi internet Anda mungkin terputus, atau browser membatasi rendering iframe.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={onReload}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition"
            >
              <RefreshCw className="w-4 h-4" />
              Coba Muat Ulang
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold rounded-lg border border-slate-700 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Buka Langsung di Browser
            </a>
          </div>
        </div>
      )}

      {/* Fullscreen Game Iframe */}
      <iframe
        key={keyTrigger}
        ref={iframeRef}
        src={url}
        title="Astrocade"
        className="w-full h-full border-0 block"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen; screen-wake-lock"
        allowFullScreen
        referrerPolicy="no-referrer"
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </div>
  );
};
