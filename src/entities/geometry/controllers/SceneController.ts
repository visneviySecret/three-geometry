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
import { UI_CONSTANTS } from "../utils/constants";
import {
  calculatePulseIntensity,
  getPulseColor,
  updateMousePosition,
} from "../utils/ui";

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
  private pulseTime: number = 0;
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
    this.doorController = new DoorController(door, house);

    this.raycaster = new Raycaster();
    this.mouse = new Vector2();
    this.resizePlane = new Plane(new Vector3(0, 0, 1), 0);

    this.collisionManager = new CollisionManager(house);
    this.playerController = new PlayerController(
      container,
      camera,
      this.collisionManager,
      this.doorController
    );

    this.initEventListeners();
    this.updateHandleHighlight();
  }

  private initEventListeners(): void {
    this.container.addEventListener("mousedown", this.onMouseDown.bind(this));
    this.container.addEventListener("mousemove", this.onMouseMove.bind(this));
    this.container.addEventListener("mouseup", this.onMouseUp.bind(this));
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  private onMouseDown(event: MouseEvent): void {
    if (!this.playerController.isPointerLocked) {
      const { x, y } = updateMousePosition(event, this.container);
      this.mouse.set(x, y);
      this.initialMousePosition = this.mouse.clone();
      this.raycaster.setFromCamera(this.mouse, this.camera);

      const handleIntersects = this.raycaster.intersectObject(
        this.door.getHandle()
      );
      if (handleIntersects.length > 0) {
        this.doorController.startDragging(this.mouse.x);
        this.isDragged = true;
        this.container.style.cursor = "grabbing";
        return;
      }

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

      this.doorController.resetInteraction();
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (!this.playerController.isPointerLocked) {
      const { x, y } = updateMousePosition(event, this.container);
      this.mouse.set(x, y);
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

    if (!this.handleOriginalColor) {
      this.handleOriginalColor = (handle.material as any).color.clone();
    }

    const pulseIntensity = calculatePulseIntensity(this.pulseTime);
    const baseColor = new Color(UI_CONSTANTS.BASE_COLOR);
    const highlightColor = new Color(UI_CONSTANTS.HIGHLIGHT_COLOR);
    const finalColor = getPulseColor(baseColor, highlightColor, pulseIntensity);

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
    this.pulseTime += 0.016;
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

    const handle = this.door.getHandle();
    if (this.handleOriginalColor) {
      (handle.material as any).color.copy(this.handleOriginalColor);
    }
  }
}
