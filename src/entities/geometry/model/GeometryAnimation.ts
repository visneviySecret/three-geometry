import { Cube, Sphere, CompositeSphere } from "../index";

export class GeometryAnimation {
  private cube: Cube;
  private sphere: Sphere | CompositeSphere;
  private readonly ROTATION_SPEED = 0.01;
  private readonly ORBIT_SPEED = 0.002;
  private readonly ORBIT_RADIUS = 2.5;
  private readonly ORBIT_HEIGHT = 1;
  private readonly VERTICAL_SPEED = 0.001;
  private readonly VERTICAL_AMPLITUDE = 0.8;
  private lastTime: number = 0;

  constructor(cube: Cube, sphere: Sphere | CompositeSphere) {
    this.cube = cube;
    this.sphere = sphere;
    this.lastTime = Date.now();
  }

  private cubicBezier(t: number): number {
    const p0 = 0;
    const p1 = 0.05;
    const p2 = 0.95;
    const p3 = 1;

    const u = 1 - t;
    return (
      u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3
    );
  }

  private getVerticalOffset(time: number, phaseOffset: number = 0): number {
    const phase = (time + phaseOffset) % (Math.PI * 2);
    let t = Math.abs(Math.sin(phase));
    t = this.cubicBezier(t);
    return (t - 0.5) * this.VERTICAL_AMPLITUDE;
  }

  public update(): void {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Конвертируем в секунды
    this.lastTime = currentTime;

    // Собственное вращение только для куба
    this.cube.mesh.rotation.z += this.ROTATION_SPEED;

    // Орбитальное движение вокруг центральной оси
    const time = currentTime * this.ORBIT_SPEED;
    const verticalTime = currentTime * this.VERTICAL_SPEED;

    // Вертикальное движение с cubic bezier для куба
    const cubeVerticalOffset = this.getVerticalOffset(verticalTime, 0);

    this.cube.setPosition(
      Math.cos(time) * this.ORBIT_RADIUS,
      this.ORBIT_HEIGHT + cubeVerticalOffset,
      Math.sin(time) * this.ORBIT_RADIUS
    );
    this.sphere.setPosition(
      Math.cos(time + Math.PI) * this.ORBIT_RADIUS,
      this.ORBIT_HEIGHT,
      Math.sin(time + Math.PI) * this.ORBIT_RADIUS
    );

    // Обновляем stagger анимацию для составной сферы
    if (this.sphere instanceof CompositeSphere) {
      this.sphere.update(deltaTime);
    }
  }
}
