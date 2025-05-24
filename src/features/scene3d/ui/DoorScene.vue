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
  BoxGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Door } from "@/entities/geometry";
import { DoorController } from "@/entities/geometry/controllers/DoorController";
import { VHSGrid } from "@/entities/geometry/model/VHSGrid";
import { Cube, Sphere } from "@/entities/geometry";

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

// Константы для анимации
const ROTATION_SPEED = 0.01;
const ORBIT_SPEED = 0.002;
const ORBIT_RADIUS = 1.5;
const ORBIT_HEIGHT = 2.5;

const container = ref<HTMLDivElement | null>(null);
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let door: Door;
let doorController: DoorController;
let vhsGrid: VHSGrid;
let controls: OrbitControls;
let raycaster: Raycaster;
let mouse: Vector2;
let selectedPart: Mesh | null = null;
let resizePlane: Plane;
let animationFrameId: number;
let initialMousePosition: Vector2 | null = null;
let cube: Cube;
let sphere: Sphere;

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

  // Добавляем обработчики событий
  container.value.addEventListener("mousedown", onMouseDown);
  container.value.addEventListener("mousemove", onMouseMove);
  container.value.addEventListener("mouseup", onMouseUp);
};

const initControls = () => {
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = CONTROLS_DAMPING;

  raycaster = new Raycaster();
  mouse = new Vector2();
  resizePlane = new Plane(new Vector3(0, 0, 1), 0);
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

  // Добавляем куб и сферу
  cube = new Cube(1);
  sphere = new Sphere(0.7);

  // Располагаем объекты над дверью
  cube.setPosition(-1.5, ORBIT_HEIGHT, 0);
  sphere.setPosition(1.5, ORBIT_HEIGHT, 0);

  scene.add(cube.mesh);
  scene.add(sphere.mesh);

  const axesHelper = new AxesHelper(5);
  scene.add(axesHelper);
};

const animate = () => {
  animationFrameId = requestAnimationFrame(animate);

  // Вращение и орбитальное движение куба и сферы
  if (cube && sphere) {
    // Собственное вращение объектов
    cube.mesh.rotation.z += ROTATION_SPEED;
    sphere.mesh.rotation.z += ROTATION_SPEED;

    // Орбитальное движение вокруг центральной оси
    const time = Date.now() * ORBIT_SPEED;
    cube.setPosition(
      Math.cos(time) * ORBIT_RADIUS,
      ORBIT_HEIGHT,
      Math.sin(time) * ORBIT_RADIUS
    );
    sphere.setPosition(
      Math.cos(time + Math.PI) * ORBIT_RADIUS,
      ORBIT_HEIGHT,
      Math.sin(time + Math.PI) * ORBIT_RADIUS
    );
  }

  vhsGrid.update();
  controls.update();
  renderer.render(scene, camera);
};

const updateMousePosition = (event: MouseEvent): Vector2 => {
  if (!container.value) return mouse;

  const rect = container.value.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / container.value.clientWidth) * 2 - 1;
  mouse.y =
    -((event.clientY - rect.top) / container.value.clientHeight) * 2 + 1;
  return mouse;
};

const onMouseDown = (event: MouseEvent) => {
  if (!container.value) return;

  updateMousePosition(event);
  initialMousePosition = mouse.clone();
  raycaster.setFromCamera(mouse, camera);

  // Проверяем клик на ручку
  const handleIntersects = raycaster.intersectObject(door.getHandle());
  if (handleIntersects.length > 0) {
    doorController.startDragging(mouse.x);
    controls.enabled = false;
    container.value.style.cursor = "grabbing";
    return;
  }

  // Проверяем клик на наличник
  const frameIntersects = raycaster.intersectObjects(door.frame.mesh.children);
  if (frameIntersects.length > 0) {
    if (doorController.isOpen()) {
      container.value.style.cursor = "not-allowed";
      return;
    }
    selectedPart = frameIntersects[0].object as Mesh;
    controls.enabled = false;
    container.value.style.cursor = "grabbing";
  }
};

const onMouseMove = (event: MouseEvent) => {
  if (!container.value) return;

  updateMousePosition(event);
  raycaster.setFromCamera(mouse, camera);

  if (doorController.isDraggingHandle()) {
    doorController.handleDrag(mouse.x);
  } else if (selectedPart && initialMousePosition) {
    const intersection = new Vector3();
    if (raycaster.ray.intersectPlane(resizePlane, intersection)) {
      const geometry = selectedPart.geometry as BoxGeometry;
      const isHorizontal =
        geometry.parameters.width > geometry.parameters.height;
      const dimension = isHorizontal ? "height" : "width";

      doorController.handleResize(
        dimension,
        new Vector2(intersection.x, intersection.y)
      );
    }
  } else {
    updateCursor();
  }
};

const updateCursor = () => {
  if (!container.value) return;

  const handleIntersects = raycaster.intersectObject(door.getHandle());
  const frameIntersects = raycaster.intersectObjects(door.frame.mesh.children);

  let newCursor = "auto";
  if (handleIntersects.length > 0) {
    newCursor = doorController.isDraggingHandle() ? "grabbing" : "grab";
  } else if (frameIntersects.length > 0) {
    newCursor = doorController.isOpen()
      ? "not-allowed"
      : selectedPart
      ? "grabbing"
      : "grab";
  }

  container.value.style.cursor = newCursor;
};

const onMouseUp = () => {
  if (!container.value) return;

  container.value.style.cursor = "auto";
  selectedPart = null;
  initialMousePosition = null;
  doorController.stopDragging();
  controls.enabled = true;
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
  initScene();
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
