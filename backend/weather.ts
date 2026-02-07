import "dotenv/config";

const API_KEY = "2d61a72574c11c4f36173b627f8cb177";
const CITY = "Gampaha";

interface WeatherAlert {
  type: "watering" | "maintenance" | "flood" | "storm" | "normal";
  message: string;
  urgency: "high" | "low";
  details?: {
    temp: number;
    humidity: number;
    windSpeed: number;
    description: string;
    icon: string;
  };
}

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
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
    );

    if (!response.ok) {
      console.error("OpenWeather API Error:", await response.text());
      return null;
    }

    const data = await response.json();
    return processWeatherData(data);
  } catch (error) {
    console.error("Weather Service Error:", error);
    return null;
  }
}

function processWeatherData(data: any): WeatherAlert | null {
  const temp = Math.round(data.main.temp);
  const humidity = data.main.humidity;
  const windSpeed = data.wind.speed;
  const weatherMain = data.weather[0].main.toLowerCase();
  const weatherDesc = data.weather[0].description;
  const icon = data.weather[0].icon;

  const details = {
    temp,
    humidity,
    windSpeed,
    description: weatherDesc,
    icon
  };

  // Logic for alerts
  if (temp > 32 && humidity < 60) {
    return {
      type: "watering",
      message: `High temperature (${temp}°C) and low humidity detected in Gampaha. Please water your trees!`,
      urgency: "high",
      details
    };
  }

  if (weatherMain.includes("rain") || weatherMain.includes("drizzle")) {
    if (weatherDesc.toLowerCase().includes("heavy") || weatherDesc.toLowerCase().includes("extreme")) {
      return {
        type: "flood",
        message: "Heavy rain detected in Gampaha. Monitor your young saplings for waterlogging.",
        urgency: "high",
        details
      };
    }
    return {
      type: "maintenance",
      message: "It's raining in Gampaha! Natural watering in progress.",
      urgency: "low",
      details
    };
  }

  if (weatherMain.includes("thunderstorm")) {
    return {
      type: "storm",
      message: "Thunderstorms detected in Gampaha. Ensure young trees are properly staked.",
      urgency: "high",
      details
    };
  }

  // Morning maintenance tip
  const hour = new Date().getHours();
  if (hour >= 6 && hour <= 9) {
    return {
      type: "maintenance",
      message: "Good morning! The current weather is perfect for tree maintenance.",
      urgency: "low",
      details
    };
  }

  // Default "good weather" info
  return {
    type: "normal",
    message: `Current weather in Gampaha: ${weatherDesc}. Good conditions for plant growth.`,
    urgency: "low",
    details
  };
}
