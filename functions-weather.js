// DOM handlers and listeners
window.addEventListener("DOMContentLoaded", domLoaded)

function domLoaded() {
    document.getElementById("city1").addEventListener("input", cityInput);
    document.getElementById("city2").addEventListener("input", cityInput);
    document.getElementById('compareBtn').addEventListener("click", compareBtnClick)
}

// compare button callback and supporting code

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

// request this city's forecast 
function getWeatherForecast(city, cityId) {
    //todo implement function
}

// display the text in the element
function showText(elementId, text) {
    document.getElementById(elementId).innerHTML = text;
}

// show the element
function showElement(elementId) {
    document.getelementByIt(elementId).classList.remove("hidden");
}

// hide the element 
function hideElement(elementId) {
    document.getElementById(elementId).classList.add("hidden");
}



