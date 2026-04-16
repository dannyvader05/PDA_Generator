import { useMemo } from 'react';
import { PDA } from '@/lib/cfg-to-pda';

interface Props {
  pda: PDA;
  highlightState?: string | null;
  highlightTransition?: { from: string; to: string } | null;
}

interface NodePos {
  x: number;
  y: number;
}

export default function PDAGraph({ pda, highlightState, highlightTransition }: Props) {
  const layout = useMemo(() => {
    const positions: Record<string, NodePos> = {
      'q_start': { x: 100, y: 150 },
      'q_loop': { x: 320, y: 150 },
      'q_accept': { x: 540, y: 150 },
    };
    return positions;
  }, []);

  // Group transitions by (from, to) for label stacking
  const groupedTransitions = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const t of pda.transitions) {
      const key = `${t.from}→${t.to}`;
      const label = `${t.inputSymbol}, ${t.stackPop} / ${t.stackPush.length === 0 ? 'ε' : t.stackPush.join('')}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(label);
    }
    return groups;
  }, [pda.transitions]);

  const isHighlightedEdge = (from: string, to: string) =>
    highlightTransition?.from === from && highlightTransition?.to === to;

  return (
    <svg viewBox="0 0 640 300" className="w-full h-auto" style={{ minHeight: 200 }}>
      <defs>
        <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" className="fill-muted-foreground" />
        </marker>
        <marker id="arrowhead-active" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
          <polygon points="0 0, 8 3, 0 6" className="fill-info" />
        </marker>
      </defs>

      {/* Edges */}
      {Array.from(groupedTransitions.entries()).map(([key, labels]) => {
        const [from, to] = key.split('→');
        const fromPos = layout[from];
        const toPos = layout[to];
        if (!fromPos || !toPos) return null;
        const active = isHighlightedEdge(from, to);

        // Self-loop
        if (from === to) {
          const cx = fromPos.x;
          const cy = fromPos.y - 30;
          return (
            <g key={key}>
              <path
                d={`M ${cx - 18} ${cy - 4} C ${cx - 30} ${cy - 60}, ${cx + 30} ${cy - 60}, ${cx + 18} ${cy - 4}`}
                fill="none"
                className={active ? 'stroke-info' : 'stroke-muted-foreground/50'}
                strokeWidth={active ? 2 : 1.5}
                markerEnd={active ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              />
              {labels.map((label, i) => (
                <text
                  key={i}
                  x={cx}
                  y={cy - 58 - i * 14}
                  textAnchor="middle"
                  className={`text-[9px] font-mono ${active ? 'fill-info' : 'fill-muted-foreground'}`}
                >
                  {label}
                </text>
              ))}
            </g>
          );
        }

        // Straight edge
        const dx = toPos.x - fromPos.x;
        const dy = toPos.y - fromPos.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / len;
        const ny = dy / len;
        const startX = fromPos.x + nx * 28;
        const startY = fromPos.y + ny * 28;
        const endX = toPos.x - nx * 28;
        const endY = toPos.y - ny * 28;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2 - 10;

        return (
          <g key={key}>
            <line
              x1={startX} y1={startY} x2={endX} y2={endY}
              className={active ? 'stroke-info' : 'stroke-muted-foreground/50'}
              strokeWidth={active ? 2 : 1.5}
              markerEnd={active ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
            />
            {labels.map((label, i) => (
              <text
                key={i}
                x={midX}
                y={midY - i * 13}
                textAnchor="middle"
                className={`text-[9px] font-mono ${active ? 'fill-info' : 'fill-muted-foreground'}`}
              >
                {label}
              </text>
            ))}
          </g>
        );
      })}

      {/* Entry arrow for start state */}
      <line
        x1={30} y1={150} x2={70} y2={150}
        className="stroke-muted-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#arrowhead)"
      />

      {/* Nodes */}
      {pda.states.map(state => {
        const pos = layout[state];
        if (!pos) return null;
        const isAccept = pda.acceptStates.includes(state);
        const isStart = state === pda.startState;
        const isActive = highlightState === state;

        return (
          <g key={state}>
            {/* Glow for active state */}
            {isActive && (
              <circle cx={pos.x} cy={pos.y} r={32}
                className="fill-info/20"
              />
            )}
            {/* Outer ring for accept states */}
            {isAccept && (
              <circle cx={pos.x} cy={pos.y} r={28}
                className="fill-none stroke-primary"
                strokeWidth={2.5}
              />
            )}
            {/* Main circle */}
            <circle
              cx={pos.x} cy={pos.y} r={24}
              className={`
                ${isActive ? 'fill-info/20 stroke-info' : isStart ? 'fill-info/10 stroke-info' : 'fill-card stroke-border'}
              `}
              strokeWidth={isActive ? 2.5 : 2}
            />
            {/* Label */}
            <text
              x={pos.x} y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-[11px] font-mono font-bold ${isActive ? 'fill-info' : 'fill-foreground'}`}
            >
              {state.replace('q_', 'q₀').replace('q₀loop', 'q₁').replace('q₀accept', 'q₂').replace('q₀start', 'q₀')}
            </text>
            {/* State name below */}
            <text
              x={pos.x} y={pos.y + 42}
              textAnchor="middle"
              className="text-[9px] fill-muted-foreground font-mono"
            >
              {state}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
