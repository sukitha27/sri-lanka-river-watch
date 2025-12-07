import { getAllStations } from "@/data/riverData";
import { Activity, AlertTriangle, Gauge, Waves } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatsOverview() {
  const allStations = getAllStations();
  
  const stats = {
    total: allStations.length,
    normal: allStations.filter(s => s.status === 'normal').length,
    alert: allStations.filter(s => s.status === 'alert').length,
    minor: allStations.filter(s => s.status === 'minor').length,
    major: allStations.filter(s => s.status === 'major').length,
  };

  const avgLevel = allStations.reduce((sum, s) => sum + s.currentLevel, 0) / allStations.length;

  const statCards = [
    {
      label: 'Total Stations',
      value: stats.total,
      icon: Waves,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Active Alerts',
      value: stats.alert + stats.minor + stats.major,
      icon: AlertTriangle,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Normal Status',
      value: stats.normal,
      icon: Activity,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'Avg. Level',
      value: `${avgLevel.toFixed(2)}m`,
      icon: Gauge,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <div
          key={stat.label}
          className="glass rounded-xl p-4 animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {stat.label}
              </p>
              <p className={cn("text-2xl font-display font-bold mt-1", stat.color)}>
                {stat.value}
              </p>
            </div>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", stat.bg)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
