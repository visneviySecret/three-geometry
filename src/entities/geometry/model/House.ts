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
import { DoorController } from "@/entities/geometry/controllers/DoorController";
import { HOUSE_CONSTANTS, DOOR_CONSTANTS } from "../utils/constants";

export class House {
  public mesh: Group;
  private readonly width: number;
  private readonly height: number;
  private readonly depth: number;
  public door: Door;

  constructor(
    width: number = HOUSE_CONSTANTS.DEFAULT_WIDTH,
    height: number = HOUSE_CONSTANTS.DEFAULT_HEIGHT,
    depth: number = HOUSE_CONSTANTS.DEFAULT_DEPTH
  ) {
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

  private createWallWithHole(
    material: MeshStandardMaterial,
    zPosition: number
  ) {
    const wallGroup = new Group();

    const isDoorMaxSize =
      this.door.getWidth() >= DOOR_CONSTANTS.MAX_DOOR_WIDTH &&
      this.door.getHeight() >= DOOR_CONSTANTS.MAX_DOOR_HEIGHT;

    if (!isDoorMaxSize) {
      const wallGeometry = new BoxGeometry(this.width, this.height, this.depth);
      const wall = new Mesh(wallGeometry, material);
      wallGroup.add(wall);
    } else {
      const doorWidth = this.door.getWidth();
      const doorHeight = this.door.getHeight();

      const wallParts = [
        {
          width: this.width / 2 - doorWidth / 2,
          height: this.height,
          x: -(this.width / 2 + doorWidth / 2) / 2,
          y: 0,
        },
        {
          width: this.width / 2 - doorWidth / 2,
          height: this.height,
          x: (this.width / 2 + doorWidth / 2) / 2,
          y: 0,
        },
        {
          width: doorWidth,
          height: this.height / 2 - doorHeight / 2,
          x: 0,
          y: (this.height / 2 + doorHeight / 2) / 2,
        },
        {
          width: doorWidth,
          height: this.height / 2 - doorHeight / 2,
          x: 0,
          y: -(this.height / 2 + doorHeight / 2) / 2,
        },
      ];

      wallParts.forEach((part) => {
        const geometry = new BoxGeometry(part.width, part.height, this.depth);
        const mesh = new Mesh(geometry, material);
        mesh.position.set(part.x, part.y, 0);
        wallGroup.add(mesh);
      });
    }

    wallGroup.position.z = zPosition;
    return wallGroup;
  }

  private createHouse() {
    const frontWallMaterial = new MeshStandardMaterial({
      color: HOUSE_CONSTANTS.WALL_COLORS.FRONT,
      side: 2,
    });
    const frontWall = this.createWallWithHole(
      frontWallMaterial,
      this.depth / 2
    );
    this.mesh.add(frontWall);

    const roofShape = new Shape();
    roofShape.moveTo(-this.width / 2, 0);
    roofShape.lineTo(0, this.height * 0.4);
    roofShape.lineTo(this.width / 2, 0);
    roofShape.lineTo(-this.width / 2, 0);

    const roofGeometry = new ShapeGeometry(roofShape);
    const roofMaterial = new MeshStandardMaterial({
      color: HOUSE_CONSTANTS.WALL_COLORS.ROOF,
      side: 2,
    });
    const roof = new Mesh(roofGeometry, roofMaterial);
    roof.position.y = this.height / 2;
    roof.position.z = -this.depth / 2;
    this.mesh.add(roof);

    const roofBackMaterial = new MeshStandardMaterial({
      color: HOUSE_CONSTANTS.WALL_COLORS.ROOF_BACK,
      side: 2,
    });
    const roofBack = new Mesh(roofGeometry, roofBackMaterial);
    roofBack.position.y = this.height / 2;
    roofBack.position.z = this.depth / 2;
    this.mesh.add(roofBack);

    const windowGeometry = new BoxGeometry(0.8, 0.8, 0.01);
    const windowMaterial = new MeshStandardMaterial({ color: 0x87ceeb });
    const window = new Mesh(windowGeometry, windowMaterial);
    window.position.z = this.depth / 2 + 0.1;
    window.position.y = this.height * 0.3;
    window.position.x = this.width * 0.3;
    this.mesh.add(window);

    this.door.mesh.position.z = this.depth / 2 + 0.1;
    this.mesh.add(this.door.mesh);

    const backWallMaterial = new MeshStandardMaterial({
      color: HOUSE_CONSTANTS.WALL_COLORS.BACK,
      side: 2,
    });
    const backWall = this.createWallWithHole(backWallMaterial, -this.depth / 2);
    this.mesh.add(backWall);

    const supportGeometry = new CylinderGeometry(
      0.15,
      0.15,
      this.height + 0.9,
      8,
      1,
      false,
      0,
      Math.PI * 1.8
    );
    const supportMaterial = new MeshStandardMaterial({
      color: HOUSE_CONSTANTS.WALL_COLORS.BACK,
    });

    const leftSupport = new Mesh(supportGeometry, supportMaterial);
    leftSupport.position.set(-this.width / 2 + 0.6, 0, -this.depth - 1.9);
    leftSupport.rotation.x = Math.PI / 6;
    this.mesh.add(leftSupport);

    const rightSupport = new Mesh(supportGeometry, supportMaterial);
    rightSupport.position.set(this.width / 2 - 0.6, 0, -this.depth - 1.9);
    rightSupport.rotation.x = Math.PI / 6;
    this.mesh.add(rightSupport);
  }

  public updateWalls(): void {
    this.mesh.children.forEach((child) => {
      if (child instanceof Group && child !== this.door.mesh) {
        this.mesh.remove(child);
      }
    });

    const frontWallMaterial = new MeshStandardMaterial({
      color: HOUSE_CONSTANTS.WALL_COLORS.FRONT,
      side: 2,
    });
    const frontWall = this.createWallWithHole(
      frontWallMaterial,
      this.depth / 2
    );
    this.mesh.add(frontWall);

    const backWallMaterial = new MeshStandardMaterial({
      color: HOUSE_CONSTANTS.WALL_COLORS.BACK,
      side: 2,
    });
    const backWall = this.createWallWithHole(backWallMaterial, -this.depth / 2);
    this.mesh.add(backWall);
  }
}
