import { useState, useMemo } from "react";
import { Header } from "@/components/dashboard/Header";
import { LiveStationSelector } from "@/components/dashboard/LiveStationSelector";
import { AlertLegend } from "@/components/dashboard/AlertLegend";
import { LiveWaterLevelCard } from "@/components/dashboard/LiveWaterLevelCard";
import { LiveWaterLevelChart } from "@/components/dashboard/LiveWaterLevelChart";
import { LiveAlertFeed } from "@/components/dashboard/LiveAlertFeed";
import { LiveStatsOverview } from "@/components/dashboard/LiveStatsOverview";
import { useLiveWaterData, LiveRiverBasin, LiveStation } from "@/hooks/useLiveWaterData";
import { Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { data, isLoading, isError, refetch, dataUpdatedAt } = useLiveWaterData();
  
  const [selectedBasin, setSelectedBasin] = useState<LiveRiverBasin | null>(null);
  const [selectedStation, setSelectedStation] = useState<LiveStation | null>(null);
  const [alertFilter, setAlertFilter] = useState<string | null>(null);

  const displayStations = useMemo(() => {
    if (!data) return [];
    
    let stations = selectedBasin 
      ? selectedBasin.stations 
      : data.stations;
    
    if (alertFilter) {
      stations = stations.filter(s => s.status === alertFilter);
    }
    
    return stations;
  }, [data, selectedBasin, alertFilter]);

  const handleStationClick = (station: LiveStation) => {
    const basin = data?.basins.find(b => b.id === station.basinId);
    setSelectedBasin(basin || null);
    setSelectedStation(station);
  };

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <WifiOff className="w-16 h-16 text-destructive mx-auto" />
            <h2 className="text-xl font-display font-semibold text-foreground">
              Unable to Connect
            </h2>
            <p className="text-muted-foreground max-w-md">
              Could not fetch live data from the Irrigation Department servers. 
              Please check your connection and try again.
            </p>
            <Button onClick={() => refetch()} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" />
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Stats Overview */}
        <LiveStatsOverview stations={data?.stations || []} isLoading={isLoading} />
        
        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-2xl">
            <LiveStationSelector
              basins={data?.basins || []}
              selectedBasin={selectedBasin}
              selectedStation={selectedStation}
              onBasinChange={setSelectedBasin}
              onStationChange={setSelectedStation}
            />
          </div>
          <div className="flex items-center gap-4">
            <AlertLegend 
              activeFilter={alertFilter} 
              onFilterChange={setAlertFilter} 
            />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              disabled={isLoading}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
        
        {/* Loading State */}
        {isLoading && !data && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 text-primary mx-auto animate-spin" />
              <p className="text-muted-foreground">Loading live data from Irrigation Department...</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {data && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Chart and Cards Section */}
            <div className="xl:col-span-2 space-y-6">
              {/* Chart */}
              {selectedStation ? (
                <LiveWaterLevelChart station={selectedStation} />
              ) : displayStations.length > 0 ? (
                <LiveWaterLevelChart station={displayStations[0]} />
              ) : (
                <div className="glass rounded-xl p-8 flex items-center justify-center h-[350px]">
                  <p className="text-muted-foreground">Select a station to view water level data</p>
                </div>
              )}
              
              {/* Station Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayStations.map((station, index) => (
                  <div
                    key={station.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <LiveWaterLevelCard
                      station={station}
                      onClick={() => handleStationClick(station)}
                      isSelected={selectedStation?.id === station.id}
                    />
                  </div>
                ))}
              </div>

              {displayStations.length === 0 && !isLoading && (
                <div className="glass rounded-xl p-8 text-center">
                  <p className="text-muted-foreground">
                    No stations match the current filter criteria
                  </p>
                </div>
              )}
            </div>
            
            {/* Alert Feed Sidebar */}
            <div className="xl:col-span-1 h-[700px]">
              <LiveAlertFeed 
                stations={data.stations}
                onStationClick={handleStationClick}
                isLoading={isLoading}
                lastUpdated={dataUpdatedAt ? new Date(dataUpdatedAt) : undefined}
              />
            </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="glass-strong border-t border-border/30 px-6 py-4 mt-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>Live Data Source: Irrigation Department, Sri Lanka (ArcGIS Services)</p>
          <p>© 2025 Hydrology & Disaster Management Division</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
