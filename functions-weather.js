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
        showText("loading-city1", `Loading ${city1}...`);
        showElement("loading-city2");
        showText("loading-city2", `Loading ${city2}...`);
        hideElement("results-city1");
        hideElement("results-city2");

        // fetch forecast
        getWeatherForecast(city1, "city1");
        getWeatherForecast(city2, "city2");
    }
}



// REQUEST CITY FORECAST
function getWeatherForecast(city, cityId) {
    // create a URL to accesss the web API
    const endpoint = "https://api.openweathermap.org/data/2.5/forecast";
    const apiKey = "9635fc8c9579f24276dbd3d7902e9c7f";
    const queryString = `q=${encodeURI(city)}&units=imperial&appid=${apiKey}`;
    const url  = `${endpoint}?${queryString}`;

    // use XMLHttpRequest tp may http request to web API
    const xhr = new XMLHttpRequest();

    // call responseRecieved() when response is recieved
    xhr.addEventListener("load", function () {
        responseRecieved(xhr, cityId, city)
    });

    // JSON response needs to be converted into an object
    xhr.responseType = "json";

    // send request
    xhr.open("GET", url);
    xhr.send();
}



// display the text in the element
function showText(elementId, text) {
    document.getElementById(elementId).innerHTML = text;
}

// show the element
function showElement(elementId) {
    document.getElementById(elementId).classList.remove("hidden");
}

// hide the element 
function hideElement(elementId) {
    document.getElementById(elementId).classList.add("hidden");
}



// RESPONSERECEIVED() AND SUPPORTING FUNCTIONS

// display forecast recieved from JSON
function responseRecieved(xhr, cityId, city) {
    // no longer loading
    hideElement("loading-" + cityId);

    // 200 status indicates forecast successfully recieved 
    if (xhr.status === 200) {
        showElement("results-" + cityId);

        const cityName = xhr.response.city.name;
        showText(cityId + "-name", cityName);

        // get 5-day forecast 
        const forecast = getSummaryForecast(xhr.response.list);

        // put forecast into city's table
        let day = 1;
        for (const date in forecast) {
            // only process the first 5 days
            if (day <= 5) {
                showText(`${cityId}-day${day}-name`, getDayName(date));
                showText(`${cityId}-day${day}-high`, Math.round(forecast[date].high) + "&deg;");
                showText(`${cityId}-day${day}-low`, Math.round(forecast[date].low) + "&deg;");
                showImage(`${cityId}-day${day}-image`, forecast[date].weather);
            }
            day ++;
        }
    }
    else {
        // display appropriate error message
        const errorId = "error-loading-" + cityId;
        showElement(errorId);
        showText(errorId, `Unable to load city "${city}".`);
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
    const forecast = [];

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