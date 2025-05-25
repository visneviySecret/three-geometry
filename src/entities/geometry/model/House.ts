import {
  Group,
  Mesh,
  MeshStandardMaterial,
  BoxGeometry,
  CylinderGeometry,
  Shape,
  ShapeGeometry,
} from "three";
import { Door } from "@/entities/geometry";

export class House {
  public mesh: Group;
  private readonly width: number;
  private readonly height: number;
  private readonly depth: number;
  public door: Door;

  constructor(width: number = 8, height: number = 6, depth: number = 0.1) {
    this.width = width;
    this.height = height;
    this.depth = depth;
    this.mesh = new Group();
    this.door = new Door();
    this.createHouse();
  }

  public getHeight(): number {
    return this.height;
  }

  private createHouse() {
    // Основная часть дома (белая)
    const houseGeometry = new BoxGeometry(this.width, this.height, this.depth);
    const houseMaterial = new MeshStandardMaterial({ color: 0xffffff });
    const house = new Mesh(houseGeometry, houseMaterial);
    this.mesh.add(house);

    // Создаем треугольную крышу
    const roofShape = new Shape();
    roofShape.moveTo(-this.width / 2, 0);
    roofShape.lineTo(0, this.height * 0.4);
    roofShape.lineTo(this.width / 2, 0);
    roofShape.lineTo(-this.width / 2, 0);

    const roofGeometry = new ShapeGeometry(roofShape);
    const roofMaterial = new MeshStandardMaterial({
      color: 0x8b4513,
      side: 2, // THREE.DoubleSide
    });
    const roof = new Mesh(roofGeometry, roofMaterial);
    roof.position.y = this.height / 2;
    roof.position.z = -this.depth / 2;
    this.mesh.add(roof);

    // Создаем вторую сторону крыши
    const roofBack = roof.clone();
    roofBack.position.z = this.depth / 2;
    this.mesh.add(roofBack);

    // Окно спереди
    const windowGeometry = new BoxGeometry(0.8, 0.8, 0.01);
    const windowMaterial = new MeshStandardMaterial({ color: 0x87ceeb });
    const window = new Mesh(windowGeometry, windowMaterial);
    window.position.z = this.depth / 2 + 0.01;
    window.position.y = this.height * 0.3;
    window.position.x = this.width * 0.3;
    this.mesh.add(window);

    // Добавляем дверь в центр с учетом её размеров
    this.door.mesh.position.z = this.depth / 2 + 0.01;

    this.mesh.add(this.door.mesh);

    // Задняя часть дома (картонная)
    const backMaterial = new MeshStandardMaterial({ color: 0xd2b48c });
    const back = new Mesh(houseGeometry, backMaterial);
    back.position.z = -this.depth;
    this.mesh.add(back);

    // Подпорки сзади
    const supportGeometry = new CylinderGeometry(0.15, 0.15, this.height, 8);
    const supportMaterial = new MeshStandardMaterial({ color: 0x8b4513 });

    // Левая подпорка
    const leftSupport = new Mesh(supportGeometry, supportMaterial);
    leftSupport.position.set(-this.width / 2 + 0.6, 0, -this.depth - 0.1);
    this.mesh.add(leftSupport);

    // Правая подпорка
    const rightSupport = new Mesh(supportGeometry, supportMaterial);
    rightSupport.position.set(this.width / 2 - 0.6, 0, -this.depth - 0.1);
    this.mesh.add(rightSupport);
  }
}
