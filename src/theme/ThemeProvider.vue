<template>
  <slot></slot>
</template>

<script setup lang="ts">
import { provide } from "vue";
import { theme } from "./theme";

provide("theme", theme);
</script>

<script lang="ts">
export default {
  name: "ThemeProvider",
};
</script>
