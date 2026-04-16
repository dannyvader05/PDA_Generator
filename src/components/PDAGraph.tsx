import { useMemo } from 'react';
import { motion } from 'framer-motion';
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

const stateDisplayName = (state: string) => {
  if (state === 'q_start') return 'q₀';
  if (state === 'q_loop') return 'q₁';
  if (state === 'q_accept') return 'q₂';
  return state;
};

export default function PDAGraph({ pda, highlightState, highlightTransition }: Props) {
  const layout = useMemo<Record<string, NodePos>>(() => ({
    'q_start': { x: 100, y: 150 },
    'q_loop': { x: 320, y: 150 },
    'q_accept': { x: 540, y: 150 },
  }), []);

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
          <polygon points="0 0, 8 3, 0 6" fill="hsl(var(--info))" />
        </marker>
        {/* Glow filter for active elements */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="edgeGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Edges */}
      {Array.from(groupedTransitions.entries()).map(([key, labels]) => {
        const [from, to] = key.split('→');
        const fromPos = layout[from];
        const toPos = layout[to];
        if (!fromPos || !toPos) return null;
        const active = isHighlightedEdge(from, to);

        if (from === to) {
          const cx = fromPos.x;
          const cy = fromPos.y - 30;
          return (
            <g key={key} filter={active ? 'url(#edgeGlow)' : undefined}>
              <motion.path
                d={`M ${cx - 18} ${cy - 4} C ${cx - 30} ${cy - 60}, ${cx + 30} ${cy - 60}, ${cx + 18} ${cy - 4}`}
                fill="none"
                stroke={active ? 'hsl(var(--info))' : 'hsl(var(--muted-foreground) / 0.35)'}
                strokeWidth={active ? 2.5 : 1.5}
                markerEnd={active ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
                animate={{ strokeWidth: active ? [2, 3, 2] : 1.5 }}
                transition={active ? { duration: 1.2, repeat: Infinity } : {}}
              />
              {labels.map((label, i) => (
                <motion.text
                  key={i}
                  x={cx}
                  y={cy - 58 - i * 14}
                  textAnchor="middle"
                  className="text-[9px] font-mono"
                  fill={active ? 'hsl(var(--info))' : 'hsl(var(--muted-foreground))'}
                  animate={active ? { opacity: [0.7, 1, 0.7] } : {}}
                  transition={active ? { duration: 1.5, repeat: Infinity } : {}}
                >
                  {label}
                </motion.text>
              ))}
            </g>
          );
        }

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
          <g key={key} filter={active ? 'url(#edgeGlow)' : undefined}>
            <motion.line
              x1={startX} y1={startY} x2={endX} y2={endY}
              stroke={active ? 'hsl(var(--info))' : 'hsl(var(--muted-foreground) / 0.35)'}
              strokeWidth={active ? 2.5 : 1.5}
              markerEnd={active ? 'url(#arrowhead-active)' : 'url(#arrowhead)'}
              animate={{ strokeWidth: active ? [2, 3, 2] : 1.5 }}
              transition={active ? { duration: 1.2, repeat: Infinity } : {}}
            />
            {labels.map((label, i) => (
              <motion.text
                key={i}
                x={midX}
                y={midY - i * 13}
                textAnchor="middle"
                className="text-[9px] font-mono"
                fill={active ? 'hsl(var(--info))' : 'hsl(var(--muted-foreground))'}
                animate={active ? { opacity: [0.7, 1, 0.7] } : {}}
                transition={active ? { duration: 1.5, repeat: Infinity } : {}}
              >
                {label}
              </motion.text>
            ))}
          </g>
        );
      })}

      {/* Entry arrow */}
      <line
        x1={30} y1={150} x2={70} y2={150}
        className="stroke-muted-foreground/50"
        strokeWidth={1.5}
        markerEnd="url(#arrowhead)"
      />
      <text x={50} y={140} textAnchor="middle" className="text-[9px] fill-muted-foreground font-mono">start</text>

      {/* Nodes */}
      {pda.states.map(state => {
        const pos = layout[state];
        if (!pos) return null;
        const isAccept = pda.acceptStates.includes(state);
        const isActive = highlightState === state;

        return (
          <g key={state}>
            {/* Animated glow ring for active state */}
            {isActive && (
              <motion.circle
                cx={pos.x} cy={pos.y} r={34}
                fill="none"
                stroke="hsl(var(--info))"
                strokeWidth={2}
                filter="url(#glow)"
                initial={{ r: 28, opacity: 0 }}
                animate={{ r: [32, 38, 32], opacity: [0.6, 0.2, 0.6] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
            {/* Accept double ring */}
            {isAccept && (
              <circle cx={pos.x} cy={pos.y} r={28}
                className="fill-none stroke-primary"
                strokeWidth={2.5}
              />
            )}
            {/* Main circle */}
            <motion.circle
              cx={pos.x} cy={pos.y} r={24}
              fill={isActive ? 'hsl(var(--info) / 0.15)' : 'hsl(var(--card))'}
              stroke={isActive ? 'hsl(var(--info))' : 'hsl(var(--border))'}
              strokeWidth={isActive ? 2.5 : 2}
              animate={isActive ? { scale: [1, 1.06, 1] } : { scale: 1 }}
              transition={isActive ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' } : {}}
              style={{ transformOrigin: `${pos.x}px ${pos.y}px` }}
            />
            {/* Label */}
            <text
              x={pos.x} y={pos.y + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              className={`text-[11px] font-mono font-bold ${isActive ? 'fill-info' : 'fill-foreground'}`}
            >
              {stateDisplayName(state)}
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
