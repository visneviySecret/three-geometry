import { Vector3, Box3, Object3D } from "three";
import { House } from "../model/House";
import { VHSGrid } from "../model/VHSGrid";

export class CollisionManager {
  private house: House;
  private playerBox: Box3;
  private houseBox: Box3;
  private readonly FENCE_SIZE = VHSGrid.GRID_SIZE; // Размер забора (20x20 метров)
  private readonly FENCE_OFFSET = 0.5; // Отступ от края забора для предотвращения проникновения

  constructor(house: House) {
    this.house = house;
    this.playerBox = new Box3();
    this.houseBox = new Box3();
  }

  public updatePlayerPosition(
    playerPosition: Vector3,
    playerSize: Vector3
  ): boolean {
    // Обновляем границы игрока
    this.playerBox.setFromCenterAndSize(playerPosition, playerSize);

    // Обновляем границы дома
    this.houseBox.setFromObject(this.house.mesh);

    // Проверяем коллизию с домом
    if (this.playerBox.intersectsBox(this.houseBox)) {
      return false;
    }

    // Проверяем границы забора
    const halfSize = this.FENCE_SIZE / 2;
    const playerRadius = playerSize.x / 2; // Используем половину ширины игрока как радиус

    // Проверяем, не выходит ли игрок за границы забора
    if (
      playerPosition.x - playerRadius < -halfSize + this.FENCE_OFFSET ||
      playerPosition.x + playerRadius > halfSize - this.FENCE_OFFSET ||
      playerPosition.z - playerRadius < -halfSize + this.FENCE_OFFSET ||
      playerPosition.z + playerRadius > halfSize - this.FENCE_OFFSET
    ) {
      return false;
    }

    return true;
  }

  public checkCollision(object: Object3D): boolean {
    const objectBox = new Box3().setFromObject(object);
    return this.houseBox.intersectsBox(objectBox);
  }
}
