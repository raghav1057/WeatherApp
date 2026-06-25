let weather = {
    fetchWeather: function (city) {
        const searchQuery = city.trim();

        if (!searchQuery) {
            return;
        }

        fetch(
            "https://geocoding-api.open-meteo.com/v1/search?name="
            + encodeURIComponent(searchQuery)
            + "&count=1&language=en&format=json"
        )
            .then((response) => response.json())
            .then((data) => {
                if (!data.results || data.results.length === 0) {
                    throw new Error("No matching location found");
                }

                const location = data.results[0];

                return fetch(
                    "https://api.open-meteo.com/v1/forecast?latitude="
                    + location.latitude
                    + "&longitude="
                    + location.longitude
                    + "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto"
                )
                    .then((response) => response.json())
                    .then((weatherData) => this.displayWeather(weatherData, location));
            })
            .catch((error) => this.displayError(error.message));
    },
    displayWeather: function (data, location) {
        const { temperature_2m, relative_humidity_2m, wind_speed_10m, weather_code } = data.current;
        const weatherInfo = this.getWeatherInfo(weather_code);

        document.querySelector(".city").innerText = "Weather in " + location.name + (location.admin1 ? ", " + location.admin1 : "") + (location.country ? ", " + location.country : "");
        document.querySelector(".icon").src = weatherInfo.icon;
        document.querySelector(".description").innerText = weatherInfo.description;
        document.querySelector(".temp").innerText = Math.round(temperature_2m) + "°C";
        document.querySelector(".humidity").innerText = "Humidity: " + Math.round(relative_humidity_2m) + "%";
        document.querySelector(".wind").innerText = "Wind Speed: " + Math.round(wind_speed_10m) + " km/hr";
    },
    displayError: function (message) {
        document.querySelector(".city").innerText = "Weather unavailable";
        document.querySelector(".icon").src = this.getWeatherIcon("50d", true);
        document.querySelector(".description").innerText = message;
        document.querySelector(".temp").innerText = "--";
        document.querySelector(".humidity").innerText = "Humidity: --";
        document.querySelector(".wind").innerText = "Wind Speed: --";
    },
    getWeatherInfo: function (code) {
        if (code === 0) {
            return {
                description: "Clear sky",
                icon: this.getWeatherIcon("01d")
            };
        }

        if (code === 1 || code === 2 || code === 3) {
            return {
                description: code === 1 ? "Mostly clear" : code === 2 ? "Partly cloudy" : "Overcast",
                icon: this.getWeatherIcon("02d")
            };
        }

        if (code === 45 || code === 48) {
            return {
                description: "Fog",
                icon: this.getWeatherIcon("50d")
            };
        }

        if (code === 51 || code === 53 || code === 55 || code === 56 || code === 57) {
            return {
                description: "Drizzle",
                icon: this.getWeatherIcon("09d")
            };
        }

        if (code === 61 || code === 63 || code === 65 || code === 66 || code === 67 || code === 80 || code === 81 || code === 82) {
            return {
                description: "Rain",
                icon: this.getWeatherIcon("10d")
            };
        }

        if (code === 71 || code === 73 || code === 75 || code === 77 || code === 85 || code === 86) {
            return {
                description: "Snow",
                icon: this.getWeatherIcon("13d")
            };
        }

        if (code === 95 || code === 96 || code === 99) {
            return {
                description: "Thunderstorm",
                icon: this.getWeatherIcon("11d")
            };
        }

        return {
            description: "Current weather",
            icon: this.getWeatherIcon("03d")
        };
    },
    getWeatherIcon: function (iconCode, isError) {
        if (isError) {
            return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'><circle cx='32' cy='32' r='30' fill='white'/><path d='M32 18v18' stroke='black' stroke-width='6' stroke-linecap='round'/><circle cx='32' cy='42' r='3.5' fill='black'/></svg>");
        }

        return "https://openweathermap.org/img/wn/" + iconCode + "@2x.png";
    },
    search: function () {
        this.fetchWeather(document.querySelector(".search-bar").value);
    }
};



document
    .querySelector(".search button")
    .addEventListener("click", function () {
        weather.search();
    });

document.querySelector(".search-bar").addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
        weather.search();
    }
})

weather.fetchWeather("Delhi");