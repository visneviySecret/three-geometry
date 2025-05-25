import { Color } from "three";
import { UI_CONSTANTS } from "./constants";

export const calculatePulseIntensity = (pulseTime: number): number => {
  return (
    UI_CONSTANTS.PULSE_MIN +
    ((Math.sin(pulseTime * UI_CONSTANTS.PULSE_SPEED) + 1) / 2) *
      (UI_CONSTANTS.PULSE_MAX - UI_CONSTANTS.PULSE_MIN)
  );
};

export const getPulseColor = (
  baseColor: Color,
  highlightColor: Color,
  pulseIntensity: number
): Color => {
  return baseColor.clone().lerp(highlightColor, pulseIntensity);
};

export const updateMousePosition = (
  event: MouseEvent,
  container: HTMLDivElement
): { x: number; y: number } => {
  const rect = container.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / container.clientWidth) * 2 - 1,
    y: -((event.clientY - rect.top) / container.clientHeight) * 2 + 1,
  };
};
