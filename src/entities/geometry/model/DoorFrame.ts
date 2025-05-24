import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

export class DoorFrame {
  public mesh: Group;
  private width: number;
  private height: number;
  private frameWidth: number;
  private frameThickness: number;
  private frameMaterial: MeshStandardMaterial;

  constructor(doorWidth: number, doorHeight: number) {
    this.mesh = new Group();
    this.width = doorWidth;
    this.height = doorHeight;
    this.frameWidth = 0.2;
    this.frameThickness = 0.05;

    this.frameMaterial = new MeshStandardMaterial({
      color: 0x6d4c41,
      roughness: 0.7,
      metalness: 0.3,
    });

    this.createFrame();
  }

  private createFrame() {
    // Создаем верхнюю и нижнюю планки
    const horizontalGeometry = new BoxGeometry(
      this.width + this.frameWidth * 2,
      this.frameWidth,
      this.frameThickness
    );
    const topFrame = new Mesh(horizontalGeometry, this.frameMaterial);
    const bottomFrame = new Mesh(horizontalGeometry, this.frameMaterial);

    // Создаем боковые планки
    const verticalGeometry = new BoxGeometry(
      this.frameWidth,
      this.height + this.frameWidth * 2 - this.frameWidth * 2, // Вычитаем перекрытия с горизонтальными планками
      this.frameThickness
    );
    const leftFrame = new Mesh(verticalGeometry, this.frameMaterial);
    const rightFrame = new Mesh(verticalGeometry, this.frameMaterial);

    // Позиционируем планки
    topFrame.position.set(
      0,
      this.height / 2 + this.frameWidth / 2,
      -this.frameThickness / 2
    );
    bottomFrame.position.set(
      0,
      -this.height / 2 - this.frameWidth / 2,
      -this.frameThickness / 2
    );
    leftFrame.position.set(
      -this.width / 2 - this.frameWidth / 2,
      0,
      -this.frameThickness / 2
    );
    rightFrame.position.set(
      this.width / 2 + this.frameWidth / 2,
      0,
      -this.frameThickness / 2
    );

    // Добавляем планки в группу наличника
    this.mesh.add(topFrame);
    this.mesh.add(bottomFrame);
    this.mesh.add(leftFrame);
    this.mesh.add(rightFrame);
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Удаляем старые планки
    this.mesh.children.forEach((child) => {
      (child as Mesh).geometry.dispose();
      this.mesh.remove(child);
    });

    // Создаем новые планки с обновленными размерами
    this.createFrame();
  }

  public setFrameWidth(width: number) {
    this.frameWidth = width;
    this.resize(this.width, this.height);
  }

  public setFrameThickness(thickness: number) {
    this.frameThickness = thickness;
    this.resize(this.width, this.height);
  }

  public setColor(color: number) {
    this.frameMaterial.color.setHex(color);
  }
}
