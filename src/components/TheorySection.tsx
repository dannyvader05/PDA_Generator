import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Section = 'definition' | 'algorithm' | 'acceptance' | 'examples';

export default function TheorySection() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState<Section>('definition');

  const sections: { id: Section; label: string }[] = [
    { id: 'definition', label: 'Definition' },
    { id: 'algorithm', label: 'Algorithm' },
    { id: 'acceptance', label: 'Acceptance' },
    { id: 'examples', label: 'Examples' },
  ];

  return (
    <div className="rounded-xl bg-card border border-border shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-muted/30"
      >
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          📚 Theory & Reference
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-muted-foreground text-sm"
        >
          ▾
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-3">
              {/* Sub-tabs */}
              <div className="flex flex-wrap gap-1 p-0.5 rounded-lg bg-muted/50 border border-border">
                {sections.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSection(s.id)}
                    className={`flex-1 px-2 py-1 text-[10px] font-semibold rounded-md transition-all ${
                      section === s.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={section}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-muted-foreground leading-relaxed space-y-2.5"
                >
                  {section === 'definition' && (
                    <>
                      <p>
                        A <strong className="text-foreground">Pushdown Automaton (PDA)</strong> extends a finite
                        automaton with a stack, giving it the power to recognize all context-free languages.
                      </p>
                      <div className="p-3 rounded-lg bg-muted/50 border border-border font-mono text-foreground text-[11px] text-center">
                        M = (Q, Σ, Γ, δ, q₀, Z₀, F)
                      </div>
                      <ul className="space-y-1.5 pl-1">
                        <li><strong className="text-info font-mono">Q</strong> — Finite set of states</li>
                        <li><strong className="text-info font-mono">Σ</strong> — Input alphabet</li>
                        <li><strong className="text-info font-mono">Γ</strong> — Stack alphabet (Σ ⊆ Γ)</li>
                        <li><strong className="text-info font-mono">δ</strong> — Transition function:<br/>Q × (Σ ∪ {'{ε}'}) × Γ → P(Q × Γ*)</li>
                        <li><strong className="text-info font-mono">q₀</strong> — Start state</li>
                        <li><strong className="text-info font-mono">Z₀</strong> — Initial stack symbol</li>
                        <li><strong className="text-info font-mono">F</strong> — Set of accept states</li>
                      </ul>
                    </>
                  )}

                  {section === 'algorithm' && (
                    <>
                      <p><strong className="text-foreground">CFG → PDA conversion</strong> uses a single-state PDA (here shown with q₀ → q₁ → q₂ for clarity):</p>
                      <ol className="space-y-1.5 pl-4 list-decimal">
                        <li>Push start symbol <span className="font-mono text-info">S</span> onto the stack with <span className="font-mono text-info">Z₀</span> as bottom marker.</li>
                        <li>For each production <span className="font-mono text-info">A → α</span>, add an ε-transition that <em>replaces</em> A on top of the stack with α (in reverse, so leftmost is on top).</li>
                        <li>For each terminal <span className="font-mono text-info">a ∈ Σ</span>, add a transition that <em>matches</em> input a with a on top of the stack and pops it.</li>
                        <li>When stack reaches <span className="font-mono text-info">Z₀</span> and input is consumed, transition to the accept state.</li>
                      </ol>
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border font-mono text-[10px] text-foreground space-y-1">
                        <div>δ(q₁, ε, A) = (q₁, αᴿ) <span className="text-muted-foreground">// expand</span></div>
                        <div>δ(q₁, a, a) = (q₁, ε) <span className="text-muted-foreground">// match</span></div>
                      </div>
                    </>
                  )}

                  {section === 'acceptance' && (
                    <>
                      <p>A PDA can accept strings in two equivalent ways:</p>
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border space-y-1.5">
                        <p><strong className="text-foreground">1. Final State:</strong> Input is fully consumed and the PDA is in some state q ∈ F.</p>
                      </div>
                      <div className="p-2.5 rounded-lg bg-muted/50 border border-border space-y-1.5">
                        <p><strong className="text-foreground">2. Empty Stack:</strong> Input is fully consumed and the stack is empty.</p>
                      </div>
                      <p className="text-[11px] italic">This simulator uses the <strong className="text-foreground not-italic">final state</strong> method, accepting when q₂ is reached with Z₀ remaining on the stack.</p>
                    </>
                  )}

                  {section === 'examples' && (
                    <>
                      <p>Common context-free languages and their grammars:</p>
                      <div className="space-y-2">
                        {[
                          { name: 'aⁿbⁿ', grammar: 'S → aSb | ε', desc: 'Equal a\'s then b\'s' },
                          { name: 'Balanced ()', grammar: 'S → (S) | SS | ε', desc: 'Matched parentheses' },
                          { name: 'Palindromes', grammar: 'S → aSa | bSb | a | b | ε', desc: 'Even/odd palindromes' },
                          { name: 'wwᴿ', grammar: 'S → aSa | bSb | ε', desc: 'String + reverse' },
                        ].map(ex => (
                          <div key={ex.name} className="p-2 rounded-md bg-muted/40 border border-border">
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-info text-[11px] font-bold">{ex.name}</span>
                              <span className="text-[10px] text-muted-foreground">{ex.desc}</span>
                            </div>
                            <code className="text-[10px] text-foreground font-mono">{ex.grammar}</code>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
