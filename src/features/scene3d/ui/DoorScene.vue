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
  Vector3,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Door } from "@/entities/geometry";
import { DoorController } from "@/entities/geometry/controllers/DoorController";
import { SceneController } from "@/entities/geometry/controllers/SceneController";
import { VHSGrid } from "@/entities/geometry/model/VHSGrid";
import { Cube, CompositeSphere } from "@/entities/geometry";
import { Fence } from "@/entities/geometry/model/Fence";
import { GeometryAnimation } from "@/entities/geometry/model/GeometryAnimation";

// Константы для настройки сцены
const CAMERA_FOV = 75;
const CAMERA_NEAR = 0.1;
const CAMERA_FAR = 1000;
const CAMERA_POSITION = new Vector3(0, 0, 5);
const SCENE_BACKGROUND = new Color(0x2c3e50);

// Константы для освещения
const AMBIENT_LIGHT_COLOR = 0xffffff;
const AMBIENT_LIGHT_INTENSITY = 0.5;
const DIRECTIONAL_LIGHT_COLOR = 0xffffff;
const DIRECTIONAL_LIGHT_INTENSITY = 1;
const DIRECTIONAL_LIGHT_POSITION = new Vector3(5, 5, 5);

// Константы для управления
const CONTROLS_DAMPING = 0.05;

const container = ref<HTMLDivElement | null>(null);
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let door: Door;
let doorController: DoorController;
let sceneController: SceneController;
let vhsGrid: VHSGrid;
let controls: OrbitControls;
let animationFrameId: number;
let cube: Cube;
let sphere: CompositeSphere;
let fence: Fence;
let geometryAnimation: GeometryAnimation;

const initScene = () => {
  if (!container.value) return;

  scene = new Scene();
  scene.background = SCENE_BACKGROUND;

  const aspect = container.value.clientWidth / container.value.clientHeight;
  camera = new PerspectiveCamera(CAMERA_FOV, aspect, CAMERA_NEAR, CAMERA_FAR);
  camera.position.copy(CAMERA_POSITION);
  camera.lookAt(0, 0, 0);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(container.value.clientWidth, container.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.value.appendChild(renderer.domElement);

  initControls();
  initLights();
  initObjects();
};

const initControls = () => {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = CONTROLS_DAMPING;
};

const initLights = () => {
  const ambientLight = new AmbientLight(
    AMBIENT_LIGHT_COLOR,
    AMBIENT_LIGHT_INTENSITY
  );
  scene.add(ambientLight);

  const directionalLight = new DirectionalLight(
    DIRECTIONAL_LIGHT_COLOR,
    DIRECTIONAL_LIGHT_INTENSITY
  );
  directionalLight.position.copy(DIRECTIONAL_LIGHT_POSITION);
  scene.add(directionalLight);
};

const initObjects = () => {
  door = new Door();
  doorController = new DoorController(door);
  scene.add(door.mesh);

  vhsGrid = new VHSGrid(door.getHeight());
  scene.add(vhsGrid.mesh);

  // Добавляем куб и составную сферу
  cube = new Cube(1);
  sphere = new CompositeSphere(0.7, 0.05, 200);
  scene.add(cube.mesh);
  scene.add(sphere.mesh);

  // Инициализируем анимацию геометрических фигур
  geometryAnimation = new GeometryAnimation(cube, sphere);

  // Добавляем забор на уровне сетки
  const gridSize = VHSGrid.GRID_SIZE;
  fence = new Fence(gridSize, gridSize, 1);
  fence.mesh.position.y = vhsGrid.yPosition;
  scene.add(fence.mesh);

  const axesHelper = new AxesHelper(5);
  scene.add(axesHelper);

  // Инициализируем контроллер сцены
  if (container.value) {
    sceneController = new SceneController(
      container.value,
      camera,
      renderer,
      door,
      doorController,
      controls
    );
  }
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  // Обновляем анимацию геометрических фигур
  geometryAnimation.update();

  vhsGrid.update();
  controls.update();
  renderer.render(scene, camera);
};

onMounted(() => {
  initScene();
  animate();
});

onBeforeUnmount(() => {
  if (sceneController) {
    sceneController.destroy();
  }
  cancelAnimationFrame(animationFrameId);
});
</script>

<style scoped>
div {
  width: 100%;
  height: 100%;
}
</style>
