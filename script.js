document.addEventListener("DOMContentLoaded", () => {
    const apiKey = "fed5c291c956fc88872eee4261af4ee7";

    const getWeatherBtn = document.getElementById("getWeather");
    const cityInput = document.getElementById("city");
    const weatherResult = document.getElementById("weatherResult");
    const errorMessage = document.getElementById("errorMessage");
    const toggleModeBtn = document.getElementById("toggleMode");

    const hourlyContainer = document.getElementById("hourlyContainer");
    const weeklyContainer = document.getElementById("weeklyContainer");
    const ctx = document.getElementById("chart").getContext("2d");

    const body = document.getElementById("mainBody");
    let tempChart;

    // Tema arka planını değiştir
    function setBackgroundByTheme() {
        const isDark = body.classList.contains("dark");
        body.style.backgroundImage = isDark
            ? "url('./images/night.jpg')"
            : "url('./images/day.jpg')";
    }

    // Başlangıçta sistem temasını kontrol et
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
        body.classList.add('dark');
    } else {
        body.classList.remove('dark');
    }
    setBackgroundByTheme();

    // Tema değiştir butonu
    toggleModeBtn.addEventListener("click", () => {
        body.classList.toggle("dark");
        setBackgroundByTheme();
    });

    // Firebase Realtime Database referansı
    const database = firebase.database();

    // Yorum gönderme
    document.getElementById("submitReview").addEventListener("click", () => {
        const city = document.getElementById("cityName").textContent;
        const rating = document.getElementById("rating").value;
        const comment = document.getElementById("comment").value;
        if (!city || !rating || !comment) return alert("Please fill in all fields");

        const reviewRef = database.ref("reviews").push();
        reviewRef.set({ city, rating, comment, timestamp: Date.now() });

        document.getElementById("rating").value = "";
        document.getElementById("comment").value = "";
    });

    // Yorumları listele
    function loadReviews(city) {
        const reviewList = document.getElementById("reviewList");
        reviewList.innerHTML = "";

        database.ref("reviews").orderByChild("city").equalTo(city).once("value", snapshot => {
            if (!snapshot.exists()) {
                reviewList.innerHTML = "<p>No reviews yet.</p>";
                return;
            }
            snapshot.forEach(child => {
                const data = child.val();
                const item = document.createElement("div");
                item.classList.add("review-item");
                item.innerHTML = `
                    <p><strong>Rating:</strong> ${data.rating}/5</p>
                    <p>${data.comment}</p>
                `;
                reviewList.appendChild(item);
            });
        });
    }

    // Hava durumu (şimdiki)
    async function getWeather(city) {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=en`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod !== 200) {
            showError("City not found.");
            return;
        }

        document.getElementById("cityName").textContent = data.name;
        document.getElementById("temp").textContent = data.main.temp;
        document.getElementById("humidity").textContent = data.main.humidity;
        document.getElementById("wind").textContent = data.wind.speed;
        document.getElementById("description").textContent = data.weather[0].description;
        document.getElementById("weatherIcon").src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        weatherResult.classList.remove("hidden");
        errorMessage.classList.add("hidden");

        loadReviews(data.name);
    }

    // Saatlik hava durumu
    async function getHourly(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=en`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.cod !== "200") return;

        hourlyContainer.innerHTML = "";
        data.list.slice(0, 8).forEach(hour => {
            const date = new Date(hour.dt * 1000);
            const div = document.createElement("div");
            div.classList.add("hourly-card");
            div.innerHTML = `
                <h4>${date.getHours()}:00</h4>
                <p>${hour.main.temp}°C</p>
                <img src="https://openweathermap.org/img/wn/${hour.weather[0].icon}.png">
            `;
            hourlyContainer.appendChild(div);
        });
    }

    // Haftalık hava durumu
    async function getWeekly(city) {
        const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;
        const res = await fetch(url);
        const data = await res.json();

        const days = {};
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!days[date]) days[date] = [];
            days[date].push(item.main.temp);
        });

        const labels = [];
        const temps = [];

        for (const day in days) {
            labels.push(day.split(" ")[0]);
            const avg = (days[day].reduce((a, b) => a + b, 0) / days[day].length).toFixed(1);
            temps.push(avg);
        }

        if (tempChart) tempChart.destroy();

        tempChart = new Chart(ctx, {
            type: "line",
            data: {
                labels,
                datasets: [{
                    label: "Avg Temp (°C)",
                    data: temps,
                    borderColor: "orange",
                    fill: false,
                    tension: 0.3,
                }]
            }
        });
    }

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove("hidden");
        weatherResult.classList.add("hidden");
    }

    function getWeatherByLocation() {
        if (!navigator.geolocation) return alert("Geolocation not supported");

        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            const res = await fetch(url);
            const data = await res.json();
            const city = data.name;
            cityInput.value = city;
            handleSearch(city);
        });
    }

    function handleSearch(city) {
        getWeather(city);
        getHourly(city);
        getWeekly(city);
    }

    getWeatherBtn.addEventListener("click", () => {
        const city = cityInput.value.trim();
        if (city) handleSearch(city);
    });

    getWeatherByLocation();
});


  
  




