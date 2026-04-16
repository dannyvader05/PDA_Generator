import { Snapshot } from '@/lib/pda-simulator';
import { motion } from 'framer-motion';

interface Props {
  snapshots: Snapshot[];
  currentStep: number;
  accepted: boolean;
}

export default function SimulationView({ snapshots, currentStep, accepted }: Props) {
  const snap = snapshots[currentStep];
  const isLast = currentStep === snapshots.length - 1;

  return (
    <div className="space-y-4">
      {/* Result badge */}
      {isLast && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-3 rounded-lg text-center text-sm font-bold border ${
            accepted
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-destructive/10 border-destructive/30 text-destructive'
          }`}
        >
          {accepted ? '✓ String Accepted' : '✗ String Rejected'}
        </motion.div>
      )}

      {/* Current snapshot detail */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 rounded-lg bg-muted/30 border border-border space-y-3"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Step {currentStep + 1}
          </span>
          <span className="text-xs font-mono text-info font-bold">
            {snap.state}
          </span>
        </div>

        {/* Transition used */}
        <p className="text-xs font-mono text-foreground leading-relaxed">
          {snap.description}
        </p>

        {/* Remaining input */}
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Input: </span>
          <span className="font-mono text-sm text-foreground">
            {snap.remainingInput || <span className="text-muted-foreground italic">ε (empty)</span>}
          </span>
        </div>

        {/* Stack visualization */}
        <div>
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            Stack (top → bottom):
          </span>
          <div className="flex flex-wrap gap-1">
            {snap.stack.length === 0 ? (
              <span className="text-xs text-muted-foreground italic">Empty</span>
            ) : (
              [...snap.stack].reverse().map((sym, i) => (
                <span
                  key={i}
                  className={`px-2 py-1 text-xs font-mono font-bold rounded border ${
                    i === 0
                      ? 'bg-info/15 border-info/30 text-info'
                      : 'bg-muted border-border text-foreground'
                  }`}
                >
                  {sym}
                </span>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Timeline dots */}
      <div className="flex gap-1 flex-wrap">
        {snapshots.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentStep
                ? 'bg-primary scale-125'
                : i < currentStep
                  ? 'bg-primary/40'
                  : 'bg-border'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
