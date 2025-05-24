import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  Group,
} from "three";

export class Door {
  public mesh: Group;
  private doorMesh: Mesh;
  private handleMesh: Mesh;
  private resizeHandles: Mesh[];
  private width: number;
  private height: number;
  private depth: number;

  constructor() {
    this.mesh = new Group();
    this.width = 2;
    this.height = 3;
    this.depth = 0.1;
    this.resizeHandles = [];

    // Создаем основу двери
    const doorGeometry = new BoxGeometry(this.width, this.height, this.depth);
    const doorMaterial = new MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.doorMesh = new Mesh(doorGeometry, doorMaterial);
    this.mesh.add(this.doorMesh);

    // Создаем ручку двери
    const handleGeometry = new CylinderGeometry(0.1, 0.1, 0.3, 32);
    const handleMaterial = new MeshStandardMaterial({ color: 0x8b4513 });
    this.handleMesh = new Mesh(handleGeometry, handleMaterial);
    this.handleMesh.rotation.x = Math.PI / 2;
    this.handleMesh.position.set(0.8, 0, 0.1);
    this.mesh.add(this.handleMesh);

    // Добавляем маркеры изменения размера
    this.createResizeHandles();
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
      this.width,
      16
    );
    const topHandle = new Mesh(horizontalHandleGeometry, handleMaterial);
    const bottomHandle = new Mesh(horizontalHandleGeometry, handleMaterial);

    // Поворачиваем горизонтальные маркеры
    topHandle.rotation.z = Math.PI / 2;
    bottomHandle.rotation.z = Math.PI / 2;

    // Позиционируем горизонтальные маркеры
    topHandle.position.set(0, this.height / 2, 0);
    bottomHandle.position.set(0, -this.height / 2, 0);

    // Создаем вертикальные маркеры (для изменения ширины)
    const verticalHandleGeometry = new CylinderGeometry(
      0.05,
      0.05,
      this.height,
      16
    );
    const leftHandle = new Mesh(verticalHandleGeometry, handleMaterial);
    const rightHandle = new Mesh(verticalHandleGeometry, handleMaterial);

    // Позиционируем вертикальные маркеры
    leftHandle.position.set(-this.width / 2, 0, 0);
    rightHandle.position.set(this.width / 2, 0, 0);

    // Добавляем все маркеры в группу
    this.resizeHandles = [rightHandle, leftHandle, topHandle, bottomHandle];
    this.resizeHandles.forEach((handle) => {
      this.mesh.add(handle);
    });
  }

  public resize(dimension: "width" | "height", newSize: number) {
    if (dimension === "width") {
      this.width = newSize;
    } else {
      this.height = newSize;
    }

    // Обновляем геометрию двери
    const newGeometry = new BoxGeometry(this.width, this.height, this.depth);
    this.doorMesh.geometry.dispose();
    this.doorMesh.geometry = newGeometry;

    // Удаляем старые маркеры
    this.resizeHandles.forEach((handle) => {
      handle.geometry.dispose();
      this.mesh.remove(handle);
    });
    this.resizeHandles = [];

    // Создаем новые маркеры с обновленными размерами
    this.createResizeHandles();

    // Обновляем позицию ручки двери
    this.handleMesh.position.x = this.width * 0.4;
  }

  public getResizeHandles(): Mesh[] {
    return this.resizeHandles;
  }

  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  setRotation(x: number, y: number, z: number): void {
    this.mesh.rotation.set(x, y, z);
  }
}
