import {
  BoxGeometry,
  CylinderGeometry,
  MeshStandardMaterial,
  Mesh,
  Group,
} from "three";
import { DoorFrame } from "./DoorFrame";

export class Door {
  private static readonly INITIAL_WIDTH = 2;
  private static readonly INITIAL_HEIGHT = 3;
  private static readonly DOOR_DEPTH = 0.1;
  private static readonly DOOR_GAP = 0.02;
  private static readonly MAX_OPEN_ANGLE = Math.PI * 0.8;
  private static readonly HANDLE_RADIUS = 0.1;
  private static readonly HANDLE_HEIGHT = 0.3;
  private static readonly HANDLE_SEGMENTS = 32;
  private static readonly HANDLE_POSITION_RATIO = 0.9;
  private static readonly HANDLE_Z_OFFSET = 0.1;
  private static readonly DOOR_COLOR = 0x8b4513;

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
    this.width = Door.INITIAL_WIDTH;
    this.height = Door.INITIAL_HEIGHT;

    // Создаем наличник
    this.frame = new DoorFrame(this.width, this.height);

    // Создаем основу двери с учетом зазора
    const doorWidth = this.width - Door.DOOR_GAP * 2;
    const doorHeight = this.height - Door.DOOR_GAP * 2;

    const doorGeometry = new BoxGeometry(
      doorWidth,
      doorHeight,
      Door.DOOR_DEPTH
    );
    const doorMaterial = new MeshStandardMaterial({
      color: Door.DOOR_COLOR,
      roughness: 0.8,
      metalness: 0.2,
    });
    this.doorMesh = new Mesh(doorGeometry, doorMaterial);
    this.doorMesh.position.x = doorWidth / 2;
    this.doorGroup.add(this.doorMesh);

    // Создаем ручку двери
    const handleGeometry = new CylinderGeometry(
      Door.HANDLE_RADIUS,
      Door.HANDLE_RADIUS,
      Door.HANDLE_HEIGHT,
      Door.HANDLE_SEGMENTS
    );
    const handleMaterial = new MeshStandardMaterial({ color: Door.DOOR_COLOR });
    this.handleMesh = new Mesh(handleGeometry, handleMaterial);
    this.handleMesh.rotation.x = Math.PI / 2;
    this.handleMesh.position.set(
      doorWidth * Door.HANDLE_POSITION_RATIO,
      0,
      Door.HANDLE_Z_OFFSET
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
    const doorWidth = this.width - Door.DOOR_GAP * 2;
    const doorHeight = this.height - Door.DOOR_GAP * 2;

    // Обновляем геометрию двери
    const newGeometry = new BoxGeometry(doorWidth, doorHeight, Door.DOOR_DEPTH);
    this.doorMesh.geometry.dispose();
    this.doorMesh.geometry = newGeometry;
    this.doorMesh.position.x = doorWidth / 2;

    // Обновляем позицию ручки двери
    this.handleMesh.position.x = doorWidth * Door.HANDLE_POSITION_RATIO;

    // Обновляем положение оси вращения подвижной группы
    this.doorGroup.position.x = -doorWidth / 2;
  }

  public getHandle(): Mesh {
    return this.handleMesh;
  }

  public getMaxOpenAngle(): number {
    return Door.MAX_OPEN_ANGLE;
  }

  public setRotation(angle: number): void {
    this.doorGroup.rotation.y = angle;
  }
}
