import { Door } from "../model/Door";
import { Vector2 } from "three";

interface DragState {
  isDragging: boolean;
  startX: number;
}

export class DoorController {
  private readonly door: Door;
  private dragState: DragState = {
    isDragging: false,
    startX: 0,
  };

  constructor(door: Door) {
    this.door = door;
  }

  public startDragging(mouseX: number): void {
    this.dragState = {
      isDragging: true,
      startX: mouseX,
    };
  }

  public stopDragging(): void {
    this.dragState.isDragging = false;
  }

  public handleDrag(mouseX: number): void {
    if (!this.dragState.isDragging) return;

    const dragDelta = mouseX - this.dragState.startX;
    const rotationAngle = this.calculateRotationAngle(dragDelta);
    this.door.setRotation(rotationAngle);
  }

  private calculateRotationAngle(dragDelta: number): number {
    const rawAngle = dragDelta * this.door.getMaxOpenAngle();
    return this.clampRotationAngle(rawAngle);
  }

  private clampRotationAngle(angle: number): number {
    return Math.max(-this.door.getMaxOpenAngle(), Math.min(angle, 0));
  }

  public handleResize(
    dimension: "width" | "height",
    intersection: Vector2
  ): void {
    const newSize = this.calculateNewSize(dimension, intersection);
    this.door.resize(dimension, Math.max(0.5, newSize));
  }

  private calculateNewSize(
    dimension: "width" | "height",
    intersection: Vector2
  ): number {
    return dimension === "width"
      ? Math.abs(intersection.x * 2)
      : Math.abs(intersection.y * 2);
  }

  public isDraggingHandle(): boolean {
    return this.dragState.isDragging;
  }
}
