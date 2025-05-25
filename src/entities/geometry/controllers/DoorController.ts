import { Door } from "../model/Door";
import { Vector2 } from "three";
import { House } from "../model/House";
import { DOOR_CONSTANTS } from "../utils/constants";
import {
  calculateRotationAngle,
  clampSize,
  calculateNewSize,
} from "../utils/math";

interface DragState {
  isDragging: boolean;
  startX: number;
  startRotation: number;
}

export class DoorController {
  private readonly door: Door;
  private readonly house: House;
  private dragState: DragState = {
    isDragging: false,
    startX: 0,
    startRotation: 0,
  };
  private currentRotation: number = 0;
  public isInteracted: boolean = false;

  constructor(door: Door, house: House) {
    this.door = door;
    this.house = house;
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
      (mouseX - this.dragState.startX) * DOOR_CONSTANTS.ROTATION_SENSITIVITY;
    const rotationAngle = calculateRotationAngle(
      dragDelta,
      this.door.getMaxOpenAngle(),
      this.dragState.startRotation
    );
    this.currentRotation = this.dragState.startRotation + rotationAngle;
    this.door.setRotation(this.currentRotation);
  }

  public handleResize(
    dimension: "width" | "height",
    intersection: Vector2
  ): void {
    this.isInteracted = true;
    const newSize = calculateNewSize(dimension, intersection);

    this.door.resize(
      dimension,
      clampSize(
        newSize,
        DOOR_CONSTANTS.MIN_SIZE,
        dimension === "height"
          ? DOOR_CONSTANTS.MAX_DOOR_HEIGHT
          : DOOR_CONSTANTS.MAX_DOOR_WIDTH
      )
    );

    // Обновляем стены после изменения размера двери
    this.house.updateWalls();
  }

  public isDraggingHandle(): boolean {
    return this.dragState.isDragging;
  }

  public isOpen(): boolean {
    return Math.abs(this.currentRotation) > DOOR_CONSTANTS.ROTATION_THRESHOLD;
  }

  public resetInteraction(): void {
    this.isInteracted = false;
  }
}
