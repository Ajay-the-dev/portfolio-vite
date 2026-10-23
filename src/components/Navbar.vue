<template>
  <nav class="corners" aria-label="Main">
    <router-link to="/" class="corner tl" exact-active-class="active">
      Ajay
    </router-link>

    <div class="corner tr">
      <router-link to="/history" exact-active-class="active">History</router-link>
      <router-link to="/projects" exact-active-class="active">Work</router-link>
    </div>

    <router-link to="/services" class="corner bl" exact-active-class="active">
      Stack
    </router-link>

    <span class="credit d-none d-md-block">
      &copy; {{ year }} <span>Ajay Chitambaran</span>
    </span>

    <div class="corner br">
      <span class="status">Available <i class="dot"></i></span>
      <router-link to="/about" exact-active-class="active">Meet</router-link>
    </div>
  </nav>
</template>
<script setup>
const year = new Date().getFullYear();
</script>

<style>
.corners {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
}

.corner {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  pointer-events: auto;
}

.corner,
.corner a {
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--accent);
}

.corner a:hover,
a.corner:hover {
  color: #ff7878;
}

.corner .active,
a.corner.active {
  color: var(--text);
}

.tl {
  top: 1.5rem;
  left: 1.5rem;
}
.tr {
  top: 1.5rem;
  right: 1.5rem;
}
.bl {
  bottom: 1.5rem;
  left: 1.5rem;
}
.br {
  bottom: 1.5rem;
  right: 1.5rem;
}

.status {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: none;
  color: var(--muted);
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--available);
  box-shadow: 0 0 8px var(--available);
}

.credit {
  position: absolute;
  bottom: 1.6rem;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.7rem;
  color: #5c2222;
}

.credit span {
  color: var(--muted);
}
</style>
