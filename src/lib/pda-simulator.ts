/**
 * PDA Simulator
 * Uses BFS to explore all nondeterministic paths through the PDA.
 * Returns the first accepting path, or the longest rejecting path.
 */

import { PDA, PDATransition } from './cfg-to-pda';

export interface Snapshot {
  state: string;
  remainingInput: string;
  stack: string[];
  description: string;
  transitionUsed?: { from: string; to: string; label: string };
}

export interface SimulationResult {
  accepted: boolean;
  snapshots: Snapshot[];
}

interface Config {
  state: string;
  inputPos: number;
  stack: string[];
  snapshots: Snapshot[];
}

const MAX_STEPS = 5000;

export function simulatePDA(pda: PDA, input: string): SimulationResult {
  const inputChars = [...input];

  const initial: Config = {
    state: pda.startState,
    inputPos: 0,
    stack: [pda.initialStackSymbol],
    snapshots: [{
      state: pda.startState,
      remainingInput: input,
      stack: [pda.initialStackSymbol],
      description: `Start: state=${pda.startState}, stack=[${pda.initialStackSymbol}]`,
    }],
  };

  const queue: Config[] = [initial];
  let bestRejected: Config = initial;
  let totalSteps = 0;

  while (queue.length > 0 && totalSteps < MAX_STEPS) {
    const current = queue.shift()!;
    totalSteps++;

    // Check acceptance: in accept state and all input consumed
    if (pda.acceptStates.includes(current.state) && current.inputPos >= inputChars.length) {
      return { accepted: true, snapshots: current.snapshots };
    }

    // Track best rejected path (most input consumed)
    if (current.inputPos > bestRejected.inputPos ||
        (current.inputPos === bestRejected.inputPos && current.snapshots.length > bestRejected.snapshots.length)) {
      bestRejected = current;
    }

    // Find applicable transitions
    const topOfStack = current.stack.length > 0 ? current.stack[current.stack.length - 1] : null;
    const currentInputChar = current.inputPos < inputChars.length ? inputChars[current.inputPos] : null;

    for (const t of pda.transitions) {
      if (t.from !== current.state) continue;
      if (topOfStack === null || t.stackPop !== topOfStack) continue;

      // Check input match
      let newInputPos = current.inputPos;
      if (t.inputSymbol === 'ε') {
        // epsilon transition — don't consume input
      } else if (t.inputSymbol === currentInputChar) {
        newInputPos = current.inputPos + 1;
      } else {
        continue; // no match
      }

      // Apply transition: pop top, push new symbols
      const newStack = [...current.stack];
      newStack.pop(); // pop the matched stack top
      // Push in order: stackPush[0] goes first (bottom), last element on top
      for (const sym of t.stackPush) {
        newStack.push(sym);
      }

      const remaining = inputChars.slice(newInputPos).join('');
      const label = `${t.inputSymbol}, ${t.stackPop} → ${t.stackPush.length === 0 ? 'ε' : t.stackPush.join('')}`;

      const snapshot: Snapshot = {
        state: t.to,
        remainingInput: remaining,
        stack: [...newStack],
        description: `δ(${t.from}, ${t.inputSymbol}, ${t.stackPop}) = (${t.to}, ${t.stackPush.length === 0 ? 'ε' : t.stackPush.join('')})`,
        transitionUsed: { from: t.from, to: t.to, label },
      };

      // Limit path length to prevent infinite loops
      if (current.snapshots.length < 100) {
        queue.push({
          state: t.to,
          inputPos: newInputPos,
          stack: newStack,
          snapshots: [...current.snapshots, snapshot],
        });
      }
    }
  }

  // No accepting path found
  const rejectSnapshot: Snapshot = {
    state: bestRejected.state,
    remainingInput: inputChars.slice(bestRejected.inputPos).join(''),
    stack: [...bestRejected.stack],
    description: 'No accepting path found — string rejected',
  };

  return {
    accepted: false,
    snapshots: [...bestRejected.snapshots, rejectSnapshot],
  };
}
