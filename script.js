// script.js
const apiKey = '2cae97e101db245112ef2b9611a9d06d'; // Replace with your OpenWeatherMap API key
const weatherDataDiv = document.getElementById('weatherData');
const weatherAlertsDiv = document.getElementById('weatherAlerts');
const darkModeSwitch = document.getElementById('darkModeSwitch');

// Fetch weather data
async function getWeather() {
  const city = document.getElementById('cityInput').value;
  if (!city) return alert('Please enter a city name.');

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();

    if (data.cod !== 200) throw new Error(data.message);

    const { name, main, weather, wind } = data;
    weatherDataDiv.innerHTML = `
      <h2>${name}</h2>
      <p>Temperature: ${main.temp}°C</p>
      <p>Condition: ${weather[0].description}</p>
      <p>Humidity: ${main.humidity}%</p>
      <p>Wind Speed: ${wind.speed} m/s</p>
    `;

    // Check alerts (using One Call API for full alert info)
    getAlerts(data.coord.lat, data.coord.lon);
  } catch (error) {
    weatherDataDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
}

// Get weather alerts
async function getAlerts(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}`
    );
    const data = await response.json();

    if (data.alerts && data.alerts.length > 0) {
      weatherAlertsDiv.innerHTML = data.alerts.map(
        alert => `
        <div class="alert">
          <h3>${alert.event}</h3>
          <p>${alert.description}</p>
        </div>
      `).join('');
    } else {
      weatherAlertsDiv.innerHTML = '<p>No weather alerts.</p>';
    }
  } catch (error) {
    weatherAlertsDiv.innerHTML = `<p>Alert Error: ${error.message}</p>`;
  }
}

// Voice recognition
function startVoiceCommand() {
  const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
  recognition.lang = 'en-US';
  recognition.start();

  recognition.onresult = function (event) {
    const city = event.results[0][0].transcript;
    document.getElementById('cityInput').value = city;
    getWeather();
  };

  recognition.onerror = function (event) {
    alert('Voice recognition error: ' + event.error);
  };
}

// Dark mode toggle
darkModeSwitch.addEventListener('change', () => {
  document.body.classList.toggle('dark-mode', darkModeSwitch.checked);
});

// Offline support - register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').then(
      reg => console.log('Service worker registered.', reg),
      err => console.error('Service worker registration failed:', err)
    );
  });
}