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

const container = ref<HTMLDivElement | null>(null);
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let door: Door;
let doorController: DoorController;
let controls: OrbitControls;
let raycaster: Raycaster;
let mouse: Vector2;
let selectedPart: Mesh | null = null;
let resizePlane: Plane;
let animationFrameId: number;
let initialMousePosition: Vector2 | null = null;

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
  doorController = new DoorController(door);
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

  initialMousePosition = new Vector2(mouse.x, mouse.y);
  raycaster.setFromCamera(mouse, camera);

  // Проверяем клик на ручку
  const handleIntersects = raycaster.intersectObject(door.getHandle());
  if (handleIntersects.length > 0) {
    doorController.startDragging(mouse.x);
    controls.enabled = false;
    if (container.value) {
      container.value.style.cursor = "grabbing";
    }
    return;
  }

  // Проверяем клик на наличник
  const frameIntersects = raycaster.intersectObjects(door.frame.mesh.children);
  if (frameIntersects.length > 0) {
    // Проверяем, закрыта ли дверь
    if (doorController.isOpen()) {
      if (container.value) {
        container.value.style.cursor = "not-allowed";
      }
      return;
    }
    selectedPart = frameIntersects[0].object as Mesh;
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

  if (doorController.isDraggingHandle()) {
    doorController.handleDrag(mouse.x);
  } else if (selectedPart && initialMousePosition) {
    const intersection = new Vector3();
    raycaster.ray.intersectPlane(resizePlane, intersection);

    const geometry = selectedPart.geometry as BoxGeometry;
    const isHorizontal = geometry.parameters.width > geometry.parameters.height;

    const mouseDelta = new Vector2(
      mouse.x - initialMousePosition.x,
      mouse.y - initialMousePosition.y
    );

    const dominantAxis =
      Math.abs(mouseDelta.y) > Math.abs(mouseDelta.x) ? "height" : "width";

    doorController.handleResize(
      isHorizontal ? "height" : "width",
      new Vector2(intersection.x, intersection.y)
    );
  } else {
    // Проверяем наведение на ручку
    const handleIntersects = raycaster.intersectObject(door.getHandle());

    // Проверяем наведение на наличник
    const frameIntersects = raycaster.intersectObjects(
      door.frame.mesh.children
    );

    if (container.value) {
      if (handleIntersects.length > 0) {
        container.value.style.cursor = "grab";
      } else if (frameIntersects.length > 0) {
        // Меняем курсор в зависимости от состояния двери
        container.value.style.cursor = doorController.isOpen()
          ? "not-allowed"
          : "grab";
      } else {
        container.value.style.cursor = "auto";
      }
    }
  }
};

const onMouseUp = () => {
  if (container.value) {
    container.value.style.cursor = "auto";
  }
  selectedPart = null;
  initialMousePosition = null;
  doorController.stopDragging();
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
