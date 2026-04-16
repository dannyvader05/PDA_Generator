import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { parseCFG, cfgToString } from '@/lib/cfg-parser';
import { convertCFGtoPDA, PDA, ConversionStep } from '@/lib/cfg-to-pda';
import { simulatePDA, SimulationResult } from '@/lib/pda-simulator';
import PDAGraph from '@/components/PDAGraph';
import ConversionSteps from '@/components/ConversionSteps';
import SimulationView from '@/components/SimulationView';
import TheorySection from '@/components/TheorySection';
import TransitionTable from '@/components/TransitionTable';

const EXAMPLE_CFGS = [
  { name: 'aⁿbⁿ', value: 'S -> aSb | ε' },
  { name: 'Balanced Parens', value: 'S -> (S) | SS | ε' },
  { name: 'Palindrome', value: 'S -> aSa | bSb | a | b | ε' },
  { name: 'Expr', value: 'S -> SA | A\nA -> a | b' },
];

type Tab = 'convert' | 'simulate';

export default function Index() {
  const [dark, setDark] = useDarkMode();
  const [cfgInput, setCfgInput] = useState(EXAMPLE_CFGS[0].value);
  const [pda, setPda] = useState<PDA | null>(null);
  const [steps, setSteps] = useState<ConversionStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('convert');

  const [simInput, setSimInput] = useState('');
  const [simResult, setSimResult] = useState<SimulationResult | null>(null);
  const [simStep, setSimStep] = useState(0);

  const handleConvert = useCallback(() => {
    try {
      setError('');
      const cfg = parseCFG(cfgInput);
      if (cfg.productions.length === 0) {
        setError('No valid productions found. Use format: S -> aSb | ε');
        return;
      }
      const result = convertCFGtoPDA(cfg);
      setPda(result.pda);
      setSteps(result.steps);
      setCurrentStep(0);
      setSimResult(null);
      setSimStep(0);
    } catch {
      setError('Parse error. Use format: S -> aSb | ε');
    }
  }, [cfgInput]);

  const handleSimulate = useCallback(() => {
    if (!pda) return;
    const result = simulatePDA(pda, simInput);
    setSimResult(result);
    setSimStep(0);
  }, [pda, simInput]);

  const currentHighlight = steps[currentStep]?.transition;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border backdrop-blur-sm bg-background/80 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
              <span className="text-primary font-mono font-bold text-sm">δ</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground font-mono tracking-tight">
                CFG → PDA
              </h1>
              <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                Context-Free Grammar to Pushdown Automaton
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 p-0.5 rounded-lg bg-muted/60 border border-border">
              {(['convert', 'simulate'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all capitalize ${
                    tab === t
                      ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/25'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={() => setDark(d => !d)}
              className="w-8 h-8 rounded-lg bg-muted/60 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel */}
          <div className="lg:col-span-4 space-y-4">
            {/* CFG Input */}
            <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
              <label className="block text-[11px] font-semibold text-muted-foreground mb-2.5 uppercase tracking-widest">
                Grammar Input
              </label>
              <textarea
                value={cfgInput}
                onChange={e => setCfgInput(e.target.value)}
                className="w-full h-28 bg-background border border-border rounded-lg p-3 font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 placeholder:text-muted-foreground/40 transition-all"
                placeholder="S -> aSb | ε"
                spellCheck={false}
              />
              <div className="flex flex-wrap gap-1.5 mt-3">
                {EXAMPLE_CFGS.map(ex => (
                  <button
                    key={ex.name}
                    onClick={() => setCfgInput(ex.value)}
                    className="px-2.5 py-1 text-[10px] font-medium rounded-md bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
              <button
                onClick={handleConvert}
                className="mt-4 w-full py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-sm shadow-primary/20 active:scale-[0.98]"
              >
                Convert to PDA
              </button>
              {error && (
                <p className="mt-2 text-xs text-destructive font-medium">{error}</p>
              )}
            </div>

            {/* Parsed CFG */}
            {pda && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl bg-card border border-border shadow-sm"
              >
                <div className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-widest">
                  Parsed Grammar
                </div>
                <pre className="font-mono text-xs text-secondary-foreground whitespace-pre-wrap leading-relaxed">
                  {cfgToString(parseCFG(cfgInput))}
                </pre>
              </motion.div>
            )}

            {/* PDA Components */}
            {pda && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-4 rounded-xl bg-card border border-border shadow-sm font-mono text-xs space-y-1.5"
              >
                <div className="text-[11px] font-semibold text-muted-foreground mb-2 uppercase tracking-widest font-sans">
                  PDA Components
                </div>
                <div><span className="text-info font-bold">Q</span> = {'{'}{pda.states.join(', ')}{'}'}</div>
                <div><span className="text-info font-bold">Σ</span> = {'{'}{[...pda.inputAlphabet].join(', ')}{'}'}</div>
                <div><span className="text-info font-bold">Γ</span> = {'{'}{[...pda.stackAlphabet].join(', ')}{'}'}</div>
                <div><span className="text-info font-bold">q₀</span> = {pda.startState}</div>
                <div><span className="text-info font-bold">Z₀</span> = {pda.initialStackSymbol}</div>
                <div><span className="text-info font-bold">F</span> = {'{'}{pda.acceptStates.join(', ')}{'}'}</div>
              </motion.div>
            )}

            <TheorySection />
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-8 space-y-4">
            {!pda ? (
              <div className="flex flex-col items-center justify-center h-72 rounded-xl border border-dashed border-border/60 text-muted-foreground bg-muted/10">
                <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                  <span className="text-2xl">⚙</span>
                </div>
                <p className="text-sm">Enter a grammar and convert to see the PDA</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                {tab === 'convert' ? (
                  <motion.div
                    key="convert"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* PDA Graph */}
                    <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                          State Diagram
                        </span>
                        <div className="flex gap-4 text-[10px] text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-info bg-info/10 inline-block" /> Start
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full border-[3px] border-primary bg-primary/10 inline-block" /> Accept
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-3.5 h-3.5 rounded-full bg-[#164e63] border-2 border-info inline-block shadow-[0_0_6px_rgba(34,211,238,0.4)]" /> Active
                          </span>
                        </div>
                      </div>
                      <PDAGraph
                        pda={pda}
                        highlightState={currentHighlight?.to}
                        highlightTransition={currentHighlight ? { from: currentHighlight.from, to: currentHighlight.to } : null}
                      />
                    </div>

                    {/* Conversion Steps */}
                    <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                          Conversion Steps
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                            disabled={currentStep === 0}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted border border-border text-foreground disabled:opacity-25 hover:bg-secondary transition-colors active:scale-95"
                          >
                            ← Prev
                          </button>
                          <span className="text-xs text-muted-foreground font-mono min-w-[40px] text-center">
                            {currentStep + 1}/{steps.length}
                          </span>
                          <button
                            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                            disabled={currentStep >= steps.length - 1}
                            className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted border border-border text-foreground disabled:opacity-25 hover:bg-secondary transition-colors active:scale-95"
                          >
                            Next →
                          </button>
                        </div>
                      </div>
                      <ConversionSteps steps={steps} currentStep={currentStep} />
                    </div>

                    {/* Transition Table */}
                    <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                          Transition Table — δ(q, a, X)
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {pda.transitions.length} transitions
                        </span>
                      </div>
                      <TransitionTable
                        pda={pda}
                        highlightTransition={currentHighlight ? { from: currentHighlight.from, to: currentHighlight.to } : null}
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="simulate"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-4"
                  >
                    {/* Simulation input */}
                    <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
                      <label className="block text-[11px] font-semibold text-muted-foreground mb-2.5 uppercase tracking-widest">
                        Input String
                      </label>
                      <div className="flex gap-2">
                        <input
                          value={simInput}
                          onChange={e => setSimInput(e.target.value)}
                          className="flex-1 bg-background border border-border rounded-lg px-3 py-2.5 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all"
                          placeholder="e.g., aabb"
                          spellCheck={false}
                        />
                        <button
                          onClick={handleSimulate}
                          className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all shadow-sm shadow-primary/20 active:scale-[0.98]"
                        >
                          Run
                        </button>
                      </div>
                    </div>

                    {/* PDA Graph during simulation */}
                    <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest block mb-4">
                        State Diagram
                      </span>
                      <PDAGraph
                        pda={pda}
                        highlightState={simResult?.snapshots[Math.min(simStep, simResult.snapshots.length - 1)]?.state}
                        highlightTransition={
                          simResult?.snapshots[Math.min(simStep, simResult.snapshots.length - 1)]?.transitionUsed
                            ? {
                                from: simResult.snapshots[Math.min(simStep, simResult.snapshots.length - 1)].transitionUsed!.from,
                                to: simResult.snapshots[Math.min(simStep, simResult.snapshots.length - 1)].transitionUsed!.to,
                              }
                            : null
                        }
                      />
                    </div>

                    {/* Simulation result */}
                    {simResult && (
                      <div className="p-5 rounded-xl bg-card border border-border shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Simulation Trace
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSimStep(Math.max(0, simStep - 1))}
                              disabled={simStep === 0}
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted border border-border text-foreground disabled:opacity-25 hover:bg-secondary transition-colors active:scale-95"
                            >
                              ← Prev
                            </button>
                            <span className="text-xs text-muted-foreground font-mono min-w-[40px] text-center">
                              {simStep + 1}/{simResult.snapshots.length}
                            </span>
                            <button
                              onClick={() => setSimStep(Math.min(simResult.snapshots.length - 1, simStep + 1))}
                              disabled={simStep >= simResult.snapshots.length - 1}
                              className="px-3 py-1.5 text-xs font-medium rounded-md bg-muted border border-border text-foreground disabled:opacity-25 hover:bg-secondary transition-colors active:scale-95"
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                        <SimulationView
                          snapshots={simResult.snapshots}
                          currentStep={simStep}
                          accepted={simResult.accepted}
                        />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
