<template>
  <div class="frame">
    <div class="frame__inner">
      <div class="frame__ornament frame__ornament--top"></div>
      <div class="frame__ornament frame__ornament--bottom"></div>
      <div class="frame__ornament frame__ornament--left"></div>
      <div class="frame__ornament frame__ornament--right"></div>
      <div class="frame__signature">
        <div class="signature">
          <div class="signature__title">Three Geometry</div>
          <div class="signature__year">E. Belousov - 2025</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.frame {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1000;
}

.frame__inner {
  position: absolute;
  inset: clamp(40px, 5vw, 120px);
  border: 4px solid #8b4513;
  box-shadow: 0 0 0 clamp(40px, 5vw, 120px) rgba(0, 0, 0, 0.3),
    inset 0 0 20px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.frame__ornament {
  position: absolute;
  background: linear-gradient(45deg, #d2691e, #cd853f);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.3);
}

.frame__ornament::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    45deg,
    rgba(0, 0, 0, 0.1) 0px,
    rgba(0, 0, 0, 0.1) 1px,
    transparent 1px,
    transparent 4px
  );
  pointer-events: none;
}

.frame__ornament--top,
.frame__ornament--bottom {
  left: 50%;
  transform: translateX(-50%);
  width: 60%;
  height: 20px;
}

.frame__ornament--left,
.frame__ornament--right {
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 60%;
}

.frame__ornament--top {
  top: -10px;
  border-radius: 10px 10px 0 0;
}

.frame__ornament--bottom {
  bottom: -10px;
  border-radius: 0 0 10px 10px;
}

.frame__ornament--left {
  left: -10px;
  border-radius: 10px 0 0 10px;
}

.frame__ornament--right {
  right: -10px;
  border-radius: 0 10px 10px 0;
}

.frame__signature {
  position: absolute;
  bottom: -100px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #8b4513;
  font-family: "Playfair Display", serif;
  pointer-events: none;
}

.signature {
  font-family: "Playfair Display", serif;
  text-align: center;
}

.signature__title {
  font-size: 2rem;
  font-weight: 500;
  color: #8b4513;
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.signature__year {
  font-size: 1.5rem;
  color: #a0522d;
  font-style: italic;
}
</style>
