<template>
  <ThemeProvider>
    <MainContent />
    <div class="mobile-warning" v-if="isMobile">
      <div class="mobile-warning__content">
        <div class="mobile-warning__icon">📱</div>
        <h1 class="mobile-warning__title">
          Мобильная версия не поддерживается
        </h1>
        <p class="mobile-warning__text">
          К сожалению, наше приложение доступно только на десктопных
          устройствах. Пожалуйста, откройте сайт на компьютере для полноценной
          работы с 3D-геометрией.
        </p>
      </div>
    </div>
  </ThemeProvider>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import ThemeProvider from "./theme/ThemeProvider.vue";
import MainContent from "../pages/MainContent.vue";

const isMobile = ref(false);

const checkMobile = () => {
  isMobile.value = window.innerWidth <= 768;
};

onMounted(() => {
  checkMobile();
  window.addEventListener("resize", checkMobile);
});
</script>

<style scoped>
.mobile-warning {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(26, 26, 26, 0.2);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(8px);
  color: white;
  z-index: 9999;
  padding: 20px;
  box-sizing: border-box;
  text-align: center;
  font-family: Arial, sans-serif;
}

.mobile-warning__content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
  background-color: rgba(26, 26, 26, 0.9);
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.mobile-warning__icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.mobile-warning__title {
  font-size: 24px;
  margin-bottom: 15px;
  color: #ff4444;
}

.mobile-warning__text {
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 20px;
}
</style>
