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
import { SceneController } from "@/entities/geometry/controllers/SceneController";
import { VHSGrid } from "@/entities/geometry/model/VHSGrid";
import { Cube, CompositeSphere } from "@/entities/geometry";
import { Fence } from "@/entities/geometry/model/Fence";
import { GeometryAnimation } from "@/entities/geometry/model/GeometryAnimation";
import { House } from "@/entities/geometry/model/House";
import { Tape } from "@/entities/geometry/model/Tape";
import { Clouds } from "@/entities/geometry/model/Clouds";
import { DOOR_CONSTANTS } from "../../../entities/geometry/utils/constants";

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

const container = ref<HTMLDivElement | null>(null);
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let sceneController: SceneController;
let vhsGrid: VHSGrid;
let animationFrameId: number;
let cube: Cube;
let sphere: CompositeSphere;
let fence: Fence;
let geometryAnimation: GeometryAnimation;
let house: House;
let tape: Tape;
let clouds: Clouds;
const isBehindHouse = ref(false);

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

  initLights();
  initObjects();
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
  // Создаем облака
  clouds = new Clouds();
  scene.add(clouds.mesh);

  // Создаем дом (который включает в себя дверь)
  house = new House();
  vhsGrid = new VHSGrid(house.door.getHeight());
  scene.add(vhsGrid.mesh);

  // Размещаем дом на уровне сетки, поднимая его на половину высоты
  house.mesh.position.set(0, vhsGrid.yPosition + house.getHeight() / 2, -2);
  scene.add(house.mesh);

  // Добавляем жёлтую ленту
  tape = new Tape(DOOR_CONSTANTS.MAX_DOOR_WIDTH * 2, 0.3);
  tape.mesh.position.set(0, vhsGrid.yPosition + 2, -2);
  scene.add(tape.mesh);

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
      house.door,
      house
    );
  }
};

const isPlayerBehindHouse = () => {
  const cameraPosition = camera.position;
  const housePosition = house.mesh.position;

  // Проверяем, находится ли камера за домом по оси Z
  return cameraPosition.z < housePosition.z - house.getDepth() / 2;
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  // Обновляем флаг положения игрока
  isBehindHouse.value = isPlayerBehindHouse();

  // Обновляем стены в зависимости от позиции игрока
  house.updateWalls(isBehindHouse.value);

  // Обновляем анимацию геометрических фигур
  geometryAnimation.update();

  // Обновляем ленту
  tape.update();

  // Обновляем облака
  clouds.update();

  // Обновляем контроллер сцены
  sceneController.update();

  vhsGrid.update();
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
