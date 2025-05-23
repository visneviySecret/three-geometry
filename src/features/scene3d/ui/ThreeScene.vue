<template>
  <div ref="container"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
} from "three";
import { Cube, Sphere } from "@/entities/geometry";

const container = ref<HTMLDivElement | null>(null);
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let cube: Cube;
let sphere: Sphere;
let animationFrameId: number;

const init = () => {
  if (!container.value) return;

  scene = new Scene();

  camera = new PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Создаем рендерер
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  container.value.appendChild(renderer.domElement);

  const ambientLight = new AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Создаем и добавляем фигуры
  cube = new Cube(1);
  sphere = new Sphere(0.7);

  cube.setPosition(-1.5, 0, 0);
  sphere.setPosition(1.5, 0, 0);

  scene.add(cube.mesh);
  scene.add(sphere.mesh);
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  renderer.render(scene, camera);
};

const handleResize = () => {
  if (!container.value || !camera || !renderer) return;

  camera.aspect = container.value.clientWidth / container.value.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
};

onMounted(() => {
  init();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationFrameId);
  window.removeEventListener("resize", handleResize);
});
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
