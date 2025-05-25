import {
  Group,
  Mesh,
  SphereGeometry,
  MeshStandardMaterial,
  Vector3,
} from "three";

export class CompositeSphere {
  public mesh: Group;
  private smallSpheres: Mesh[] = [];
  private readonly mainRadius: number;
  private readonly smallSphereRadius: number;
  private readonly numberOfSpheres: number;
  private readonly staggerSpeed: number = 2;
  private readonly staggerAmplitude: number = 0.8;
  private readonly staggerDelay: number = 0.005;
  private animationTime: number = 0;

  constructor(
    mainRadius: number = 1,
    smallSphereRadius: number = 0.15,
    numberOfSpheres: number = 64
  ) {
    this.mesh = new Group();
    this.mainRadius = mainRadius;
    this.smallSphereRadius = smallSphereRadius;
    this.numberOfSpheres = numberOfSpheres;

    this.createSmallSpheres();
  }

  private createSmallSpheres(): void {
    const geometry = new SphereGeometry(this.smallSphereRadius, 16, 16);
    const material = new MeshStandardMaterial({
      color: 0x0000ff,
      metalness: 0.3,
      roughness: 0.4,
    });

    // Используем золотое сечение для равномерного распределения точек на сфере
    const phi = Math.PI * (3 - Math.sqrt(5)); // золотое сечение

    for (let i = 0; i < this.numberOfSpheres; i++) {
      const sphere = new Mesh(geometry, material);

      // Вычисляем позицию на сфере
      const y = 1 - (i / (this.numberOfSpheres - 1)) * 2; // y от 1 до -1
      const radius = Math.sqrt(1 - y * y); // радиус на текущей высоте

      const theta = phi * i; // угол поворота

      const x = Math.cos(theta) * radius;
      const z = Math.sin(theta) * radius;

      // Сохраняем базовую позицию для анимации
      sphere.userData.basePosition = new Vector3(
        x * this.mainRadius,
        y * this.mainRadius,
        z * this.mainRadius
      );

      sphere.position.copy(sphere.userData.basePosition);

      this.smallSpheres.push(sphere);
      this.mesh.add(sphere);
    }
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

  public update(deltaTime: number): void {
    this.animationTime += deltaTime * this.staggerSpeed;

    this.smallSpheres.forEach((sphere, index) => {
      const basePosition = sphere.userData.basePosition;
      const delay = index * this.staggerDelay;
      const phase = (this.animationTime + delay) % (Math.PI * 2);
      let t = Math.abs(Math.sin(phase));
      t = this.cubicBezier(t);
      const offset = (t - 0.5) * this.staggerAmplitude;

      sphere.position.set(
        basePosition.x,
        basePosition.y + offset,
        basePosition.z
      );
    });
  }

  public setPosition(x: number = 0, y: number = 0, z: number = 0): void {
    this.mesh.position.set(x, y, z);
  }
}
