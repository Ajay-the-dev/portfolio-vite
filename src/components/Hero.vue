<template>
  <section class="hero">
    <!-- floating cards (desktop) -->
    <div class="hero-card card-left d-none d-xl-block" aria-hidden="true">
      <span class="pixel-mark" style="top: -7px; right: -7px"></span>
      <pre class="code"><span class="c">// ajay.js</span>
<span class="k">const</span> ajay = {
  role: <span class="s">"Full-Stack"</span>,
  stack: [<span class="s">"Vue"</span>, <span class="s">"PHP"</span>,
          <span class="s">"Laravel"</span>, <span class="s">"Docker"</span>],
  based: <span class="s">"Dubai, UAE"</span>,
};</pre>
    </div>
    <div class="hero-card card-right d-none d-xl-block" aria-hidden="true">
      <span class="pixel-mark" style="bottom: -7px; left: -7px"></span>
      <div class="stack-grid">
        <img v-for="logo in logos" :key="logo" :src="logo" alt="" />
      </div>
    </div>

    <div class="hero-copy text-center">
      <p class="font-mono eyebrow mb-4">Ajay Chitambaran · Web Developer</p>
      <h1 class="font-display hero-title">
        I build things<br />that ship
      </h1>
      <p class="hero-sub mx-auto">
        Full-stack developer focused on clean code, scalable systems, and
        modern web technologies.
      </p>

      <div class="d-flex align-items-center justify-content-center gap-3 mt-4">
        <router-link to="/projects" class="pill-btn">
          See my work
          <span class="pill-icon"><i class="bi bi-arrow-up-right"></i></span>
        </router-link>
        <a
          class="social"
          href="https://www.linkedin.com/in/ajaychitambaran/"
          target="_blank"
          title="LinkedIn"
          ><i class="bi bi-linkedin"></i
        ></a>
        <a
          class="social"
          href="https://github.com/Ajay-the-dev"
          target="_blank"
          title="GitHub"
          ><i class="bi bi-github"></i
        ></a>
      </div>
    </div>

    <div class="mt-5">
      <Cube />
    </div>
  </section>

  <div class="marquee font-mono" aria-label="Talk is cheap, show me the code.">
    <div class="marquee-track" aria-hidden="true">
      <span v-for="n in 8" :key="n">
        Talk is cheap, show me the code. <i class="bi bi-code-slash"></i>
      </span>
    </div>
  </div>
</template>
<script setup>
import Cube from "./techStack.vue";

const devicon = (name) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${name}/${name}-original.svg`;

const logos = [
  "vuejs",
  "javascript",
  "php",
  "laravel",
  "mysql",
  "nodejs",
  "docker",
  "github",
  "html5",
].map(devicon);
</script>

<style>
.hero {
  position: relative;
  min-height: 68vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 5rem 0 2rem;
}

.hero-copy {
  position: relative;
  z-index: 1;
}

.eyebrow {
  font-size: 0.75rem;
  color: var(--accent);
}

.hero-title {
  font-size: clamp(3.75rem, 11vw, 9rem);
  text-transform: uppercase;
  margin: 0;
  color: var(--text);
}

.hero-sub {
  max-width: 32rem;
  margin-top: 1.5rem;
  color: var(--muted);
  font-weight: 300;
}

.social {
  display: grid;
  place-items: center;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 50%;
  border: 1px solid var(--line);
  color: var(--muted);
  transition: color 0.2s ease, border-color 0.2s ease;
}

.social:hover {
  color: var(--text);
  border-color: var(--accent);
}

.hero-card {
  position: absolute;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: 0 30px 60px -30px rgba(0, 0, 0, 0.6);
}

.card-left {
  top: -1rem;
  left: 0;
  transform: rotate(-3deg);
}

.card-right {
  bottom: 10%;
  right: 0;
  transform: rotate(3deg);
}

.code {
  margin: 0;
  padding: 1.25rem 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  line-height: 1.6;
  color: var(--text);
}

.code .c {
  color: var(--muted);
}
.code .k {
  color: var(--accent);
}
.code .s {
  color: #c3b8ff;
}
[data-bs-theme="light"] .code .s {
  color: #7a3fd1;
}

.stack-grid {
  display: grid;
  grid-template-columns: repeat(3, 44px);
  gap: 18px;
  padding: 1.5rem;
}

.stack-grid img {
  width: 44px;
  height: 44px;
  filter: grayscale(100%);
  opacity: 0.8;
  transition: filter 0.3s ease, opacity 0.3s ease;
}

.stack-grid img:hover {
  filter: none;
  opacity: 1;
}

.marquee {
  overflow: hidden;
  margin: 2rem -3rem 7rem;
  padding: 1rem 0;
  border-block: 1px solid var(--line);
  color: var(--muted);
  font-size: 0.85rem;
  white-space: nowrap;
}

.marquee-track {
  display: inline-flex;
  gap: 2rem;
  animation: marquee 30s linear infinite;
}

.marquee-track i {
  color: var(--accent);
  margin-left: 1.5rem;
}

@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee-track {
    animation: none;
  }
}

@media (min-width: 768px) {
  .marquee {
    margin-bottom: 2rem;
  }
}
</style>
