# Check Weather

`Check Weather` is a weather web app that shows current weather details, sunrise and sunset times, location map, and a 5-day forecast for any city.

## Features

- Search weather by city and country
- Get weather for your current location
- View current temperature and feels-like temperature
- See humidity, wind speed, pressure, visibility, cloudiness, and wind direction
- View sunrise and sunset times based on live API data
- See a 5-day forecast with 4 time periods for each day:
  - Morning
  - Afternoon
  - Evening
  - Night
- Dynamic theme changes based on local time:
  - Night theme from sunset to sunrise
  - Morning theme from sunrise to 12 PM
  - Afternoon/evening theme from 12 PM to sunset
- Embedded Google Map for the selected location

## Tech Stack

- HTML
- CSS
- JavaScript
- OpenWeather API
- Google Maps Embed


## Project Structure

```text
Check Weather/
├── index.html
├── style.css
├── app.js
├── config.js
├── countryList.js
├── morning.png
├── afternoon-evening.png
├── night-2.png
├── sunrise(1).png
└── sunset(1).png
```

## Setup

1. Clone or download the project.
2. Get your API key from OpenWeather.
3. Create a `config.js` file in the project folder.
4. Add your API key in this format:

```js
const CONFIG = {
  API_KEY: "your_openweather_api_key"
};
```

5. Make sure these image files are present in the root folder:
   - `morning.png`
   - `afternoon-evening.png`
   - `night-2.png`
   - `sunrise(1).png`
   - `sunset(1).png`
6. Open `index.html` in your browser.

## APIs Used

### 1. Geocoding API
Used to convert city and country into latitude and longitude.

```text
https://api.openweathermap.org/geo/1.0/direct?q={city},{country}&limit=5&appid={API_KEY}
```

### 2. Current Weather API
Used to fetch current weather details.

```text
https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}
```

### 3. 5 Day / 3 Hour Forecast API
Used to fetch forecast data and build the 5-day forecast section.

```text
https://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}
```

## How It Works

- The app first gets latitude and longitude from the city name.
- It fetches current weather data for live weather information.
- It fetches 5-day forecast data and groups it into daily cards.
- For each day, it selects forecast entries closest to:
  - `6 AM` for Morning
  - `12 PM` for Afternoon
  - `6 PM` for Evening
  - `9 PM` for Night
- The background color and logo image change based on the selected location's local time:
  - `Sunset to Sunrise` -> Night theme
  - `Sunrise to 12 PM` -> Morning theme
  - `12 PM to Sunset` -> Afternoon/evening theme

## Notes

- Temperature from the API is converted from Kelvin to Celsius.
- Sunrise and sunset are shown using the city's local timezone.
- Geolocation access is required for the `Current Location` feature.
