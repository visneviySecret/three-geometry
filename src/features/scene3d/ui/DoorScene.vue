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
  Color,
  AxesHelper,
  Raycaster,
  Vector2,
  Vector3,
  Mesh,
  Plane,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Door } from "@/entities/geometry";

const container = ref<HTMLDivElement | null>(null);
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let door: Door;
let controls: OrbitControls;
let raycaster: Raycaster;
let mouse: Vector2;
let selectedHandle: Mesh | null = null;
let resizePlane: Plane;
let animationFrameId: number;

const init = () => {
  if (!container.value) return;

  scene = new Scene();
  scene.background = new Color(0x2c3e50);

  camera = new PerspectiveCamera(
    75,
    container.value.clientWidth / container.value.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0, 5);
  camera.lookAt(0, 0, 0);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  raycaster = new Raycaster();
  mouse = new Vector2();
  resizePlane = new Plane(new Vector3(0, 0, 1), 0);

  const ambientLight = new AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  door = new Door();
  scene.add(door.mesh);

  const axesHelper = new AxesHelper(5);
  scene.add(axesHelper);

  container.value.addEventListener("mousedown", onMouseDown);
  container.value.addEventListener("mousemove", onMouseMove);
  container.value.addEventListener("mouseup", onMouseUp);
};

const onMouseDown = (event: MouseEvent) => {
  if (!container.value) return;

  const rect = container.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1;
  mouse.y =
    -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(door.getResizeHandles());

  if (intersects.length > 0) {
    selectedHandle = intersects[0].object as Mesh;
    controls.enabled = false;
    if (container.value) {
      container.value.style.cursor = "grabbing";
    }
  }
};

const onMouseMove = (event: MouseEvent) => {
  if (!container.value) return;

  const rect = container.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1;
  mouse.y =
    -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  if (selectedHandle) {
    const intersection = new Vector3();
    raycaster.ray.intersectPlane(resizePlane, intersection);

    if (
      Math.abs(selectedHandle.position.x) > Math.abs(selectedHandle.position.y)
    ) {
      // Горизонтальное изменение размера
      const newWidth = Math.abs(intersection.x * 2);
      door.resize("width", Math.max(0.5, newWidth));
    } else {
      // Вертикальное изменение размера
      const newHeight = Math.abs(intersection.y * 2);
      door.resize("height", Math.max(0.5, newHeight));
    }
  } else {
    const intersects = raycaster.intersectObjects(door.getResizeHandles());
    if (container.value) {
      container.value.style.cursor = intersects.length > 0 ? "grab" : "auto";
    }
  }
};

const onMouseUp = () => {
  if (container.value) {
    container.value.style.cursor = "auto";
  }
  selectedHandle = null;
  controls.enabled = true;
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

const handleResize = () => {
  if (!container.value || !camera || !renderer) return;
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
};

onMounted(() => {
  init();
  animate();
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  if (container.value) {
    container.value.removeEventListener("mousedown", onMouseDown);
    container.value.removeEventListener("mousemove", onMouseMove);
    container.value.removeEventListener("mouseup", onMouseUp);
  }
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
