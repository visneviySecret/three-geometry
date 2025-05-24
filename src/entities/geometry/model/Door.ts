import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  Group,
} from "three";
import { DoorFrame } from "./DoorFrame";

export class Door {
  public mesh: Group;
  public frame: DoorFrame;
  private doorGroup: Group;
  private doorMesh: Mesh;
  private handleMesh: Mesh;
  private resizeHandles: Mesh[];
  private width: number;
  private height: number;
  private depth: number;
  private maxOpenAngle: number;
  private doorGap: number;

  constructor() {
    this.mesh = new Group();
    this.doorGroup = new Group();
    this.width = 2;
    this.height = 3;
    this.depth = 0.1;
    this.doorGap = 0.02;
    this.resizeHandles = [];
    this.maxOpenAngle = Math.PI * 0.8;

    // Создаем наличник
    this.frame = new DoorFrame(this.width, this.height);

    // Создаем основу двери с учетом зазора
    const doorGeometry = new BoxGeometry(
      this.width - this.doorGap * 2,
      this.height - this.doorGap * 2,
      this.depth
    );
    const doorMaterial = new MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.doorMesh = new Mesh(doorGeometry, doorMaterial);
    this.doorMesh.position.x = (this.width - this.doorGap * 2) / 2;
    this.doorGroup.add(this.doorMesh);

    // Создаем ручку двери
    const handleGeometry = new CylinderGeometry(0.1, 0.1, 0.3, 32);
    const handleMaterial = new MeshStandardMaterial({ color: 0x8b4513 });
    this.handleMesh = new Mesh(handleGeometry, handleMaterial);
    this.handleMesh.rotation.x = Math.PI / 2;
    this.handleMesh.position.set((this.width - this.doorGap * 2) * 0.9, 0, 0.1);
    this.doorGroup.add(this.handleMesh);

    // Добавляем маркеры изменения размера
    this.createResizeHandles();

    // Добавляем группы в основную группу
    this.mesh.add(this.frame.mesh);
    this.mesh.add(this.doorGroup);

    // Смещаем ось вращения подвижной группы к левому торцу
    this.doorGroup.position.x = -(this.width - this.doorGap * 2) / 2;
  }

  private createResizeHandles() {
    const handleMaterial = new MeshStandardMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: 0,
      visible: false,
    });

    // Создаем горизонтальные маркеры (для изменения высоты)
    const horizontalHandleGeometry = new CylinderGeometry(
      0.05,
      0.05,
      this.width - this.doorGap * 2,
      16
    );
    const topHandle = new Mesh(horizontalHandleGeometry, handleMaterial);
    const bottomHandle = new Mesh(horizontalHandleGeometry, handleMaterial);

    topHandle.rotation.z = Math.PI / 2;
    bottomHandle.rotation.z = Math.PI / 2;

    topHandle.position.set(
      (this.width - this.doorGap * 2) / 2,
      (this.height - this.doorGap * 2) / 2,
      0
    );
    bottomHandle.position.set(
      (this.width - this.doorGap * 2) / 2,
      -(this.height - this.doorGap * 2) / 2,
      0
    );

    // Создаем вертикальные маркеры (для изменения ширины)
    const verticalHandleGeometry = new CylinderGeometry(
      0.05,
      0.05,
      this.height - this.doorGap * 2,
      16
    );
    const leftHandle = new Mesh(verticalHandleGeometry, handleMaterial);
    const rightHandle = new Mesh(verticalHandleGeometry, handleMaterial);

    leftHandle.position.set(0, 0, 0);
    rightHandle.position.set(this.width - this.doorGap * 2, 0, 0);

    this.resizeHandles = [rightHandle, leftHandle, topHandle, bottomHandle];
    this.resizeHandles.forEach((handle) => {
      this.doorGroup.add(handle);
    });
  }

  public resize(dimension: "width" | "height", newSize: number) {
    // Обновляем размеры наличника
    if (dimension === "width") {
      this.width = newSize;
    } else {
      this.height = newSize;
    }

    // Сначала обновляем наличник
    this.frame.resize(this.width, this.height);

    // Теперь обновляем дверь с учетом зазора
    const doorWidth = this.width - this.doorGap * 2;
    const doorHeight = this.height - this.doorGap * 2;

    // Обновляем геометрию двери
    const newGeometry = new BoxGeometry(doorWidth, doorHeight, this.depth);
    this.doorMesh.geometry.dispose();
    this.doorMesh.geometry = newGeometry;
    this.doorMesh.position.x = doorWidth / 2;

    // Удаляем старые маркеры
    this.resizeHandles.forEach((handle) => {
      handle.geometry.dispose();
      this.doorGroup.remove(handle);
    });
    this.resizeHandles = [];

    // Создаем новые маркеры с обновленными размерами
    this.createResizeHandles();

    // Обновляем позицию ручки двери
    this.handleMesh.position.x = doorWidth * 0.9;

    // Обновляем положение оси вращения подвижной группы
    this.doorGroup.position.x = -doorWidth / 2;
  }

  public getHandle(): Mesh {
    return this.handleMesh;
  }

  public getResizeHandles(): Mesh[] {
    return this.resizeHandles;
  }

  public getMaxOpenAngle(): number {
    return this.maxOpenAngle;
  }

  public setRotation(angle: number): void {
    this.doorGroup.rotation.y = angle;
  }

  public setDoorGap(gap: number): void {
    this.doorGap = gap;
    this.resize("width", this.width);
  }
}
