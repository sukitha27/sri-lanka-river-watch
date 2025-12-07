import { cn } from "@/lib/utils";

interface AlertLegendProps {
  activeFilter: string | null;
  onFilterChange: (filter: string | null) => void;
}

const alertLevels = [
  { id: 'normal', label: 'Normal', color: 'bg-success', textColor: 'text-success' },
  { id: 'alert', label: 'Alert', color: 'bg-alert', textColor: 'text-alert' },
  { id: 'minor', label: 'Minor Flood', color: 'bg-minor', textColor: 'text-minor' },
  { id: 'major', label: 'Major Flood', color: 'bg-major', textColor: 'text-major' },
];

export function AlertLegend({ activeFilter, onFilterChange }: AlertLegendProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {alertLevels.map(level => (
        <button
          key={level.id}
          onClick={() => onFilterChange(activeFilter === level.id ? null : level.id)}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200",
            activeFilter === level.id
              ? `${level.color} ${level.id === 'normal' ? 'text-success-foreground' : 'text-warning-foreground'} shadow-lg`
              : `bg-secondary/50 ${level.textColor} hover:bg-secondary`
          )}
        >
          <span className={cn("w-2 h-2 rounded-full", level.color, activeFilter !== level.id && "opacity-70")} />
          {level.label}
        </button>
      ))}
    </div>
  );
}
