import {
  Mesh,
  Raycaster,
  Vector2,
  Vector3,
  PerspectiveCamera,
  WebGLRenderer,
  Plane,
  BoxGeometry,
  Color,
} from "three";
import { Door } from "../model/Door";
import { DoorController } from "./DoorController";
import { PlayerController } from "@/entities/player";
import { CollisionManager } from "./CollisionManager";
import { House } from "../model/House";

export class SceneController {
  private container: HTMLDivElement;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private door: Door;
  private doorController: DoorController;
  private playerController: PlayerController;
  private collisionManager: CollisionManager;
  private raycaster: Raycaster;
  private mouse: Vector2;
  private selectedPart: Mesh | null = null;
  private resizePlane: Plane;
  private initialMousePosition: Vector2 | null = null;
  private handleOriginalColor: Color | null = null;
  private readonly BASE_COLOR = 0x8b4513; // Коричневый цвет
  private readonly HIGHLIGHT_COLOR = 0xffd700; // Золотой цвет
  private pulseTime: number = 0;
  private readonly PULSE_SPEED = 2; // Скорость пульсации
  private readonly PULSE_MIN = 0.3; // Минимальная интенсивность
  private readonly PULSE_MAX = 1.0; // Максимальная интенсивность
  private isDragged: boolean = false;

  constructor(
    container: HTMLDivElement,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    door: Door,
    doorController: DoorController,
    house: House
  ) {
    this.container = container;
    this.camera = camera;
    this.renderer = renderer;
    this.door = door;
    this.doorController = doorController;

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.resizePlane = new Plane(new Vector3(0, 0, 1), 0);

    // Инициализируем менеджер коллизий
    this.collisionManager = new CollisionManager(house);

    // Инициализируем контроллер игрока с менеджером коллизий
    this.playerController = new PlayerController(
      container,
      camera,
      this.collisionManager,
      this.doorController
    );

    this.initEventListeners();
    this.updateHandleHighlight(); // Инициализируем подсветку при создании
  }

  private initEventListeners(): void {
    this.container.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.container.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.container.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  private updateMousePosition(event: MouseEvent): Vector2 {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x =
      ((event.clientX - rect.left) / this.container.clientWidth) * 2 - 1;
    this.mouse.y =
      -((event.clientY - rect.top) / this.container.clientHeight) * 2 + 1;
    return this.mouse;
  }

  private onMouseDown(event: MouseEvent): void {
    if (!this.playerController.isPointerLocked) {
      this.updateMousePosition(event);
      this.initialMousePosition = this.mouse.clone();
      this.raycaster.setFromCamera(this.mouse, this.camera);

      // Проверяем клик на ручку
      const handleIntersects = this.raycaster.intersectObject(
        this.door.getHandle()
      );
      if (handleIntersects.length > 0) {
        this.doorController.startDragging(this.mouse.x);
        this.isDragged = true;
        this.container.style.cursor = "grabbing";
        return;
      }

      // Проверяем клик на наличник
      const frameIntersects = this.raycaster.intersectObjects(
        this.door.frame.mesh.children
      );
      if (frameIntersects.length > 0) {
        if (this.doorController.isOpen()) {
          this.container.style.cursor = "not-allowed";
          return;
        }
        this.selectedPart = frameIntersects[0].object as Mesh;
        this.container.style.cursor = "grabbing";
        return;
      }

      // Если не выбран ни один из активных объектов, сбрасываем флаг взаимодействия
      this.doorController.resetInteraction();
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.playerController.isPointerLocked) {
      this.updateMousePosition(event);
      this.raycaster.setFromCamera(this.mouse, this.camera);

      if (this.doorController.isDraggingHandle()) {
        this.doorController.handleDrag(this.mouse.x);
      } else if (this.selectedPart && this.initialMousePosition) {
        const intersection = new Vector3();
        if (this.raycaster.ray.intersectPlane(this.resizePlane, intersection)) {
          const geometry = this.selectedPart.geometry as BoxGeometry;
          const isHorizontal =
            geometry.parameters.width > geometry.parameters.height;
          const dimension = isHorizontal ? "height" : "width";

          this.doorController.handleResize(
            dimension,
            new Vector2(intersection.x, intersection.y)
          );
        }
      } else {
        this.updateCursor();
      }
    }
  }

  private onMouseUp(): void {
    if (!this.playerController.isPointerLocked) {
      this.container.style.cursor = "auto";
      this.selectedPart = null;
      this.initialMousePosition = null;
      this.doorController.stopDragging();

      // Сбрасываем подсветку при отпускании мыши
      const handle = this.door.getHandle();
      if (this.handleOriginalColor) {
        (handle.material as any).color.copy(this.handleOriginalColor);
        this.handleOriginalColor = null;
      }
    }
  }

  private updateCursor(): void {
    if (!this.playerController.isPointerLocked) {
      const handleIntersects = this.raycaster.intersectObject(
        this.door.getHandle()
      );
      const frameIntersects = this.raycaster.intersectObjects(
        this.door.frame.mesh.children
      );

      let newCursor = "auto";
      if (handleIntersects.length > 0) {
        newCursor = this.doorController.isDraggingHandle()
          ? "grabbing"
          : "grab";
      } else if (frameIntersects.length > 0) {
        newCursor = this.doorController.isOpen()
          ? "not-allowed"
          : this.selectedPart
          ? "grabbing"
          : "grab";
      }

      this.container.style.cursor = newCursor;
    }
  }

  private updateHandleHighlight(): void {
    const handle = this.door.getHandle();

    // Если дверь открыта, ручка перетаскивается или была перетащена ранее, возвращаем исходный цвет
    if (
      this.doorController.isOpen() ||
      this.doorController.isDraggingHandle() ||
      this.isDragged
    ) {
      if (this.handleOriginalColor) {
        (handle.material as any).color.copy(this.handleOriginalColor);
        this.handleOriginalColor = null;
      }
      return;
    }

    // Если дверь закрыта и ручка не перетаскивалась, применяем анимацию
    if (!this.handleOriginalColor) {
      this.handleOriginalColor = (handle.material as any).color.clone();
    }

    // Вычисляем интенсивность пульсации
    const pulseIntensity =
      this.PULSE_MIN +
      ((Math.sin(this.pulseTime * this.PULSE_SPEED) + 1) / 2) *
        (this.PULSE_MAX - this.PULSE_MIN);

    // Создаем цвет подсветки с учетом пульсации
    const baseColor = new Color(this.BASE_COLOR);
    const highlightColor = new Color(this.HIGHLIGHT_COLOR);
    const finalColor = baseColor.lerp(highlightColor, pulseIntensity);

    (handle.material as any).color.copy(finalColor);
  }

  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  public update(): void {
    this.playerController.update();
    this.pulseTime += 0.016; // Примерно 60 FPS
    this.updateHandleHighlight();
  }

  public destroy(): void {
    this.container.removeEventListener(
      "mousedown",
      this.onMouseDown.bind(this)
    );
    this.container.removeEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
    this.container.removeEventListener("mouseup", this.onMouseUp.bind(this));
    window.removeEventListener("resize", this.handleResize.bind(this));
    this.playerController.destroy();

    // Восстанавливаем исходный цвет при уничтожении
    const handle = this.door.getHandle();
    if (this.handleOriginalColor) {
      (handle.material as any).color.copy(this.handleOriginalColor);
    }
  }
}
