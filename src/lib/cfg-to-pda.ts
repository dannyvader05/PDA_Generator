/**
 * CFG to PDA Conversion
 * Uses the standard construction: 3-state PDA (q_start, q_loop, q_accept)
 * 
 * Algorithm:
 * 1. Push Z₀ then S onto stack from q_start → q_loop
 * 2. For each production A → α: add transition δ(q_loop, ε, A) = (q_loop, αᴿ)
 * 3. For each terminal a: add transition δ(q_loop, a, a) = (q_loop, ε)
 * 4. Accept: δ(q_loop, ε, Z₀) = (q_accept, ε)
 */

import { CFG } from './cfg-parser';

export interface PDATransition {
  from: string;
  to: string;
  inputSymbol: string;   // ε for epsilon
  stackPop: string;      // symbol to pop
  stackPush: string[];   // symbols to push (first = bottom)
}

export interface PDA {
  states: string[];
  inputAlphabet: Set<string>;
  stackAlphabet: Set<string>;
  transitions: PDATransition[];
  startState: string;
  initialStackSymbol: string;
  acceptStates: string[];
}

export interface ConversionStep {
  description: string;
  detail: string;
  transition?: PDATransition;
  ruleType: 'init' | 'production' | 'terminal' | 'accept';
}

export interface ConversionResult {
  pda: PDA;
  steps: ConversionStep[];
}

export function convertCFGtoPDA(cfg: CFG): ConversionResult {
  const states = ['q_start', 'q_loop', 'q_accept'];
  const transitions: PDATransition[] = [];
  const steps: ConversionStep[] = [];
  const stackAlphabet = new Set<string>();

  stackAlphabet.add('Z₀');
  for (const v of cfg.variables) stackAlphabet.add(v);
  for (const t of cfg.terminals) stackAlphabet.add(t);

  // Step 1: Initial transition — push Z₀ then start symbol
  const initTransition: PDATransition = {
    from: 'q_start',
    to: 'q_loop',
    inputSymbol: 'ε',
    stackPop: 'Z₀',
    stackPush: ['Z₀', cfg.startSymbol], // push Z₀ first, then S on top
  };
  transitions.push(initTransition);
  steps.push({
    description: 'Initialize PDA',
    detail: `Push start symbol ${cfg.startSymbol} onto stack: δ(q_start, ε, Z₀) = (q_loop, Z₀${cfg.startSymbol})`,
    transition: initTransition,
    ruleType: 'init',
  });

  // Step 2: For each production A → α, add δ(q_loop, ε, A) = (q_loop, αᴿ)
  for (const prod of cfg.productions) {
    const bodyStr = prod.body.length === 0 ? 'ε' : prod.body.join('');
    const pushSymbols = [...prod.body].reverse(); // push in reverse so first symbol is on top

    const t: PDATransition = {
      from: 'q_loop',
      to: 'q_loop',
      inputSymbol: 'ε',
      stackPop: prod.head,
      stackPush: pushSymbols,
    };
    transitions.push(t);

    steps.push({
      description: `Production: ${prod.head} → ${bodyStr}`,
      detail: `δ(q_loop, ε, ${prod.head}) = (q_loop, ${pushSymbols.length === 0 ? 'ε' : pushSymbols.join('')})`,
      transition: t,
      ruleType: 'production',
    });
  }

  // Step 3: For each terminal a, add δ(q_loop, a, a) = (q_loop, ε)
  for (const terminal of cfg.terminals) {
    const t: PDATransition = {
      from: 'q_loop',
      to: 'q_loop',
      inputSymbol: terminal,
      stackPop: terminal,
      stackPush: [],
    };
    transitions.push(t);

    steps.push({
      description: `Terminal match: ${terminal}`,
      detail: `δ(q_loop, ${terminal}, ${terminal}) = (q_loop, ε) — match and pop`,
      transition: t,
      ruleType: 'terminal',
    });
  }

  // Step 4: Accept transition
  const acceptTransition: PDATransition = {
    from: 'q_loop',
    to: 'q_accept',
    inputSymbol: 'ε',
    stackPop: 'Z₀',
    stackPush: [],
  };
  transitions.push(acceptTransition);
  steps.push({
    description: 'Accept on empty stack',
    detail: `δ(q_loop, ε, Z₀) = (q_accept, ε) — accept when stack is empty`,
    transition: acceptTransition,
    ruleType: 'accept',
  });

  const pda: PDA = {
    states,
    inputAlphabet: new Set(cfg.terminals),
    stackAlphabet,
    transitions,
    startState: 'q_start',
    initialStackSymbol: 'Z₀',
    acceptStates: ['q_accept'],
  };

  return { pda, steps };
}
