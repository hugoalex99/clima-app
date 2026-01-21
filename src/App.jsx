import { useState } from "react";
import axios from "axios";
import "./App.css";
import {
  WiDaySunny, WiCloud, WiCloudy, WiFog, WiRain, WiShowers,
  WiSnow, WiThunderstorm
} from "react-icons/wi";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const weatherIcons = {
  0: <WiDaySunny size={40} color="#FFD700" />,
  1: <WiCloud size={40} color="#87CEEB" />,
  2: <WiCloudy size={40} color="#87CEEB" />,
  3: <WiCloudy size={40} color="#808080" />,
  45: <WiFog size={40} color="#708090" />,
  48: <WiFog size={40} color="#708090" />,
  51: <WiShowers size={40} color="#1E90FF" />,
  53: <WiShowers size={40} color="#1E90FF" />,
  55: <WiRain size={40} color="#1E90FF" />,
  61: <WiRain size={40} color="#1E90FF" />,
  63: <WiRain size={40} color="#1E90FF" />,
  65: <WiRain size={40} color="#1E90FF" />,
  71: <WiSnow size={40} color="#00BFFF" />,
  73: <WiSnow size={40} color="#00BFFF" />,
  75: <WiSnow size={40} color="#00BFFF" />,
  95: <WiThunderstorm size={40} color="#FF4500" />,
};

function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCoordinates = async (cityName) => {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=pt&format=json`;
    const res = await axios.get(url);
    if (res.data.results && res.data.results.length > 0) {
      return res.data.results[0];
    } else {
      throw new Error("Cidade não encontrada");
    }
  };

  const fetchWeather = async () => {
    try {
      setLoading(true);
      const location = await fetchCoordinates(city);
      const { latitude, longitude, name, country } = location;

      const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;

      const res = await axios.get(url);

      setWeather({
        city: name,
        country,
        temp: res.data.current_weather.temperature,
        wind: res.data.current_weather.windspeed,
        code: res.data.current_weather.weathercode,
      });

      const daily = {
        time: res.data.daily.time.slice(0, 5),
        temperature_2m_max: res.data.daily.temperature_2m_max.slice(0, 5),
        temperature_2m_min: res.data.daily.temperature_2m_min.slice(0, 5),
        weathercode: res.data.daily.weathercode.slice(0, 5),
      };
      setForecast(daily);
    } catch (error) {
      alert("Erro ao buscar clima: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const chartData = forecast.time ? {
    labels: forecast.time.map((day) => new Date(day).toLocaleDateString("pt-BR")),
    datasets: [
      {
        label: "Temperatura Máxima (°C)",
        data: forecast.temperature_2m_max.map((t) => Math.round(t)),
        borderColor: "#00c9a7",
        backgroundColor: "rgba(0,201,167,0.3)",
        tension: 0.3,
      },
      {
        label: "Temperatura Mínima (°C)",
        data: forecast.temperature_2m_min.map((t) => Math.round(t)),
        borderColor: "#2c5364",
        backgroundColor: "rgba(44,83,100,0.3)",
        tension: 0.3,
      },
    ],
  } : null;

  return (
    <div className="container">
      <h1>Projeto de 🌤️ Clima com Open‑Meteo</h1>
      <div className="search-box">
        <input
          type="text"
          placeholder="Digite a cidade..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button onClick={fetchWeather}>Buscar</button>
      </div>

      {loading && (
        <div className="loading">
          <div className="spinner"></div>
          <p>Buscando dados...</p>
        </div>
      )}

      {weather && (
        <div className="weather-card">
          <h2>{weather.city}, {weather.country}</h2>
          <p>{weatherIcons[weather.code]} <span className="main-temp">{Math.round(weather.temp)} °C</span></p>
          <p>💨 Vento: {Math.round(weather.wind)} km/h</p>
        </div>
      )}

      {forecast.time && (
        <>
          <div className="forecast-container">
            {forecast.time.map((day, index) => (
              <div key={index} className="forecast-card">
                <p>{new Date(day).toLocaleDateString("pt-BR")}</p>
                <p>{weatherIcons[forecast.weathercode[index]]}</p>
                <p>🌡️ Máx: {Math.round(forecast.temperature_2m_max[index])} °C</p>
                <p>🌡️ Mín: {Math.round(forecast.temperature_2m_min[index])} °C</p>
              </div>
            ))}
          </div>

          <div className="chart-container">
            <h2>📈 Variação de Temperatura (5 dias)</h2>
            {chartData && <Line data={chartData} />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
