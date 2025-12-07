import { Droplets, Radio } from "lucide-react";

export function Header() {
  return (
    <header className="glass-strong border-b border-border/30 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center glow-sm">
              <Droplets className="w-6 h-6 text-primary" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-pulse-slow" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Realtime Water Level Monitor
            </h1>
            <p className="text-sm text-muted-foreground">
              Major Rivers in Sri Lanka
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            <span>Hydrology & Disaster Management Division</span>
            <span className="text-border">|</span>
            <span>Irrigation Department</span>
          </div>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/30">
            <Radio className="w-3 h-3 text-success animate-pulse-slow" />
            <span className="text-xs font-medium text-success">LIVE</span>
          </div>
        </div>
      </div>
    </header>
  );
}
