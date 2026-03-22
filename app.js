const getApi = async () => {
  try {
    let response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=Delhi,IN&limit=5&appid=${CONFIG.API_KEY}`);
    let data = await response.json();

    if (!data || data.length === 0) {
      return;
    }

    let sampleLat = data[0].lat;
    let sampleLon = data[0].lon;
    let response2 = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${sampleLat}&lon=${sampleLon}&appid=${CONFIG.API_KEY}`);
    let data2 = await response2.json();

    console.log(data2);
  }
  catch (error) {
    console.error("Forecast test API failed:", error);
  }
};

let map = document.querySelector(".myFrame");
let lat, lon;
let currentWeatherData = null;
let forecastData = null;
let place = "";
let place_country = "";

let temp, tempF, humidity, windSpeed, visibility, pressure, direction, cloudiness, iconCode, iconUrl, cloudCondition;

let getLatLon = async (city, country) => {
  try {
    let response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city},${country}&limit=5&appid=${CONFIG.API_KEY}`);
    let data = await response.json();

    if (!data || data.length === 0) {
      alert("City not found! Please enter a valid city name.");
      return false;
    }

    lat = data[0].lat;
    lon = data[0].lon;
    return true;
  }
  catch (error) {
    alert("An error occurred while fetching data. Please try again later.");
    return false;
  }
};

function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          success(position);
          resolve(position);
        },
        (err) => {
          error();
          reject(err);
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
      reject(new Error("Geolocation not supported"));
    }
  });
}

function success(position) {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
}

function error() {
  alert("Sorry, no position available.");
}

let getWeather = async (lat, lon) => {
  try {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}`);
    let data = await response.json();

    currentWeatherData = data;
    temp = (data.main.temp - 273.15).toFixed(2);
    tempF = (data.main.feels_like - 273.15).toFixed(2);
    humidity = data.main.humidity;
    windSpeed = data.wind.speed;
    direction = data.wind.deg;
    visibility = data.visibility;
    pressure = data.main.pressure;
    cloudCondition = data.weather[0].description;
    iconCode = data.weather[0].icon;
    iconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
    cloudiness = data.clouds.all;
  }
  catch (error) {
    alert("An error occurred while fetching current weather. Please try again later.");
  }
};

let getForecast = async (lat, lon) => {
  try {
    let response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${CONFIG.API_KEY}`);
    let data = await response.json();

    forecastData = data;
    place = data.city.name;
    place_country = data.city.country;
  }
  catch (error) {
    alert("An error occurred while fetching forecast data. Please try again later.");
  }
};

async function loadWeatherData() {
  await getWeather(lat, lon);
  await getForecast(lat, lon);
  map.src = `https://maps.google.com/maps?q=${lat},${lon}&z=12&output=embed`;
  dataUpdate();
}

async function whenOpen() {
  let found = await getLatLon("Delhi", "IN");
  if (!found) {
    return;
  }
  await loadWeatherData();
}

whenOpen();

let dispDate = document.querySelector(".date");
let dispTime = document.querySelector(".time");

function updateDate() {
  const d = new Date();
  let year = d.getFullYear();
  let month = d.getMonth();
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let currDate = d.getDate();
  dispDate.innerText = `${currDate} ${months[month]} ${year}`;

  let minute = `${d.getMinutes()}`.padStart(2, "0");
  if (d.getHours() < 12 && d.getHours() >= 1) {
    dispTime.innerText = `${d.getHours()} : ${minute} AM`;
  }
  else if (d.getHours() === 0) {
    dispTime.innerText = `12 : ${minute} AM`;
  }
  else {
    let hour = d.getHours() - 12;
    if (hour === 0) {
      hour = 12;
    }
    dispTime.innerText = `${hour} : ${minute} PM`;
  }
}

updateDate();
setInterval(updateDate, 1000);

let dropdown = document.querySelectorAll(".country");
for (let select of dropdown) {
  for (let cname in countryCodes) {
    let newOption = document.createElement("option");
    newOption.innerText = countryCodes[cname];
    newOption.value = cname;
    select.append(newOption);
    if (countryCodes[cname] === "India") {
      newOption.selected = "selected";
    }
  }
}

let submitBtn = document.querySelector(".submit");
submitBtn.addEventListener("click", async () => {
  let inputBox = document.querySelector(".City");
  let inputVal = inputBox.value.trim();

  if (inputVal === "") {
    alert("Wrong input!\nEnter a city name");
    return;
  }

  if (/^\d+$/.test(inputVal)) {
    alert("Wrong input!\nEnter a valid city name, not a number");
    return;
  }

  let city = inputVal.charAt(0).toUpperCase() + inputVal.slice(1).toLowerCase();
  let countrySelect = document.querySelector(".country");
  let selectedCountryCode = countrySelect.value;
  let found = await getLatLon(city, selectedCountryCode);

  if (!found) {
    return;
  }

  await loadWeatherData();
});

let currLocationBtn = document.querySelector(".Set-location");
currLocationBtn.addEventListener("click", async () => {
  await getLocation();
  await loadWeatherData();
});

function getLocalDateFromUnix(unixTime, timezoneOffsetInSeconds = 0) {
  return new Date((unixTime + timezoneOffsetInSeconds) * 1000);
}

function updateTheme() {
  if (!currentWeatherData || !currentWeatherData.sys) {
    return;
  }

  let body = document.body;
  let logo = document.querySelector(".logo");
  let timezone = currentWeatherData.timezone || 0;
  let currentLocalTime = getLocalDateFromUnix(currentWeatherData.dt, timezone);
  let sunriseLocalTime = getLocalDateFromUnix(currentWeatherData.sys.sunrise, timezone);
  let sunsetLocalTime = getLocalDateFromUnix(currentWeatherData.sys.sunset, timezone);
  let noonLocalTime = new Date(currentLocalTime.getTime());
  noonLocalTime.setUTCHours(12, 0, 0, 0);

  if (currentLocalTime >= noonLocalTime && currentLocalTime < sunsetLocalTime) {
    body.style.backgroundColor = "rgba(152, 176, 133)";
    logo.style.backgroundImage = 'url("./afternoon-evening.png")';
  }
  else if (currentLocalTime >= sunriseLocalTime && currentLocalTime < noonLocalTime) {
    body.style.backgroundColor = "rgba(53, 130, 136)";
    logo.style.backgroundImage = 'url("./morning.png")';
  }
  else {
    body.style.backgroundColor = "#031528";
    logo.style.backgroundImage = 'url("night-2.png")';
  }
}

function formatUnixTime(unixTime, timezoneOffsetInSeconds = 0) {
  const localTime = new Date((unixTime + timezoneOffsetInSeconds) * 1000);
  let hours = localTime.getUTCHours();
  const minutes = `${localTime.getUTCMinutes()}`.padStart(2, "0");
  const suffix = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${suffix}`;
}

function formatForecastDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

function formatHour(hour) {
  if (hour === 0) {
    return "12:00 AM";
  }
  if (hour < 12) {
    return `${hour}:00 AM`;
  }
  if (hour === 12) {
    return "12:00 PM";
  }
  return `${hour - 12}:00 PM`;
}

function getClosestEntry(entries, targetHour) {
  return entries.reduce((closest, entry) => {
    let entryHour = new Date(entry.dt * 1000).getHours();
    let closestHour = new Date(closest.dt * 1000).getHours();

    if (Math.abs(entryHour - targetHour) < Math.abs(closestHour - targetHour)) {
      return entry;
    }
    return closest;
  });
}

function buildForecastDays(list) {
  const dayParts = [
    { label: "Morning", targetHour: 6 },
    { label: "Afternoon", targetHour: 12 },
    { label: "Evening", targetHour: 18 },
    { label: "Night", targetHour: 21 }
  ];

  let groupedByDate = {};

  for (let item of list) {
    let dateKey = item.dt_txt.split(" ")[0];
    if (!groupedByDate[dateKey]) {
      groupedByDate[dateKey] = [];
    }
    groupedByDate[dateKey].push(item);
  }

  return Object.keys(groupedByDate).slice(0, 5).map((dateKey) => {
    let entries = groupedByDate[dateKey];
    let periods = dayParts.map((dayPart) => {
      let matchedEntry = getClosestEntry(entries, dayPart.targetHour);
      let entryHour = new Date(matchedEntry.dt * 1000).getHours();

      return {
        label: dayPart.label,
        time: formatHour(entryHour),
        temp: `${(matchedEntry.main.temp - 273.15).toFixed(1)}&deg;C`,
        visibility: `${matchedEntry.visibility} m`,
        wind: `${matchedEntry.wind.speed} m/s`,
        description: matchedEntry.weather[0].description,
        icon: `https://openweathermap.org/img/wn/${matchedEntry.weather[0].icon}@2x.png`
      };
    });

    return {
      date: formatForecastDate(dateKey),
      periods
    };
  });
}

function renderForecast() {
  let forecastGrid = document.querySelector(".forecast-grid");
  if (!forecastGrid || !forecastData || !forecastData.list) {
    return;
  }

  let dailyForecast = buildForecastDays(forecastData.list);

  forecastGrid.innerHTML = dailyForecast.map((day) => {
    let periodsMarkup = day.periods.map((period) => `
      <div class="forecast-slot">
        <div class="forecast-slot-top">
          <p class="forecast-period">${period.label}</p>
          <p class="forecast-time">${period.time}</p>
        </div>
        <div class="forecast-slot-main">
          <img src="${period.icon}" alt="${period.description}">
          <div>
            <p class="forecast-temp">${period.temp}</p>
            <p class="forecast-desc">${period.description}</p>
          </div>
        </div>
        <p class="forecast-meta"><i class="fa-solid fa-eye"></i> ${period.visibility}</p>
        <p class="forecast-meta"><i class="fa-solid fa-wind"></i> ${period.wind}</p>
      </div>
    `).join("");

    return `
      <article class="forecast-card">
        <p class="forecast-date">${day.date}</p>
        <div class="forecast-slots">
          ${periodsMarkup}
        </div>
      </article>
    `;
  }).join("");
}

function dataUpdate() {
  document.querySelector(".Humidity").innerHTML = `<i class="fa-solid fa-droplet"></i> Humidity: ${humidity}%`;
  document.querySelector(".wind").innerHTML = `<i class="fa-solid fa-wind"></i> Wind Speed: ${windSpeed} m/s`;
  document.querySelector(".Visibility").innerHTML = `<i class="fa-solid fa-eye"></i> Visibility: ${visibility} meters`;
  document.querySelector(".cloudiness").innerHTML = `<i class="fa-regular fa-cloud"></i> Cloudiness: ${cloudiness}%`;
  document.querySelector(".dir").innerHTML = `<i class="fa-regular fa-compass"></i> Direction: ${direction}&deg;`;
  document.querySelector(".pressure").innerHTML = `<i class="fa-solid fa-thermometer"></i> Pressure: ${pressure} hPa`;
  document.querySelector(".temprature").innerHTML = `<i class="fa-solid fa-temperature-high"></i> Temprature : ${temp}&deg;C`;
  document.querySelector(".feels-like").innerHTML = `<i class="fa-solid fa-temperature-high"></i> Feels like : ${tempF}&deg;C`;
  document.querySelector(".cloud").innerHTML = `<p>Cloud Condition:</p><img src="${iconUrl}" alt="${cloudCondition}"> <p>${cloudCondition}</p>`;
  document.querySelector(".name-detail").innerText = `${place} , ${place_country}`;
  document.querySelector(".city-info").innerText = `Longitude : ${lon.toFixed(2)}\nLatitude : ${lat.toFixed(2)}`;

  if (currentWeatherData && currentWeatherData.sys) {
    let timezone = currentWeatherData.timezone || 0;
    document.querySelector(".sun-info").innerHTML = `
      <img class="sunrise" src="sunrise(1).png" alt="Sunrise"/>
      <p>Sunrise: ${formatUnixTime(currentWeatherData.sys.sunrise, timezone)}</p>
      <img class="sunset" src="sunset(1).png" alt="Sunset"/>
      <p>Sunset: ${formatUnixTime(currentWeatherData.sys.sunset, timezone)}</p>
    `;
  }

  updateTheme();
  renderForecast();
}
