document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "fed5c291c956fc88872eee4261af4ee7";
    const getWeatherBtn = document.getElementById("getWeather");
    const cityInput = document.getElementById("city");
    const weatherResult = document.getElementById("weatherResult");
    const errorMessage = document.getElementById("errorMessage");
    const toggleModeBtn = document.getElementById("toggleMode");

    // Gece/Gündüz modunu kontrol et
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDarkMode.matches) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.add('light-mode');
    }

    // Manuel mod geçişi
    toggleModeBtn.addEventListener("click", () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
    });

    // Saatlik hava durumu al
    async function getHourlyWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=en`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod !== "200") {
                errorMessage.textContent = "City not found, please try again.";
                errorMessage.classList.remove("hidden");
                weatherResult.classList.add("hidden");
                return;
            }

            // Saatlik verileri işleme
            const hourlyContainer = document.getElementById("hourlyContainer");
            hourlyContainer.innerHTML = ""; // Önceki saatlik verileri temizle

            // 24 saatlik verileri işle
            data.list.slice(0, 8).forEach(forecast => {
                const hourlyDiv = document.createElement("div");
                hourlyDiv.classList.add("hourly-card");
                const date = new Date(forecast.dt * 1000);
                hourlyDiv.innerHTML = `
                    <h4>${date.getHours()}:00</h4>
                    <p>Temp: ${forecast.main.temp}°C</p>
                    <p>Humidity: ${forecast.main.humidity}%</p>
                    <p>Wind: ${forecast.wind.speed} m/s</p>
                    <img src="https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png" alt="Weather">
                `;
                hourlyContainer.appendChild(hourlyDiv);
            });

        } catch (error) {
            errorMessage.textContent = "An error occurred. Please try again later.";
            errorMessage.classList.remove("hidden");
            weatherResult.classList.add("hidden");
        }
    }

    // Hava durumu verisini al
    async function getWeatherByCity(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`;
        try {
            const response = await fetch(url);
            const data = await response.json();
            if (data.cod !== 200) {
                errorMessage.textContent = "City not found, please try again.";
                errorMessage.classList.remove("hidden");
                weatherResult.classList.add("hidden");
                return;
            }

            document.getElementById("cityName").textContent = data.name;
            document.getElementById("temp").textContent = data.main.temp;
            document.getElementById("humidity").textContent = data.main.humidity;
            document.getElementById("wind").textContent = data.wind.speed;
            document.getElementById("description").textContent = data.weather[0].description;
            document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;

            weatherResult.classList.remove("hidden");
            errorMessage.classList.add("hidden");
        } catch (error) {
            errorMessage.textContent = "An error occurred. Please try again later.";
            errorMessage.classList.remove("hidden");
            weatherResult.classList.add("hidden");
        }
    }

    // Buton tıklaması ile hava durumu al
    getWeatherBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
            getHourlyWeather(city); // Saatlik hava durumu verisini al
        }
    });
});
