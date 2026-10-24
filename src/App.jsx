
import { useState } from "react";
import "./App.css";

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getWeather(e) {
    e.preventDefault();

    if (!city.trim()) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError("");
    setWeather(null);

    try {
      const geoResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
      );

      if (!geoResponse.ok) {
        throw new Error("Unable to search for this city.");
      }

      const geoData = await geoResponse.json();
      const place = geoData.results?.[0];

      if (!place) {
        throw new Error("City not found. Please try another city.");
      }

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
      );

      if (!response.ok) {
        throw new Error("Unable to fetch weather.");
      }

      const data = await response.json();

      setWeather({
        city: place.name,
        country: place.country,
        temperature: data.current.temperature_2m,
        feelsLike: data.current.apparent_temperature,
        humidity: data.current.relative_humidity_2m,
        wind: data.current.wind_speed_10m,
        condition: getCondition(data.current.weather_code),
      });
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function getCondition(code) {
    if (code === 0) return "Clear Sky";
    if ([1, 2].includes(code)) return "Partly Cloudy";
    if (code === 3) return "Overcast";
    if ([45, 48].includes(code)) return "Foggy";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code))
      return "Rainy";
    if ([71, 73, 75, 77, 85, 86].includes(code))
      return "Snowy";
    if ([95, 96, 99].includes(code)) return "Thunderstorm";
    return "Weather Update";
  }

  return (
    <main className="app">
      <section className="weather-card">
        <h4>🌤️ Weather App</h4>
        <p className="subtitle">Check the weather in your city</p>

        <form onSubmit={getWeather}>
          <input
            type="text"
            placeholder="Enter city name..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {weather && (
          <div className="weather-info">
            <h2>
              {weather.city}, {weather.country}
            </h2>
            <div className="temperature">
              {Math.round(weather.temperature)}°C
            </div>
            <h3>{weather.condition}</h3>

            <div className="details">
              <div>
                <span>🌡️</span>
                <p>Feels like</p>
                <strong>{weather.feelsLike}°C</strong>
              </div>

              <div>
                <span>💧</span>
                <p>Humidity</p>
                <strong>{weather.humidity}%</strong>
              </div>

              <div>
                <span>💨</span>
                <p>Wind Speed</p>
                <strong>{weather.wind} km/h</strong>
              </div>
            </div>
          </div>
        )}

        {!weather && !error && !loading && (
          <p className="hint">Enter a city to see its current weather.</p>
        )}
      </section>
    </main>
  );
}

export default App;
