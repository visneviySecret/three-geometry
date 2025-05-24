import { Door } from "../model/Door";
import { Vector2 } from "three";

export class DoorController {
  private door: Door;
  private isDragging: boolean = false;
  private dragStartX: number = 0;

  constructor(door: Door) {
    this.door = door;
  }

  public startDragging(mouseX: number): void {
    this.isDragging = true;
    this.dragStartX = mouseX;
  }

  public stopDragging(): void {
    this.isDragging = false;
  }

  public handleDrag(mouseX: number): void {
    if (!this.isDragging) return;

    const dragDelta = mouseX - this.dragStartX;
    const rotationAngle = dragDelta * this.door.getMaxOpenAngle();
    // Ограничиваем угол поворота для открывания влево
    const clampedAngle = Math.max(
      -this.door.getMaxOpenAngle(),
      Math.min(rotationAngle, 0)
    );
    this.door.setRotation(clampedAngle);
  }

  public handleResize(
    dimension: "width" | "height",
    intersection: Vector2
  ): void {
    const newSize =
      dimension === "width"
        ? Math.abs(intersection.x * 2)
        : Math.abs(intersection.y * 2);

    this.door.resize(dimension, Math.max(0.5, newSize));
  }

  public isDraggingHandle(): boolean {
    return this.isDragging;
  }
}
