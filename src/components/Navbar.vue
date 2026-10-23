<template>
  <div class="container p-2">
    <div class="row m-3">
      <div class="col-8 fw-bold ps-4">
        &gt; Ajay Chitambaran<span class="matrix-cursor">_</span>
      </div>
      <div class="col-4 text-end">
        <button
          class="mx-1 btn border"
          @click="store.toggleRain()"
          :title="matrixRain ? 'Take the blue pill' : 'Take the red pill'"
        >
          <i
            class="bi bi-capsule"
            :style="{ color: matrixRain ? '#3d7bff' : '#ff2a2a' }"
          ></i>
        </button>
      </div>
    </div>
  </div>
</template>
<script setup>
import { displayStore } from "../stores/displayStore.js";
import { storeToRefs } from "pinia";

const store = displayStore();
const { matrixRain } = storeToRefs(store);
</script>
