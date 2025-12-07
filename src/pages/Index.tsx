import { useState } from "react";
import { Header } from "@/components/dashboard/Header";
import { StationSelector } from "@/components/dashboard/StationSelector";
import { AlertLegend } from "@/components/dashboard/AlertLegend";
import { WaterLevelCard } from "@/components/dashboard/WaterLevelCard";
import { WaterLevelChart } from "@/components/dashboard/WaterLevelChart";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { riverBasins, RiverBasin, HydrometricStation, getAllStations } from "@/data/riverData";

const Index = () => {
  const [selectedBasin, setSelectedBasin] = useState<RiverBasin | null>(null);
  const [selectedStation, setSelectedStation] = useState<HydrometricStation | null>(null);
  const [alertFilter, setAlertFilter] = useState<string | null>(null);

  const getDisplayStations = () => {
    let stations = selectedBasin 
      ? selectedBasin.stations 
      : getAllStations();
    
    if (alertFilter) {
      stations = stations.filter(s => s.status === alertFilter);
    }
    
    return stations;
  };

  const displayStations = getDisplayStations();
  const alertStations = getAllStations().filter(s => s.status !== 'normal');

  const handleStationClick = (station: HydrometricStation) => {
    const basin = riverBasins.find(b => b.id === station.basinId);
    setSelectedBasin(basin || null);
    setSelectedStation(station);
  };

  const getBasinName = (station: HydrometricStation) => {
    return riverBasins.find(b => b.id === station.basinId)?.name || '';
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 p-4 lg:p-6 space-y-6">
        {/* Stats Overview */}
        <StatsOverview />
        
        {/* Controls Row */}
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="w-full lg:w-auto lg:flex-1 lg:max-w-2xl">
            <StationSelector
              selectedBasin={selectedBasin}
              selectedStation={selectedStation}
              onBasinChange={setSelectedBasin}
              onStationChange={setSelectedStation}
            />
          </div>
          <AlertLegend 
            activeFilter={alertFilter} 
            onFilterChange={setAlertFilter} 
          />
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Chart and Cards Section */}
          <div className="xl:col-span-2 space-y-6">
            {/* Chart */}
            {selectedStation ? (
              <WaterLevelChart station={selectedStation} />
            ) : displayStations.length > 0 ? (
              <WaterLevelChart station={displayStations[0]} />
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
                  <WaterLevelCard
                    station={station}
                    basinName={getBasinName(station)}
                    onClick={() => handleStationClick(station)}
                    isSelected={selectedStation?.id === station.id}
                  />
                </div>
              ))}
            </div>
          </div>
          
          {/* Alert Feed Sidebar */}
          <div className="xl:col-span-1 h-[600px]">
            <AlertFeed 
              stations={alertStations.length > 0 ? alertStations : getAllStations()} 
              onStationClick={handleStationClick}
            />
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="glass-strong border-t border-border/30 px-6 py-4 mt-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>Data Source: Irrigation Department, Sri Lanka</p>
          <p>© 2025 Hydrology & Disaster Management Division</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
