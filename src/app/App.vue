<template>
  <ThemeProvider>
    <MainContent />
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from "./theme/ThemeProvider.vue";
import MainContent from "../pages/MainContent.vue";
</script>
