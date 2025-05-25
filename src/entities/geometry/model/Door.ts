import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  Group,
} from "three";
import { DoorFrame } from "./DoorFrame";
import { DOOR_CONSTANTS } from "../utils/constants";

export class Door {
  public mesh: Group;
  public frame: DoorFrame;
  private doorGroup: Group;
  private doorMesh: Mesh;
  private handleMesh: Mesh;
  private width: number;
  private height: number;

  constructor() {
    this.mesh = new Group();
    this.doorGroup = new Group();
    this.width = DOOR_CONSTANTS.INITIAL_WIDTH;
    this.height = DOOR_CONSTANTS.INITIAL_HEIGHT;

    // Создаем наличник
    this.frame = new DoorFrame(this.width, this.height);

    // Создаем основу двери с учетом зазора
    const doorWidth = this.width - DOOR_CONSTANTS.DOOR_GAP * 2;
    const doorHeight = this.height - DOOR_CONSTANTS.DOOR_GAP * 2;

    const doorGeometry = new BoxGeometry(
      doorWidth,
      doorHeight,
      DOOR_CONSTANTS.DOOR_DEPTH
    );
    const doorMaterial = new MeshStandardMaterial({
      color: DOOR_CONSTANTS.DOOR_COLOR,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.doorMesh = new Mesh(doorGeometry, doorMaterial);
    this.doorMesh.position.x = doorWidth / 2;
    this.doorGroup.add(this.doorMesh);

    // Создаем ручку двери
    const handleGeometry = new CylinderGeometry(
      DOOR_CONSTANTS.HANDLE_RADIUS,
      DOOR_CONSTANTS.HANDLE_RADIUS,
      DOOR_CONSTANTS.HANDLE_HEIGHT,
      DOOR_CONSTANTS.HANDLE_SEGMENTS
    );
    const handleMaterial = new MeshStandardMaterial({
      color: DOOR_CONSTANTS.DOOR_COLOR,
    });
    this.handleMesh = new Mesh(handleGeometry, handleMaterial);
    this.handleMesh.rotation.x = Math.PI / 2;
    this.handleMesh.position.set(
      doorWidth * DOOR_CONSTANTS.HANDLE_POSITION_RATIO,
      0,
      DOOR_CONSTANTS.HANDLE_Z_OFFSET
    );
    this.doorGroup.add(this.handleMesh);

    // Добавляем группы в основную группу
    this.mesh.add(this.frame.mesh);
    this.mesh.add(this.doorGroup);

    // Смещаем ось вращения подвижной группы к левому торцу
    this.doorGroup.position.x = -doorWidth / 2;
  }

  public resize(dimension: "width" | "height", newSize: number) {
    if (dimension === "width") {
      this.width = newSize;
    } else {
      this.height = newSize;
    }

    // Сначала обновляем наличник
    this.frame.resize(this.width, this.height);

    // Обновляем размеры двери с учетом зазора
    const doorWidth = this.width - DOOR_CONSTANTS.DOOR_GAP * 2;
    const doorHeight = this.height - DOOR_CONSTANTS.DOOR_GAP * 2;

    // Обновляем геометрию двери
    const newGeometry = new BoxGeometry(
      doorWidth,
      doorHeight,
      DOOR_CONSTANTS.DOOR_DEPTH
    );
    this.doorMesh.geometry.dispose();
    this.doorMesh.geometry = newGeometry;
    this.doorMesh.position.x = doorWidth / 2;

    // Обновляем позицию ручки двери
    this.handleMesh.position.x =
      doorWidth * DOOR_CONSTANTS.HANDLE_POSITION_RATIO;

    // Обновляем положение оси вращения подвижной группы
    this.doorGroup.position.x = -doorWidth / 2;
  }

  public getHeight(): number {
    return this.height;
  }

  public getWidth(): number {
    return this.width;
  }

  public getHandle(): Mesh {
    return this.handleMesh;
  }

  public getMaxOpenAngle(): number {
    return DOOR_CONSTANTS.MAX_OPEN_ANGLE;
  }

  public setRotation(angle: number): void {
    this.doorGroup.rotation.y = angle;
  }
}
