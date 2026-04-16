import { motion } from 'framer-motion';
import { ConversionStep } from '@/lib/cfg-to-pda';

interface Props {
  steps: ConversionStep[];
  currentStep: number;
}

const typeColors: Record<string, string> = {
  init: 'bg-info/15 border-info/30 text-info',
  production: 'bg-accent/15 border-accent/30 text-accent',
  terminal: 'bg-success/15 border-success/30 text-success',
  accept: 'bg-primary/15 border-primary/30 text-primary',
};

const typeLabels: Record<string, string> = {
  init: 'INIT',
  production: 'PROD',
  terminal: 'TERM',
  accept: 'ACCEPT',
};

export default function ConversionSteps({ steps, currentStep }: Props) {
  return (
    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
      {steps.map((step, i) => {
        const isActive = i === currentStep;
        const isPast = i < currentStep;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`p-3 rounded-lg border transition-all ${
              isActive
                ? 'bg-primary/5 border-primary/30 shadow-sm'
                : isPast
                  ? 'bg-muted/30 border-border/50 opacity-60'
                  : 'bg-card border-border/40 opacity-40'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded border ${typeColors[step.ruleType]}`}>
                {typeLabels[step.ruleType]}
              </span>
              <span className={`text-xs font-semibold ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                {step.description}
              </span>
            </div>
            <p className="text-[11px] font-mono text-muted-foreground leading-relaxed pl-1">
              {step.detail}
            </p>
          </motion.div>
        );
      })}
    </div>
  );
}
