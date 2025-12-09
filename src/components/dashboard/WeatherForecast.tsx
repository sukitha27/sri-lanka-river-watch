import { useWeatherForecast } from "@/hooks/useWeatherForecast";
import { getWeatherIcon, getWeatherDescription } from "@/services/weatherApi";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { CloudRain, Droplets, Thermometer, Calendar, Clock } from "lucide-react";
import { format, parseISO, isToday, isTomorrow } from "date-fns";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface WeatherForecastProps {
  latitude?: number;
  longitude?: number;
  stationName?: string;
}

export function WeatherForecast({ latitude, longitude, stationName }: WeatherForecastProps) {
  const { data, isLoading, isError } = useWeatherForecast(latitude, longitude);

  if (isLoading) {
    return (
      <Card className="glass p-4 h-full">
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="glass p-4 h-full flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <CloudRain className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>Unable to load weather data</p>
        </div>
      </Card>
    );
  }

  // Get next 24 hours of hourly data
  const now = new Date();
  const next24Hours = data.hourly.filter(h => {
    const hourTime = parseISO(h.time);
    return hourTime >= now && hourTime <= new Date(now.getTime() + 24 * 60 * 60 * 1000);
  }).slice(0, 24);

  // Prepare chart data for hourly precipitation
  const hourlyChartData = next24Hours.map(h => ({
    time: format(parseISO(h.time), 'HH:mm'),
    precipitation: h.precipitation,
    probability: h.precipitationProbability,
    temperature: h.temperature,
  }));

  // Prepare daily chart data
  const dailyChartData = data.daily.map(d => ({
    date: format(parseISO(d.date), 'EEE'),
    fullDate: d.date,
    precipitation: d.precipitationSum,
    probability: d.precipitationProbabilityMax,
    tempMax: d.temperatureMax,
    tempMin: d.temperatureMin,
    weatherCode: d.weatherCode,
  }));

  // Current conditions (first hourly reading)
  const current = data.hourly[0];

  return (
    <Card className="glass p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <CloudRain className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Rainfall Forecast
          </h3>
        </div>
        {stationName && (
          <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
            Near {stationName}
          </span>
        )}
      </div>

      {/* Current Conditions */}
      <div className="glass-strong rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{getWeatherIcon(current.weatherCode)}</span>
            <div>
              <p className="text-sm text-muted-foreground">Now</p>
              <p className="font-medium">{getWeatherDescription(current.weatherCode)}</p>
            </div>
          </div>
          <div className="text-right space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Thermometer className="w-4 h-4 text-orange-500" />
              <span className="font-medium">{current.temperature.toFixed(1)}°C</span>
            </div>
            <div className="flex items-center gap-1 text-sm">
              <Droplets className="w-4 h-4 text-blue-500" />
              <span>{current.precipitation.toFixed(1)} mm</span>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="hourly" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-2 mb-3">
          <TabsTrigger value="hourly" className="gap-1 text-xs">
            <Clock className="w-3 h-3" />
            24-Hour
          </TabsTrigger>
          <TabsTrigger value="daily" className="gap-1 text-xs">
            <Calendar className="w-3 h-3" />
            7-Day
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hourly" className="flex-1 m-0">
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyChartData}>
                <defs>
                  <linearGradient id="rainGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="time"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" mm"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'precipitation') return [`${value.toFixed(1)} mm`, 'Rain'];
                    if (name === 'probability') return [`${value}%`, 'Probability'];
                    return [value, name];
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="precipitation"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#rainGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Hourly precipitation forecast (mm)
          </p>
        </TabsContent>

        <TabsContent value="daily" className="flex-1 m-0">
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" mm"
                  width={40}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} mm`, 'Total Rain']}
                  labelFormatter={(label, payload) => {
                    if (payload?.[0]?.payload) {
                      const d = payload[0].payload;
                      return `${label} - ${getWeatherIcon(d.weatherCode)} ${d.tempMin.toFixed(0)}°-${d.tempMax.toFixed(0)}°C`;
                    }
                    return label;
                  }}
                />
                <Bar
                  dataKey="precipitation"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Daily forecast summary */}
          <div className="flex gap-1 mt-2 overflow-x-auto pb-1">
            {dailyChartData.slice(0, 5).map((day, i) => (
              <div
                key={day.fullDate}
                className={`flex-1 min-w-[50px] text-center p-1.5 rounded-lg ${
                  i === 0 ? 'bg-primary/10' : 'bg-muted/30'
                }`}
              >
                <p className="text-[10px] text-muted-foreground">{day.date}</p>
                <p className="text-sm">{getWeatherIcon(day.weatherCode)}</p>
                <p className="text-[10px] font-medium">{day.probability}%</p>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
