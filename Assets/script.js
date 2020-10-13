var currentWeatherApi = "827c8b8e867e555d10a8dcbd63e3497c";
var today = moment().format("M/D/YY");
var cities = [""];
var lastCity = {};


// Return lat and long
function getPosition(cityName) {
    var queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${currentWeatherApi}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        searchCity(response.coord.lat, response.coord.lon, cityName);
    });
}

//Display daily forecast
function forecastDisplay(city, day) {
    var date = moment().add(day, 'days').format("M/D/YY");
    var dateDisplay = $("<p class='forecast-date'>").text(date);
    var temp = $("<p>").text(`Temp: ${kelvinToFahrenheit(city.daily[day].temp.day)} °F`);
    var humidity = $("<p>").text(`Humidity: ${city.daily[day].humidity}%`);
    var weatherPic = $("<img class='forecast-icon'>").attr("src", `http://openweathermap.org/img/w/${city.daily[day].weather[0].icon}.png`);
    weatherPic.attr("alt", city.current.weather[0].main);

    $(`*[data-day="${day}"]`).empty();
    $(`*[data-day="${day}"]`).append(dateDisplay, weatherPic, temp, humidity);
}


// API Call ******************************************************
function searchCity(lat, lon, cityName) {
    var queryURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${currentWeatherApi}`;
    $.ajax({
        url: queryURL,
        method: "GET"
    }).then(function (response) {
        console.log(response);
        persistLastCity(lat, lon, cityName);
        clearCityInfo();

        var cityAndDate = $("<p class='city-and-date'>").text(`${capitalize(cityName)} (${today})`);
        var weatherPic = $("<img class='weather-icon'>").attr("src", `http://openweathermap.org/img/w/${response.current.weather[0].icon}.png`);
        weatherPic.attr("alt", response.current.weather[0].main);
        cityAndDate.append(weatherPic);
        var temp = $("<p>").text(`temp: ${kelvinToFahrenheit(response.current.temp)} °F`);
        var humidity = $("<p>").text(`Humidity: ${response.current.humidity}%`);
        var windSpeed = $("<p>").text(`Wind Speed: ${response.current.wind_speed} MPH`);

        var uvIndex = $("<p>").html(`UV Index: <span style="color:white; background-color:${uvIndexStyler(parseFloat(response.current.uvi))}">${response.current.uvi}</span>`);

        $('.search-results').append(cityAndDate, temp, humidity, windSpeed, uvIndex);

        for (let i = 1; i < 6; i++) {

            forecastDisplay(response, i);
        }


    });

}
// ***************************************************************




// Add the curent city name to search history
function addCityToHistory(cityName) {
    var searchedCity = $(`<button class='btn text-left btn-outline-secondary ml-1 col-xl-12 searched-city' data-city='${cityName}'>`).text(cityName);
    $('#searchHistory').prepend(searchedCity);
}

// Clear the current city information 
function clearCityInfo() {
    $('.search-results').empty();
}


// Convert kelvin to fahrenheit
function kelvinToFahrenheit(kelvin) {
    return ((9 / 5) * (kelvin - 273) + 32).toFixed(2);
}


// Display current conditions at user
function showPosition(position) {
    searchCity(position.coords.latitude, position.coords.longitude, "Your Current Location");
}


// Search button click functionality
$("#searchButton").on("click", function () {
    var cityName = $('.city-name').val().trim();
    if (!cities.includes(cityName.toLowerCase())) {
        cities.push(cityName.toLowerCase());
        getPosition(cityName);
        addCityToHistory(capitalize(cityName));
    }
});

$(document).on("click", ".searched-city", function () {
    getPosition($(this).data('city'));
});



// Website startup - check if there's a city in storage, otherwise get current location.
function startUp() {
    lastCity = JSON.parse(localStorage.getItem("lastCity"));
    if (lastCity) {
        searchCity(lastCity.lat, lastCity.lon, lastCity.cityName);
    } else getLocation();
}


// Local storage object
function persistLastCity(lat, lon, cityName) {
    var city = {
        lat: lat,
        lon: lon,
        cityName: cityName
    };

    var lastCity = JSON.stringify(city);
    localStorage.setItem("lastCity", lastCity);
}

// Get user's current location
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
}

// Titlecase function
function capitalize(cityName) {
    var split = cityName.toLowerCase().split(' ');
    for (var i = 0; i < split.length; i++) {
        split[i] = split[i].charAt(0).toUpperCase() + split[i].substring(1);
    }
    return split.join(' ');
}

function uvIndexStyler(uvIndex) {
    if (uvIndex < 4) {
        return "green";
    } else
        if (uvIndex < 7) {
            return "orange";
        } else {
            return "red";
        }
}


startUp();