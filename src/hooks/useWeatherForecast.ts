import { useQuery } from "@tanstack/react-query";
import { fetchWeatherForecast, SRI_LANKA_CENTER, WeatherForecast } from "@/services/weatherApi";

export function useWeatherForecast(latitude?: number, longitude?: number) {
  const lat = latitude || SRI_LANKA_CENTER.latitude;
  const lon = longitude || SRI_LANKA_CENTER.longitude;

  return useQuery<WeatherForecast>({
    queryKey: ['weather-forecast', lat, lon],
    queryFn: () => fetchWeatherForecast(lat, lon),
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 60 * 60 * 1000, // Refetch every hour
  });
}
