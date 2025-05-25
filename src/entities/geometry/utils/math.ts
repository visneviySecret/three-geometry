import { Vector2 } from "three";

export const calculateRotationAngle = (
  dragDelta: number,
  maxOpenAngle: number,
  startRotation: number
): number => {
  const rawAngle = dragDelta * maxOpenAngle;
  return clampRotationAngle(rawAngle, maxOpenAngle, startRotation);
};

export const clampRotationAngle = (
  angle: number,
  maxAngle: number,
  startRotation: number
): number => {
  return Math.max(-maxAngle - startRotation, Math.min(-startRotation, angle));
};

export const calculateNewSize = (
  dimension: "width" | "height",
  intersection: Vector2
): number => {
  const coordinate = dimension === "width" ? intersection.x : intersection.y;
  return Math.abs(coordinate * 2);
};

export const clampSize = (size: number, min: number, max: number): number => {
  return Math.min(max, Math.max(min, size));
};
