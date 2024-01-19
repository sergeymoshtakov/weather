let selectedDayIndex = 0;

function getUserLocation() {
    return new Promise((resolve, reject) => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => resolve({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
                (error) => reject(error)
            );
        } else {
            reject("Geolocation not supported");
        }
    });
}

function getCityNameByCoordinates(latitude, longitude) {
    const apiKey = 'ab3ae61ea1e77ce13d5e249e1462da64';

    return fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`)
        .then(response => response.json())
        .then(data => data.name)
        .catch(error => {
            console.error('Error fetching city name:', error);
            return null;
        });
}

function showTab(tab) {
    if (tab === 'today') {
        document.getElementById('today-content').style.display = 'block';
        document.getElementById('5day-content').style.display = 'none';
    } else if (tab === '5day') {
        document.getElementById('5day-content').style.display = 'block';
        document.getElementById('today-content').style.display = 'none';
    }
}

function getWeatherByLocation() {
    getUserLocation()
        .then((location) => {
            return getCityNameByCoordinates(location.latitude, location.longitude)
                .then(cityName => ({ location, cityName }));
        })
        .then(({ location, cityName }) => {
            document.getElementById('city').value = cityName;

            const apiKey = 'ab3ae61ea1e77ce13d5e249e1462da64';
            
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}`)
                .then(response => response.json())
                .then(data => {
                    updateCurrentWeather(data);

                    return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}`);
                })
                .then(response => response.json())
                .then(hourlyData => {
                    updateHourlyForecast(hourlyData);
                })
                .catch(error => console.error('Error fetching weather:', error));
        })
        .catch(error => console.error('Error getting user location:', error));
}

function getWeatherByCity(city) {
    const apiKey = 'ab3ae61ea1e77ce13d5e249e1462da64';

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(data => {
            updateCurrentWeather(data);

            return fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(hourlyData => {
            updateHourlyForecast(hourlyData);
        })
        .then(() => {
            if (document.getElementById('5day-tab').classList.contains('active')) {
                showTab('5day');
            } else {
                showTab('today');
            }
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            displayError("City not found. Please enter a valid city name.");
        });
}

function updateCurrentWeather(data) {
    document.getElementById('current-weather').innerHTML = `
        <h2>${data.name}</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Description: ${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon">
        <p>Current Temperature: ${data.main.temp}°C</p>
        <p>Min Temperature: ${data.main.temp_min}°C</p>
        <p>Max Temperature: ${data.main.temp_max}°C</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;
}

function updateHourlyForecast(hourlyData) {
    const hourlyWeatherContainer = document.getElementById('hourly-weather');
    hourlyWeatherContainer.innerHTML = '<h2>Hourly Weather</h2>';
    
    const currentHourIndex = new Date().getHours();

    for (let i = 0; i < 5; i++) {
        const hour = hourlyData.list[currentHourIndex + i];
        hourlyWeatherContainer.innerHTML += `
            <div class="hourly-item">
                <p>${new Date(hour.dt * 1000).toLocaleTimeString()}</p>
                <img src="https://openweathermap.org/img/w/${hour.weather[0].icon}.png" alt="Weather Icon">
                <p>Description: ${hour.weather[0].description}</p>
                <p>Temperature: ${hour.main.temp}°C</p>
                <p>Wind Speed: ${hour.wind.speed} m/s</p>
            </div>
        `;
    }
}

function displayError(message) {
    document.getElementById('current-weather').innerHTML = `<h2>Error: ${message}</h2>`;
    document.getElementById('hourly-weather').innerHTML = '';
    document.getElementById('nearest-cities').innerHTML = '';
}

function getNearestCitiesWeather(latitude, longitude) {
    const apiKey = 'ab3ae61ea1e77ce13d5e249e1462da64';

    fetch(`https://api.openweathermap.org/data/2.5/find?lat=${latitude}&lon=${longitude}&cnt=3&units=metric&appid=${apiKey}`)
        .then(response => response.json())
        .then(nearestCitiesData => {
            updateNearestCitiesWeather(nearestCitiesData.list);
        })
        .catch(error => {
            console.error('Error fetching nearest cities weather:', error);
        });
}

function updateNearestCitiesWeather(nearestCities) {
    const nearestCitiesContainer = document.getElementById('nearest-cities');
    nearestCitiesContainer.innerHTML = '<h2>Nearest Cities</h2>';

    nearestCities.forEach(city => {
        nearestCitiesContainer.innerHTML += `
            <div class="city-item">
                <p>${city.name}</p>
                <img src="https://openweathermap.org/img/w/${city.weather[0].icon}.png" alt="Weather Icon">
                <p>Temperature: ${city.main.temp}°C</p>
            </div>
        `;
    });
}

function updateCurrentWeather(data) {
    document.getElementById('current-weather').innerHTML = `
        <h2>${data.name}</h2>
        <p>Date: ${new Date().toLocaleDateString()}</p>
        <p>Description: ${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/w/${data.weather[0].icon}.png" alt="Weather Icon">
        <p>Current Temperature: ${data.main.temp}°C</p>
        <p>Min Temperature: ${data.main.temp_min}°C</p>
        <p>Max Temperature: ${data.main.temp_max}°C</p>
        <p>Wind Speed: ${data.wind.speed} m/s</p>
    `;

    getNearestCitiesWeather(data.coord.lat, data.coord.lon);
}



document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('today-tab').addEventListener('click', function () {
        showTab('today');
        getWeatherByLocation();
    });

    document.getElementById('5day-tab').addEventListener('click', function () {
        showTab('5day');
        get5DayForecast();
    });
});

function get5DayForecast() {
    getUserLocation()
        .then((location) => {
            return getCityNameByCoordinates(location.latitude, location.longitude)
                .then(cityName => ({ location, cityName }));
        })
        .then(({ location, cityName }) => {
            const apiKey = 'ab3ae61ea1e77ce13d5e249e1462da64';
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${location.latitude}&lon=${location.longitude}&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(data => {
            update5DayForecast(data);
        })
        .catch(error => console.error('Error fetching 5-day forecast:', error));
}

function get5DayByCity(city) {
    const apiKey = 'ab3ae61ea1e77ce13d5e249e1462da64';

    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(locationData => {
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${locationData.coord.lat}&lon=${locationData.coord.lon}&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(data => {
            update5DayForecast(data);
        })
        .catch(error => {
            console.error('Error fetching 5-day forecast by city:', error);
            displayError("City not found. Please enter a valid city name.");
        });
}

function update5DayForecast(data) {
    const shortForecastContainer = document.getElementById('short-forecast-container');
    
    for (let i = 0; i < 5; i++) {
        const dayData = data.list[i * 8]; 
        
        const dayOfWeek = new Date(dayData.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' });
        const date = new Date(dayData.dt * 1000).toLocaleDateString('en-US');
        const icon = dayData.weather[0].icon;
        const temperature = dayData.main.temp.toFixed(1);
        const description = dayData.weather[0].description;

        const dayForecastElement = document.getElementById(`day-of-week-${i}`);
        dayForecastElement.textContent = dayOfWeek;

        const dateElement = document.getElementById(`date-${i}`);
        dateElement.textContent = date;

        const iconElement = document.getElementById(`icon-${i}`);
        iconElement.src = `https://openweathermap.org/img/w/${icon}.png`;
        iconElement.alt = 'Weather Icon';

        const temperatureElement = document.getElementById(`temperature-${i}`);
        temperatureElement.textContent = `${temperature}°C`;

        const descriptionElement = document.getElementById(`description-${i}`);
        descriptionElement.textContent = description;
    }

    showDailyForecast(data, 0);
}

function showHourlyData(index){
    const apiKey = 'ab3ae61ea1e77ce13d5e249e1462da64';
    const city = document.getElementById('city').value;
    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("City not found");
            }
            return response.json();
        })
        .then(locationData => {
            return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${locationData.coord.lat}&lon=${locationData.coord.lon}&appid=${apiKey}`);
        })
        .then(response => response.json())
        .then(data => {
            showDailyForecast(data, index)
        })
        .catch(error => {
            console.error('Error fetching 5-day forecast by city:', error);
            displayError("City not found. Please enter a valid city name.");
        });
}

function showDailyForecast(data, index) {
    selectedDayIndex = index;
    console.log(index);
    const hourlyForecastContainer = document.getElementById('hourly-forecast');
    hourlyForecastContainer.innerHTML = '';

    for (let i = 0; i < 8; i++) {
        const hourDataIndex = index * 8 + i;
        console.log("hourDataIndex:", hourDataIndex);
        const hourData = data.list[hourDataIndex];
        
        const time = new Date(hourData.dt * 1000).toLocaleTimeString();
        const icon = hourData.weather[0].icon;
        const description = hourData.weather[0].description;
        const temperature = hourData.main.temp.toFixed(1);
        const feelsLike = hourData.main.feels_like.toFixed(1);
        const windSpeed = hourData.wind.speed;

        hourlyForecastContainer.innerHTML += `
            <div class="hourly-forecast-item">
                <p>${time}</p>
                <img src="https://openweathermap.org/img/w/${icon}.png" alt="Weather Icon">
                <p>${description}</p>
                <p>Temperature: ${temperature}°C</p>
                <p>Feels Like: ${feelsLike}°C</p>
                <p>Wind Speed: ${windSpeed} m/s</p>
            </div>
        `;
    }
}



document.getElementById('today-tab').click();
getWeatherByLocation();

document.getElementById('search-button').addEventListener('click', function () {
    const city = document.getElementById('city').value;
    getWeatherByCity(city);
    get5DayByCity(city);
});