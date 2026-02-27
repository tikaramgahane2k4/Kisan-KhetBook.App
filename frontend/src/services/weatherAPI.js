// src/services/weatherAPI.js
import axios from 'axios';

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export const getWeatherByCity = async (city) => {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: API_KEY,
        units: 'metric',
      },
      // 7-second timeout — prevents the widget from hanging indefinitely
      // on slow mobile connections (2G/poor signal)
      timeout: 7000,
    });
    return response.data;
  } catch (error) {
    return null;
  }
};
