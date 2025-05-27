<template>
  <Transition name="manual">
    <div class="manual" v-if="isVisible">
      <div class="manual__content">
        <div class="manual__header">
          <h2 class="manual__title">Управление</h2>
          <button class="manual__close" @click="close">×</button>
        </div>
        <div class="manual__body">
          <div class="manual__section">
            <div class="manual__controls">
              <div class="manual__control">
                <div class="manual__key">W</div>
                <div class="manual__description">Вперед</div>
              </div>
              <div class="manual__control">
                <div class="manual__key">S</div>
                <div class="manual__description">Назад</div>
              </div>
              <div class="manual__control">
                <div class="manual__key">A</div>
                <div class="manual__description">Влево</div>
              </div>
              <div class="manual__control">
                <div class="manual__key">D</div>
                <div class="manual__description">Вправо</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const isVisible = ref(false);
let inactivityTimer: number | null = null;
let hasMoved = false;
let hasShownManual = false;

const close = () => {
  isVisible.value = false;
  hasShownManual = true;
};

const handleKeyPress = (e: KeyboardEvent) => {
  if (e.key === "Escape") {
    close();
  }

  // Проверяем нажатие клавиш WASD и ЦФЫВ
  const movementKeys = ["w", "a", "s", "d", "ц", "ф", "ы", "в"];
  if (movementKeys.includes(e.key.toLowerCase())) {
    hasMoved = true;
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
  }
};

const startInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }

  inactivityTimer = window.setTimeout(() => {
    if (!hasMoved && !hasShownManual) {
      isVisible.value = true;
    }
  }, 10000); // 10 секунд
};

onMounted(() => {
  document.addEventListener("keydown", handleKeyPress);
  startInactivityTimer();
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeyPress);
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
  }
});
</script>

<style scoped>
.manual {
  position: fixed;
  bottom: calc(40px + clamp(40px, 5vw, 120px));
  left: calc(40px + clamp(40px, 5vw, 120px));
  z-index: 1000;
  pointer-events: none;
}

.manual__content {
  position: relative;
  background: rgba(26, 26, 26, 0.4);
  border: 4px solid #8b4513;
  border-radius: 16px;
  padding: 2rem;
  width: 500px;
  color: #fff;
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(4px);
  pointer-events: auto;
  transform-origin: bottom left;
}

/* Анимации появления/исчезновения */
.manual-enter-active,
.manual-leave-active {
  transition: all 2s cubic-bezier(0.4, 0, 0.2, 1);
}

.manual-enter-from,
.manual-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

.manual-enter-to,
.manual-leave-from {
  opacity: 1;
  transform: scale(1);
}

.manual__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.25rem;
}

.manual__title {
  font-size: 2.2rem;
  color: #c7641d;
  margin: 0;
  font-family: "Playfair Display", serif;
}

.manual__close {
  background: none;
  border: none;
  color: #8b4513;
  font-size: 2.6rem;
  cursor: pointer;
  padding: 0.5rem;
  line-height: 1;
  transition: transform 0.2s ease;
}

.manual__close:hover {
  transform: scale(1.1);
}

.manual__controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.manual__control {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.manual__key {
  background: #2a2a2a;
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  min-width: 4rem;
  text-align: center;
  font-family: monospace;
  font-size: 2rem;
  color: #a0522d;
  transition: all 0.2s ease;
}

.manual__key:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(139, 69, 19, 0.3);
}

.manual__description {
  color: #fff;
  font-size: 2rem;
}
</style>
