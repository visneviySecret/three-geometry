<template>
  <ThemeProvider>
    <MainContent />
    <MobileWarning />
  </ThemeProvider>
</template>

<script setup lang="ts">
import ThemeProvider from "./theme/ThemeProvider.vue";
import MainContent from "../pages/MainContent.vue";
import { MobileWarning } from "@/widgets/mobile-warning";
</script>
