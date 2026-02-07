import "dotenv/config";

const API_KEY = "2d61a72574c11c4f36173b627f8cb177";
const CITY = "Gampaha";

interface WeatherAlert {
  type: "watering" | "maintenance" | "flood" | "storm";
  message: string;
  urgency: "high" | "low";
}

let cachedWeather: { data: any; timestamp: number } | null = null;
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

export async function getGampahaWeatherAlert(): Promise<WeatherAlert | null> {
  if (!API_KEY) {
    // Fallback to simulated logic if no API key
    const now = new Date();
    const isDrySeason = [1, 2, 3, 7, 8].includes(now.getMonth() + 1);
    const currentHour = now.getHours();

    if (isDrySeason) {
      return {
        type: "watering",
        message: "Dry weather detected in Gampaha. Please water your trees today!",
        urgency: "high"
      };
    } else if (currentHour > 6 && currentHour < 10) {
      return {
        type: "maintenance",
        message: "Good morning! Perfect time for basic tree maintenance.",
        urgency: "low"
      };
    }
    return null;
  }

  try {
    const now = Date.now();
    if (cachedWeather && (now - cachedWeather.timestamp < CACHE_DURATION)) {
      return processWeatherData(cachedWeather.data);
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      console.error("OpenWeather API Error:", await response.text());
      return null;
    }

    const data = await response.json();
    cachedWeather = { data, timestamp: now };
    
    return processWeatherData(data);
  } catch (error) {
    console.error("Weather Service Error:", error);
    return null;
  }
}

function processWeatherData(data: any): WeatherAlert | null {
  const temp = data.main.temp;
  const humidity = data.main.humidity;
  const weatherMain = data.weather[0].main.toLowerCase();
  const weatherDesc = data.weather[0].description.toLowerCase();

  // Logic for alerts
  if (temp > 32 && humidity < 60) {
    return {
      type: "watering",
      message: `High temperature (${temp}°C) and low humidity detected in Gampaha. Please water your trees!`,
      urgency: "high"
    };
  }

  if (weatherMain.includes("rain") || weatherDesc.includes("rain")) {
    if (weatherDesc.includes("heavy") || weatherDesc.includes("extreme")) {
      return {
        type: "flood",
        message: "Heavy rain detected in Gampaha. Monitor your young saplings for waterlogging.",
        urgency: "high"
      };
    }
    return {
      type: "maintenance",
      message: "It's raining in Gampaha! Natural watering in progress.",
      urgency: "low"
    };
  }

  if (weatherMain.includes("thunderstorm")) {
    return {
      type: "storm",
      message: "Thunderstorms detected in Gampaha. Ensure young trees are properly staked.",
      urgency: "high"
    };
  }

  // Morning maintenance tip
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 9) {
    return {
      type: "maintenance",
      message: "Good morning! The current weather is perfect for tree maintenance.",
      urgency: "low"
    };
  }

  return null;
}
