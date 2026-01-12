<template>
  <div class="container p-2 border d-none d-md-block" v-if="allCompleted">
    <div class="row">
      <div class="col-md-1 align-contents-center p-3 text-center">
        <i class="bi bi-sun fs-2" v-if="weatherData.current.rain === 0"></i>
        <i v-else class="bi bi-cloud fs-2"></i>
        <br />
        <span class="fs-6 fst-italic fw-lighter">{{
          wmoWeatherCodes[weatherData?.current.weather_code]
        }}</span>
      </div>
      <div class="col-md-1 align-contents-center p-3 text-center">
        <span class="fs-4">{{ weatherData?.current.temperature_2m }}</span>
        {{ weatherData?.current_units.temperature_2m }}<br />
        <span class="fs-6 fw-light">{{ city?.name }}</span>
        <br />
        <span class="fs-6 fw-light">{{ city?.state }}</span>
      </div>
      <div
        class="col"
        :class="{
          flash: isFlashing && isDarkMode,
          flashDay: isFlashing && !isDarkMode,
        }"
      >
        <div class="p-2">
          <span class="fw-bold fs-5">{{ news[currentIndex]?.title }}</span>
          <br />
          <span class="fw-light fs-6">{{
            news[currentIndex]?.description
          }}</span>
        </div>
      </div>
    </div>
    <!-- {{ city }} -->
    <br />
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";

import { wmoWeatherCodes } from "../services/wmo_codes.js";
import { displayStore } from "../stores/displayStore.js";
import { storeToRefs } from "pinia";
const store = displayStore();
const { isDarkMode } = storeToRefs(store);
const isNightMode = ref(true);

const location = ref(null);
const errors = ref(null);
const city = ref(null);
const weatherData = ref(null);
const news = ref([]);
const currentIndex = ref(0);
const isFlashing = ref(false);
const locationCompleted = ref(false);
const weatherCompleted = ref(false);
const newsCompleted = ref(false);
const allCompleted = ref(false);

onMounted(() => {
  getLocation();
  setTimeout(() => {
    startFlash();
  }, 5000);
});

const getLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      location.value = {
        la: pos.coords.latitude,
        lo: pos.coords.longitude,
        full: pos,
      };
      setTimeout(() => {
        getCity();
        // getNews();
      }, 500);
    },
    (err) => {
      error.value = err.message;
    }
  );
};

const getCity = () => {
  try {
    fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${location.value.la}&lon=${location.value.lo}&format=json`
    )
      .then((res) => res.json())
      .then((data) => {
        city.value = {
          country_code: data.address.country_code,
          country: data.address.country,
          name: data.address.residential,
          state: data.address.state,
        };
        locationCompleted.value = true;
        getWeatherData(location.value.la, location.value.lo);
        getNews();
      })
      .catch((err) => {
        console.log(err);
      });
  } catch (error) {
    console.log(error);
  }
};

const getWeatherData = async (lat, lon) => {
  try {
    const response = await axios.get(`https://api.open-meteo.com/v1/forecast`, {
      params: {
        latitude: lat,
        longitude: lon,
        current: "temperature_2m,is_day,rain,weather_code",
        hourly: "temperature_2m,weather_code,rain",
        daily: "temperature_2m_max,temperature_2m_min",
        forecast_days: 1,
        timezone: "auto",
      },
    });

    weatherData.value = response.data;
    weatherCompleted.value = true;
  } catch (error) {
    console.error("Weather API error:", error);
    throw error;
  }
};

const getNews = async () => {
  try {
    const response = await axios.get(`https://newsdata.io/api/1/latest?
    apikey=pub_c21b9938c7b444b3b915d82d5d3bba9e
    &language=en
    &category=breaking,business,technology,sports,science
    &prioritydomain=top
    &removeduplicate=1
    &country=${city.value.country_code}`);
    news.value = response.data.results;
    newsCompleted.value = true;
  } catch (error) {
    console.log(error);
  }
};

const startFlash = () => {
  setInterval(() => {
    isFlashing.value = true;
    currentIndex.value = (currentIndex.value + 1) % 10;
    setTimeout(() => {
      isFlashing.value = false;
    }, 500);
  }, 10000);
  if (currentIndex === 9) {
    setTimeout(() => {
      getNews();
    }, 5000);
  }
};

watch(
  [locationCompleted, weatherCompleted, newsCompleted],
  ([isLocationStatus, isWeatherCompleted, isNewsCompleted]) => {
    if (isLocationStatus && isWeatherCompleted && isNewsCompleted) {
      allCompleted.value = true;
    }
  }
);
</script>

<style>
.flash {
  animation: flashEffect 0.1s ease-in-out;
}

.flashDay {
  animation: flashEffectDay 0.1s ease-in-out;
}

@keyframes flashEffect {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: #eeeeee;
    box-shadow: 0 0 20px black;
  }
  100% {
    background-color: transparent;
  }
}

@keyframes flashEffectDay {
  0% {
    background-color: transparent;
  }
  50% {
    background-color: black;
    box-shadow: 0 0 20px #eeeeee;
  }
  100% {
    background-color: transparent;
  }
}
</style>
