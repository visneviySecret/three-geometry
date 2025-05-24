import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";

export class DoorFrame {
  private static readonly DEFAULT_FRAME_WIDTH = 0.2;
  private static readonly DEFAULT_FRAME_THICKNESS = 0.05;
  private static readonly FRAME_COLOR = 0x6d4c41;
  private static readonly MATERIAL_ROUGHNESS = 0.7;
  private static readonly MATERIAL_METALNESS = 0.3;

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
    this.frameWidth = DoorFrame.DEFAULT_FRAME_WIDTH;
    this.frameThickness = DoorFrame.DEFAULT_FRAME_THICKNESS;

    this.frameMaterial = new MeshStandardMaterial({
      color: DoorFrame.FRAME_COLOR,
      roughness: DoorFrame.MATERIAL_ROUGHNESS,
      metalness: DoorFrame.MATERIAL_METALNESS,
    });

    this.createFrame();
  }

  private createFrame() {
    const totalWidth = this.width + this.frameWidth * 2;
    const totalHeight = this.height + this.frameWidth * 2;
    const verticalHeight = totalHeight - this.frameWidth * 2; // Вычитаем перекрытия

    // Создаем верхнюю и нижнюю планки
    const horizontalGeometry = new BoxGeometry(
      totalWidth,
      this.frameWidth,
      this.frameThickness
    );
    const topFrame = new Mesh(horizontalGeometry, this.frameMaterial);
    const bottomFrame = new Mesh(horizontalGeometry, this.frameMaterial);

    // Создаем боковые планки
    const verticalGeometry = new BoxGeometry(
      this.frameWidth,
      verticalHeight,
      this.frameThickness
    );
    const leftFrame = new Mesh(verticalGeometry, this.frameMaterial);
    const rightFrame = new Mesh(verticalGeometry, this.frameMaterial);

    // Позиционируем планки
    const zOffset = -this.frameThickness / 2;

    topFrame.position.set(0, this.height / 2 + this.frameWidth / 2, zOffset);
    bottomFrame.position.set(
      0,
      -this.height / 2 - this.frameWidth / 2,
      zOffset
    );
    leftFrame.position.set(-this.width / 2 - this.frameWidth / 2, 0, zOffset);
    rightFrame.position.set(this.width / 2 + this.frameWidth / 2, 0, zOffset);

    // Добавляем планки в группу наличника
    this.mesh.add(topFrame, bottomFrame, leftFrame, rightFrame);
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;

    // Удаляем старые планки
    while (this.mesh.children.length) {
      const child = this.mesh.children[0] as Mesh;
      child.geometry.dispose();
      this.mesh.remove(child);
    }

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
