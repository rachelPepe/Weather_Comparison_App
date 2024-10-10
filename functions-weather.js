// DOM handlers and listeners
window.addEventListener("DOMContentLoaded", domLoaded)

function domLoaded() {
    document.getElementById("city1").addEventListener("input", cityInput);
    document.getElementById("city2").addEventListener("input", cityInput);
    document.getElementById("compareBtn").addEventListener("click", compareBtnClick)
}



// COMPARE BUTTON CALLBACK AND SUPPORTING CODE

// called when city input values change
function cityInput(e) {
    // extract the text from city input that triggered the callbacl
    const cityId = e.target.id;
    const city = document.getElementById(cityId).value.trim();

    // only shows error message if no city is entered
    if (city.length === 0) {
        showElement("error-value-" + cityId);
    }
    else {
        hideElement("error-value-" + cityId);
    }
}


// called when compare button is clicked
function compareBtnClick() {
    // get user input
    const city1 = document.getElementById("city1").value.trim()
    const city2 = document.getElementById("city2").value.trim()

    // show error messages if city fields left blank
    if (city1.length === 0) {
        showElement("error-value-city1");
    }
    if (city2.length === 0) {
        showElement("error-value-city2");
    }

    // ensure both city names provided
    if (city1.length > 0 && city2.length > 0) {
        showElement("forecast");
        hideElement("error-loading-city1");
        hideElement("error-loading-city2");
        showElement("loading-city1");
        showMessage("loading-city1", `Loading ${city1}...`);
        showElement("loading-city2");
        showMessage("loading-city2", `Loading ${city2}...`);
        hideElement("results-city1");
        hideElement("results-city2");

        // fetch forecast
        getWeatherForecast(city1, "city1");
        getWeatherForecast(city2, "city2");
    }
}



// REQUEST CITY FORECAST
async function getWeatherForecast(city, cityId) {

    // create url to request web API
    const endpoint = "https://api.openweathermap.org/data/2.5/forecast";
    const apiKey = "9635fc8c9579f24276dbd3d7902e9c7f";
    const queryString = `q=${encodeURI(city)}&units=imperial&appid=${apiKey}`;
    const url = endpoint + "?" + queryString;

    // send http request to web api
    const response = await fetch(url);

    // no longer loading 
    hideElement("loading-" + cityId);

    // see if forecast was succesfully recieved 
    if (response.ok) {
        const jsonResult = await response.json();
        displayForecast(cityId, jsonResult)
    }
    else {
        // display appropriate error message
        const errorId = "error-loading-" + cityId;
        showElement(errorId);
        showMessage(errorId, `Unable to load city "${city}".`)
    }
}



// display the message in the element
function showMessage(elementId, message) {
    document.getElementById(elementId).innerHTML = message;
}

// show the element
function showElement(elementId) {
    document.getElementById(elementId).classList.remove("hidden");
}

// hide the element 
function hideElement(elementId) {
    document.getElementById(elementId).classList.add("hidden");
}



// DISPLAYFORECAST() AND SUPPORTING FUNCTIONS

// display forecast recieved from JSON
function displayForecast(cityId, jsonResult) {
        showElement("results-" + cityId);

        const cityName = jsonResult.city.name;
        showMessage(cityId + "-name", cityName);

        // get 5-day forecast 
        const forecastMap = getSummaryForecast(jsonResult.list);

        // put forecast into city's table
        let day = 1;
        for (const date in forecastMap) {
            // only process the first 5 days
            if (day <= 5) {
                const dayForecast = forecastMap[date];
                showMessage(`${cityId}-day${day}-name`, getDayName(date));
                showMessage(`${cityId}-day${day}-high`, Math.round(dayForecast.high) + "&deg;");
                showMessage(`${cityId}-day${day}-low`, Math.round(dayForecast.low) + "&deg;");
                showImage(`${cityId}-day${day}-image`, dayForecast.weather);
            }
            day ++;
        }
    
}

// convert date string into mon, tue, ect
function getDayName(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { weekday: "short", timezone: "UTC"});
}

// show the weather image that matches the weatherType
function showImage(elementId, weatherType) {
    // images for various weather types
    const weatherImages = {
        Clear: "clear.png",
        Clouds: "clouds.png",
        Drizzle: "drizzle.png",
        Mist: "mist.png",
        Rain: "rain.png",
        Snow: "snow.png"
    };

    const imgUrl = "https://static-resources.zybooks.com/";
    const img = document.getElementById(elementId);
    img.src = imgUrl + weatherImages[weatherType];
    img.alt = weatherType;
}



// GETSUMMARYFORECAST FUNCTION 

// return map of objects that contain high, low, and weather for next 5 days
function getSummaryForecast(forecastList) {
    // map for storing high, low weather
    const forecast = {};

    // determine high and low for each day
    forecastList.forEach(function (item) {
        // extract just yyyy-mm-dd
        const date = item.dt_txt.substr(0, 10);

        // extract temp
        const temp = item.main.temp;

        // has this date been seen before?
        if (date in forecast) {
            // determine if temp is a new low or high 
            if (temp < forecast[date].low) {
                forecast[date].low = temp;
            }
            if (temp > forecast[date].high) {
                forecast[date].high = temp;
            }
        }
        else {
            // initialize new forecast
            const temps = {
                high: temp,
                low: temp,
                weather: item.weather[0].main
            }

            // add entry to map
            forecast[date] = temps;
        }
    });

    return forecast;
}