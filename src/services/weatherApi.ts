// Open-Meteo API - Free weather data, no API key required
const BASE_URL = 'https://api.open-meteo.com/v1/forecast';

export interface HourlyForecast {
  time: string;
  precipitation: number;
  precipitationProbability: number;
  temperature: number;
  weatherCode: number;
}

export interface DailyForecast {
  date: string;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  temperatureMax: number;
  temperatureMin: number;
  weatherCode: number;
}

export interface WeatherForecast {
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  location: {
    latitude: number;
    longitude: number;
  };
}

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number
): Promise<WeatherForecast> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    hourly: 'precipitation,precipitation_probability,temperature_2m,weather_code',
    daily: 'precipitation_sum,precipitation_probability_max,temperature_2m_max,temperature_2m_min,weather_code',
    timezone: 'Asia/Colombo',
    forecast_days: '7',
  });

  const response = await fetch(`${BASE_URL}?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Weather API error: ${response.status}`);
  }

  const data = await response.json();

  // Transform hourly data
  const hourly: HourlyForecast[] = data.hourly.time.map((time: string, i: number) => ({
    time,
    precipitation: data.hourly.precipitation[i] || 0,
    precipitationProbability: data.hourly.precipitation_probability[i] || 0,
    temperature: data.hourly.temperature_2m[i],
    weatherCode: data.hourly.weather_code[i],
  }));

  // Transform daily data
  const daily: DailyForecast[] = data.daily.time.map((date: string, i: number) => ({
    date,
    precipitationSum: data.daily.precipitation_sum[i] || 0,
    precipitationProbabilityMax: data.daily.precipitation_probability_max[i] || 0,
    temperatureMax: data.daily.temperature_2m_max[i],
    temperatureMin: data.daily.temperature_2m_min[i],
    weatherCode: data.daily.weather_code[i],
  }));

  return {
    hourly,
    daily,
    location: { latitude, longitude },
  };
}

// Get weather description from WMO code
export function getWeatherDescription(code: number): string {
  const weatherCodes: Record<number, string> = {
    0: 'Clear sky',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Moderate drizzle',
    55: 'Dense drizzle',
    61: 'Slight rain',
    63: 'Moderate rain',
    65: 'Heavy rain',
    66: 'Light freezing rain',
    67: 'Heavy freezing rain',
    71: 'Slight snow',
    73: 'Moderate snow',
    75: 'Heavy snow',
    80: 'Slight rain showers',
    81: 'Moderate rain showers',
    82: 'Violent rain showers',
    85: 'Slight snow showers',
    86: 'Heavy snow showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm with slight hail',
    99: 'Thunderstorm with heavy hail',
  };
  return weatherCodes[code] || 'Unknown';
}

// Get weather icon based on WMO code
export function getWeatherIcon(code: number): string {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 55) return '🌧️';
  if (code <= 67) return '🌧️';
  if (code <= 77) return '❄️';
  if (code <= 82) return '🌦️';
  if (code <= 86) return '🌨️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

// Sri Lanka center coordinates for default weather
export const SRI_LANKA_CENTER = {
  latitude: 7.8731,
  longitude: 80.7718,
};
