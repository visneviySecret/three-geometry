import { Door } from "../model/Door";
import { Vector2 } from "three";

interface DragState {
  isDragging: boolean;
  startX: number;
  startRotation: number;
}

export class DoorController {
  private static readonly ROTATION_THRESHOLD = 0.001;
  private static readonly MIN_SIZE = 0.5;
  private static readonly ROTATION_SENSITIVITY = 1.5;
  private static readonly MAX_DOOR_HEIGHT = 5.6;
  private static readonly MAX_DOOR_WIDTH = 3.6;

  private readonly door: Door;
  private dragState: DragState = {
    isDragging: false,
    startX: 0,
    startRotation: 0,
  };
  private currentRotation: number = 0;
  public isInteracted: boolean = false;

  constructor(door: Door) {
    this.door = door;
  }

  public startDragging(mouseX: number): void {
    this.dragState = {
      isDragging: true,
      startX: mouseX,
      startRotation: this.currentRotation,
    };
    this.isInteracted = true;
  }

  public stopDragging(): void {
    this.dragState.isDragging = false;
  }

  public handleDrag(mouseX: number): void {
    if (!this.dragState.isDragging) return;

    const dragDelta =
      (mouseX - this.dragState.startX) * DoorController.ROTATION_SENSITIVITY;
    const rotationAngle = this.calculateRotationAngle(dragDelta);
    this.currentRotation = this.dragState.startRotation + rotationAngle;
    this.door.setRotation(this.currentRotation);
  }

  private calculateRotationAngle(dragDelta: number): number {
    const rawAngle = dragDelta * this.door.getMaxOpenAngle();
    return this.clampRotationAngle(rawAngle, this.dragState.startRotation);
  }

  private clampRotationAngle(angle: number, startRotation: number): number {
    const maxAngle = this.door.getMaxOpenAngle();
    return Math.max(-maxAngle - startRotation, Math.min(-startRotation, angle));
  }

  public handleResize(
    dimension: "width" | "height",
    intersection: Vector2
  ): void {
    this.isInteracted = true;
    const newSize = this.calculateNewSize(dimension, intersection);

    if (dimension === "height") {
      this.door.resize(
        dimension,
        Math.min(
          DoorController.MAX_DOOR_HEIGHT,
          Math.max(DoorController.MIN_SIZE, newSize)
        )
      );
    } else {
      this.door.resize(
        dimension,
        Math.min(
          DoorController.MAX_DOOR_WIDTH,
          Math.max(DoorController.MIN_SIZE, newSize)
        )
      );
    }
  }

  private calculateNewSize(
    dimension: "width" | "height",
    intersection: Vector2
  ): number {
    const coordinate = dimension === "width" ? intersection.x : intersection.y;
    return Math.abs(coordinate * 2);
  }

  public isDraggingHandle(): boolean {
    return this.dragState.isDragging;
  }

  public isOpen(): boolean {
    return Math.abs(this.currentRotation) > DoorController.ROTATION_THRESHOLD;
  }

  public resetInteraction(): void {
    this.isInteracted = false;
  }
}
