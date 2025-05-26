import {
  Group,
  Mesh,
  SphereGeometry,
  MeshStandardMaterial,
  Object3D,
} from "three";

export class Clouds {
  public mesh: Group;
  private clouds: Object3D[] = [];
  private readonly cloudCount = 12;
  private readonly cloudRadius = 3;
  private readonly cloudSpread = 120;
  private readonly rotationSpeed = 0.0001; // Скорость вращения

  constructor() {
    this.mesh = new Group();
    this.createClouds();
  }

  private createCloudCloud(x: number, y: number, z: number): Object3D {
    const cloudGroup = new Group();
    const cloudMaterial = new MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.7,
    });

    // Создаем группу сфер для одного облака
    const sphereCount = 6 + Math.floor(Math.random() * 5);
    for (let i = 0; i < sphereCount; i++) {
      const radius = this.cloudRadius * (0.8 + Math.random() * 0.6);
      const geometry = new SphereGeometry(radius, 8, 8);
      const sphere = new Mesh(geometry, cloudMaterial);

      // Увеличиваем область смещения сфер внутри облака
      const offsetX = (Math.random() - 0.5) * this.cloudRadius * 3;
      const offsetY = (Math.random() - 0.5) * this.cloudRadius * 1.5;
      const offsetZ = (Math.random() - 0.5) * this.cloudRadius * 3;

      sphere.position.set(offsetX, offsetY, offsetZ);
      cloudGroup.add(sphere);
    }

    cloudGroup.position.set(x, y, z);
    return cloudGroup;
  }

  private getRandomPosition(): { x: number; y: number; z: number } {
    // Создаем случайные координаты в большом пространстве
    const minDistance = 60;
    const maxDistance = this.cloudSpread;

    // Генерируем случайный угол и расстояние
    const angle = Math.random() * Math.PI * 2;
    const distance = minDistance + Math.random() * (maxDistance - minDistance);

    // Преобразуем полярные координаты в декартовы
    const x = Math.cos(angle) * distance;
    const z = Math.sin(angle) * distance;
    const y = 20 + Math.random() * 30;

    return { x, y, z };
  }

  private createClouds() {
    // Создаем облака в случайных позициях
    for (let i = 0; i < this.cloudCount; i++) {
      const position = this.getRandomPosition();
      const cloud = this.createCloudCloud(position.x, position.y, position.z);

      // Добавляем случайный поворот и масштаб для разнообразия
      cloud.rotation.y = Math.random() * Math.PI * 2;
      cloud.rotation.x = (Math.random() - 0.5) * 0.2;
      cloud.rotation.z = (Math.random() - 0.5) * 0.2;

      const scale = 1.2 + Math.random() * 0.6;
      cloud.scale.set(scale, scale, scale);

      this.clouds.push(cloud);
      this.mesh.add(cloud);
    }
  }

  public update() {
    // Вращаем всю группу облаков вокруг центра сцены
    this.mesh.rotation.y += this.rotationSpeed;
  }
}
