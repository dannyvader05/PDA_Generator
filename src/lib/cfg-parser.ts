/**
 * CFG Parser
 * Parses context-free grammar input in the form: S -> aSb | ε
 */

export interface Production {
  head: string;
  body: string[]; // array of symbols (terminals/nonterminals), empty array = epsilon
}

export interface CFG {
  variables: Set<string>;
  terminals: Set<string>;
  productions: Production[];
  startSymbol: string;
}

/**
 * Parse a CFG from text input.
 * Supports formats:
 *   S -> aSb | ε
 *   S -> aSb | epsilon
 *   S → aSb | ε
 * Multiple lines for different nonterminals.
 */
export function parseCFG(input: string): CFG {
  const lines = input.split('\n').map(l => l.trim()).filter(Boolean);
  const productions: Production[] = [];
  const variables = new Set<string>();
  let startSymbol = '';

  for (const line of lines) {
    // Split on -> or →
    const parts = line.split(/\s*(?:->|→)\s*/);
    if (parts.length < 2) continue;

    const head = parts[0].trim();
    if (!head) continue;

    variables.add(head);
    if (!startSymbol) startSymbol = head;

    // Split RHS on |
    const alternatives = parts[1].split('|').map(a => a.trim());

    for (const alt of alternatives) {
      if (!alt) continue;
      if (alt === 'ε' || alt === 'epsilon' || alt === 'e' || alt === 'ϵ') {
        productions.push({ head, body: [] });
      } else {
        // Parse symbols: uppercase letters are nonterminals, rest are terminals
        const symbols = parseSymbols(alt);
        productions.push({ head, body: symbols });
      }
    }
  }

  // Determine terminals
  const terminals = new Set<string>();
  for (const prod of productions) {
    for (const sym of prod.body) {
      if (!variables.has(sym)) {
        terminals.add(sym);
      }
    }
  }

  return { variables, terminals, productions, startSymbol };
}

/**
 * Parse a string of symbols. Uppercase single letters = nonterminals.
 * Everything else (lowercase letters, digits, parens) = terminals.
 */
function parseSymbols(s: string): string[] {
  const symbols: string[] = [];
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (ch === ' ') continue; // skip spaces
    symbols.push(ch);
  }
  return symbols;
}

/**
 * Convert a CFG back to a readable string.
 */
export function cfgToString(cfg: CFG): string {
  const grouped = new Map<string, string[][]>();
  for (const prod of cfg.productions) {
    if (!grouped.has(prod.head)) grouped.set(prod.head, []);
    grouped.get(prod.head)!.push(prod.body);
  }

  const lines: string[] = [];
  for (const [head, bodies] of grouped) {
    const alts = bodies.map(b => b.length === 0 ? 'ε' : b.join('')).join(' | ');
    lines.push(`${head} → ${alts}`);
  }
  return lines.join('\n');
}
