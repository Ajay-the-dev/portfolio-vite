<template>
  <div class="container p-2">
    <div class="row m-3">
      <div class="col-6 fw-bold ps-4">Ajay Chitambaran</div>
      <div class="col-6 text-end">
        <div class="dropdown">
          <button
            hidden
            :class="
              isNightMode ? 'btn btn-dark dropdown-toggle border' : 'btn border'
            "
            type="button"
            id="dropdownMenuButton1"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Home
          </button>
          <ul
            class="dropdown-menu bg-dark"
            aria-labelledby="dropdownMenuButton1"
          >
            <li class="bg-dark border">
              <a class="dropdown-item text-white text-darker" href="#">Home</a>
            </li>
          </ul>
          <button
            :class="isNightMode ? 'mx-1 btn btn-dark border' : 'btn border'"
            @click="toggleDays"
          >
            <i
              class="bi bi-sun"
              v-if="isNightMode"
              title="Turn on Day mode"
            ></i>
            <i class="bi bi-moon" v-else title="Turn on Night mode"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { onMounted, ref, watch } from "vue";
import { displayStore } from "../stores/displayStore.js";

const store = displayStore();

const isNightMode = ref(true);

onMounted(() => {
  isNightMode.value = store.getLightMode();
  // console.log("updated with :" + isNightMode.value);
});

const toggleDays = () => {
  isNightMode.value = !isNightMode.value;
  store.toggleLightMode();
};
</script>

<style>
.text-darker:hover {
  color: black;
}
</style>
