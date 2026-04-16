import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function TheorySection() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 flex items-center justify-between text-left"
      >
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Theory
        </span>
        <span className="text-muted-foreground text-sm transition-transform" style={{ transform: open ? 'rotate(180deg)' : '' }}>
          ▾
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                A <strong className="text-foreground">Pushdown Automaton (PDA)</strong> is defined as a 7-tuple:
              </p>
              <div className="p-3 rounded-lg bg-muted/50 border border-border font-mono text-foreground text-[11px]">
                M = (Q, Σ, Γ, δ, q₀, Z₀, F)
              </div>
              <ul className="space-y-1.5 pl-3">
                <li><strong className="text-info font-mono">Q</strong> — Finite set of states</li>
                <li><strong className="text-info font-mono">Σ</strong> — Input alphabet</li>
                <li><strong className="text-info font-mono">Γ</strong> — Stack alphabet</li>
                <li><strong className="text-info font-mono">δ</strong> — Transition function: Q × (Σ ∪ {'{'} ε {'}'}) × Γ → P(Q × Γ*)</li>
                <li><strong className="text-info font-mono">q₀</strong> — Start state</li>
                <li><strong className="text-info font-mono">Z₀</strong> — Initial stack symbol</li>
                <li><strong className="text-info font-mono">F</strong> — Set of accept states</li>
              </ul>
              <p className="pt-1">
                <strong className="text-foreground">Conversion algorithm:</strong> For each production A → α in the CFG,
                create a transition δ(q, ε, A) = (q, αᴿ). For each terminal a, add δ(q, a, a) = (q, ε).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
