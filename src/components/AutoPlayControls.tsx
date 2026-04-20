import { useEffect, useState } from 'react';

interface Props {
  currentStep: number;
  totalSteps: number;
  onStep: (n: number) => void;
}

const SPEEDS = [
  { label: '0.5×', ms: 1800 },
  { label: '1×', ms: 1000 },
  { label: '2×', ms: 500 },
  { label: '4×', ms: 250 },
];

export default function AutoPlayControls({ currentStep, totalSteps, onStep }: Props) {
  const [playing, setPlaying] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(1);

  // Auto-stop at end
  useEffect(() => {
    if (playing && currentStep >= totalSteps - 1) {
      setPlaying(false);
    }
  }, [playing, currentStep, totalSteps]);

  // Tick interval
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      onStep(Math.min(totalSteps - 1, currentStep + 1));
    }, SPEEDS[speedIdx].ms);
    return () => clearInterval(id);
  }, [playing, currentStep, totalSteps, speedIdx, onStep]);

  const atStart = currentStep === 0;
  const atEnd = currentStep >= totalSteps - 1;

  const togglePlay = () => {
    if (atEnd) {
      onStep(0);
      setPlaying(true);
    } else {
      setPlaying(p => !p);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={() => { setPlaying(false); onStep(0); }}
        disabled={atStart}
        title="Restart"
        className="w-7 h-7 flex items-center justify-center rounded-md bg-muted border border-border text-foreground disabled:opacity-25 hover:bg-secondary active:scale-95"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
      </button>
      <button
        onClick={() => { setPlaying(false); onStep(Math.max(0, currentStep - 1)); }}
        disabled={atStart}
        className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-muted border border-border text-foreground disabled:opacity-25 hover:bg-secondary active:scale-95"
      >
        ←
      </button>
      <button
        onClick={togglePlay}
        title={playing ? 'Pause' : 'Play'}
        className="w-8 h-8 flex items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm shadow-primary/25 hover:brightness-110 active:scale-95"
      >
        {playing ? (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
        )}
      </button>
      <button
        onClick={() => { setPlaying(false); onStep(Math.min(totalSteps - 1, currentStep + 1)); }}
        disabled={atEnd}
        className="px-2.5 py-1.5 text-xs font-medium rounded-md bg-muted border border-border text-foreground disabled:opacity-25 hover:bg-secondary active:scale-95"
      >
        →
      </button>
      <span className="text-xs text-muted-foreground font-mono min-w-[44px] text-center">
        {currentStep + 1}/{totalSteps}
      </span>
      <button
        onClick={() => setSpeedIdx((speedIdx + 1) % SPEEDS.length)}
        title="Playback speed"
        className="px-2 py-1 text-[10px] font-bold font-mono rounded-md bg-muted border border-border text-info hover:bg-secondary active:scale-95 min-w-[34px]"
      >
        {SPEEDS[speedIdx].label}
      </button>
    </div>
  );
}
