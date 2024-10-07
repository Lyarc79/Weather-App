
const API_KEY = 'Y5MCNJ9BCK832KPD6TV9XVHY9'; 
const weatherForm = document.getElementById('weatherForm');
const locationInputField = document.getElementById('location');
const weatherDisplay = document.getElementById('weatherDisplay');
const loadingElement = document.getElementById('loading');

const locationElement = document.getElementById('locationName');
const temperatureElement = document.getElementById('temperature');
const weatherDescriptionElement = document.getElementById('weatherDescription');
const weatherImage = document.getElementById('weatherImage');
const windSpeedElement = document.getElementById('windSpeed');
const rainChanceElement = document.getElementById('rainChance');
const windIconElement = document.getElementById('windIcon');
const rainIconElement = document.getElementById('rainIcon');

const forecastSlider = document.getElementById('forecastSlider');
const toggleTempButton = document.getElementById('toggleTempButton'); 

let isCelsius = false;
let weatherData;

async function fetchWeather(searchTerm){
    try{
        const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${searchTerm}?unitGroup=us&include=hours&key=${API_KEY}&contentType=json`);
        if(!response.ok){
            throw new Error(`Error fetching weather data: ${response.statusText}`);
        }
        const rawWeatherData = await response.json();
        weatherData = processWeatherData(rawWeatherData);
        return weatherData;
    } catch(error){
        console.error('An error has ocurred:', error);
    }
};

function processWeatherData(rawData){
    const {address: city, days} = rawData;
    const today = days[0];
    const { temp: temperature, conditions: description, precipprob: rainChance, windspeed: windSpeed, hours } = today;

    const hourlyForecast = hours.slice(0, 24).map(hour => ({
        time: hour.datetime,
        temperature: hour.temp,
        icon: getWeatherIconCode(hour.conditions),
    }))

    return{city, temperature, description, rainChance, windSpeed, hourlyForecast};
};

weatherForm.addEventListener('submit', async function(event) {
    event.preventDefault();
    const locationInput = locationInputField.value.trim();

    if (locationInput) {
        loadingElement.style.display = 'block';
        try{
            const weatherData = await fetchWeather(locationInput);
            displayWeather(weatherData);
        } finally {
            loadingElement.style.display = "none";
        }
    } else {
        console.error('Please enter a valid location.');
    }
});

function displayWeather(data) {
    const {city, temperature, description, rainChance, windSpeed, hourlyForecast} = data;
    const iconCode = getWeatherIconCode(description);
    const weatherIconURL = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;

    locationElement.innerText = `${city}`;
    temperatureElement.innerText = `${convertTemperature(temperature)}°${isCelsius ? 'C' : 'F'}`;
    weatherImage.src = `${weatherIconURL}`;
    weatherDescriptionElement.innerText = `${description}`; 

    windIconElement.src = 'imgs/wind.png';
    rainIconElement.src = 'imgs/blur.png';
    windSpeedElement.innerText = `${windSpeed} km/h`;
    rainChanceElement.innerText = `${rainChance}%`;

    forecastSlider.innerHTML = hourlyForecast.map (hour => {
        const formattedHour = hour.time.slice(0, 5);

        return `
        <div class="forecast-item">
            <p>${convertTemperature(hour.temperature)}°${isCelsius ? 'C' : 'F'}</p>
            <img src="http://openweathermap.org/img/wn/${hour.icon}@2x.png" alt="${hour.icon}" />
            <p>${formattedHour}</p>
        </div>
        `;
    }).join('');
}

toggleTempButton.addEventListener('click', () =>{
    isCelsius = !isCelsius;
    toggleTempButton.innerText = isCelsius ? 'Switch to Fahrenheit' : 'Switch to Celsius';
    displayWeather(weatherData);
})

function convertTemperature(temp) {
    return isCelsius ? Math.round((temp - 32) * 5 / 9) : Math.round(temp);
}

function getWeatherIconCode(description){
    const conditionMap = [
        { keyword: 'rain', icon: '09d' },
        { keyword: 'shower', icon: '09d' },
        { keyword: 'clear', icon: '01d' },
        { keyword: 'sunny', icon: '01d' },
        { keyword: 'snow', icon: '13d' },
        { keyword: 'storm', icon: '11d' },
        { keyword: 'thunder', icon: '11d' },
        { keyword: 'cloud', icon: '03d' },
        { keyword: 'partly', icon: '02d' }
    ];

    description = description.toLowerCase();
    const match = conditionMap.find(condition => description.includes(condition.keyword));
    return match ? match.icon : '02d';
}

