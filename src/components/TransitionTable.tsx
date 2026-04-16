import { PDA } from '@/lib/cfg-to-pda';

interface Props {
  pda: PDA;
  highlightTransition?: { from: string; to: string } | null;
}

export default function TransitionTable({ pda, highlightTransition }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs font-mono">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="text-left py-2 px-2 font-semibold">State</th>
            <th className="text-left py-2 px-2 font-semibold">Input</th>
            <th className="text-left py-2 px-2 font-semibold">Stack Pop</th>
            <th className="text-left py-2 px-2 font-semibold">→ State</th>
            <th className="text-left py-2 px-2 font-semibold">Stack Push</th>
          </tr>
        </thead>
        <tbody>
          {pda.transitions.map((t, i) => {
            const isActive = highlightTransition?.from === t.from && highlightTransition?.to === t.to;
            return (
              <tr
                key={i}
                className={`border-b border-border/50 transition-colors ${
                  isActive ? 'bg-primary/10' : 'hover:bg-muted/30'
                }`}
              >
                <td className={`py-1.5 px-2 ${isActive ? 'text-primary font-bold' : 'text-foreground'}`}>
                  {t.from}
                </td>
                <td className={`py-1.5 px-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t.inputSymbol}
                </td>
                <td className={`py-1.5 px-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t.stackPop}
                </td>
                <td className={`py-1.5 px-2 ${isActive ? 'text-primary font-bold' : 'text-foreground'}`}>
                  {t.to}
                </td>
                <td className={`py-1.5 px-2 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                  {t.stackPush.length === 0 ? 'ε' : t.stackPush.join('')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
