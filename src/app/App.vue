<template>
  <ThemeProvider>
    <MainContent />
    <!-- <TechMarquee /> -->
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from "./theme/ThemeProvider.vue";
import MainContent from "../pages/MainContent.vue";
// import { TechMarquee } from "../entities/tech-marquee";
</script>
