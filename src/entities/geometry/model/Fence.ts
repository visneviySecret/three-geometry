import { Group, Mesh, MeshStandardMaterial, BoxGeometry } from "three";

// Константы для улучшения читаемости
const UPPER_RAIL_HEIGHT_RATIO = 0.9;
const MIDDLE_RAIL_HEIGHT_RATIO = 0.3;
const RAIL_THICKNESS = 0.1;
const BOARD_WIDTH = 0.3;
const BOARD_THICKNESS = 0.05;

export class Fence {
  public mesh: Group;
  private postMaterial: MeshStandardMaterial;
  private railMaterial: MeshStandardMaterial;

  constructor(length: number = 10, width: number = 10, height: number = 1) {
    this.mesh = new Group();
    this.postMaterial = new MeshStandardMaterial();
    this.railMaterial = new MeshStandardMaterial();
    this.initMaterials();
    this.createFence(length, width, height);
  }

  private initMaterials() {
    this.postMaterial = new MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.8,
      metalness: 0.2,
    });

    this.railMaterial = new MeshStandardMaterial({
      color: 0xa0522d,
      roughness: 0.7,
      metalness: 0.3,
    });
  }

  private createFence(length: number, width: number, height: number) {
    const postHeight = height * 1.5;
    const postWidth = 0.1;
    const postDepth = 0.1;
    const offset = postWidth / 2;

    // Создаём 4 угловых столба
    this.createCornerPosts(
      length,
      width,
      postHeight,
      postWidth,
      postDepth,
      offset
    );

    // Добавляем доски и перекладины между столбами
    this.createFenceSections(length, width, height, offset);
  }

  private createCornerPosts(
    length: number,
    width: number,
    postHeight: number,
    postWidth: number,
    postDepth: number,
    offset: number
  ) {
    const corners = [
      [-length / 2 + offset, -width / 2 + offset],
      [length / 2 - offset, -width / 2 + offset],
      [length / 2 - offset, width / 2 - offset],
      [-length / 2 + offset, width / 2 - offset],
    ];

    corners.forEach(([x, z]) => {
      this.createPost(x, z, postHeight, postWidth, postDepth);
    });
  }

  private createFenceSections(
    length: number,
    width: number,
    height: number,
    offset: number
  ) {
    const sections = [
      [
        -length / 2 + offset,
        -width / 2 + offset,
        length / 2 - offset,
        -width / 2 + offset,
      ],
      [
        length / 2 - offset,
        -width / 2 + offset,
        length / 2 - offset,
        width / 2 - offset,
      ],
      [
        length / 2 - offset,
        width / 2 - offset,
        -length / 2 + offset,
        width / 2 - offset,
      ],
      [
        -length / 2 + offset,
        width / 2 - offset,
        -length / 2 + offset,
        -width / 2 + offset,
      ],
    ];

    sections.forEach(([x1, z1, x2, z2]) => {
      this.createBoardsBetweenPosts(x1, z1, x2, z2, height);
    });
  }

  private createPost(
    x: number,
    z: number,
    height: number,
    width: number,
    depth: number
  ) {
    const geometry = new BoxGeometry(width, height, depth);
    const post = new Mesh(geometry, this.postMaterial);
    post.position.set(x, height / 2, z);
    this.mesh.add(post);
  }

  private createRail(
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    y: number,
    thickness: number = RAIL_THICKNESS
  ) {
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
    const angle = Math.atan2(z2 - z1, x2 - x1);

    const geometry = new BoxGeometry(length, thickness, thickness);
    const rail = new Mesh(geometry, this.railMaterial);

    rail.position.set((x1 + x2) / 2, y, (z1 + z2) / 2);
    rail.rotation.y = -angle;

    this.mesh.add(rail);
  }

  private createBoardsBetweenPosts(
    x1: number,
    z1: number,
    x2: number,
    z2: number,
    height: number,
    count: number = 16
  ) {
    const angle = Math.atan2(z2 - z1, x2 - x1);
    const boardHeight = height * 1.2;

    // Создаём перекладины
    this.createRail(x1, z1, x2, z2, height * UPPER_RAIL_HEIGHT_RATIO);
    this.createRail(x1, z1, x2, z2, height * MIDDLE_RAIL_HEIGHT_RATIO);

    // Материал досок
    const boardMaterial = new MeshStandardMaterial({
      color: 0x8b4513,
      roughness: 0.7,
      metalness: 0.1,
    });

    // Распределяем доски
    for (let i = 1; i <= count; i++) {
      const t = i / (count + 1);
      const x = x1 + (x2 - x1) * t;
      const z = z1 + (z2 - z1) * t;

      const board = new Mesh(
        new BoxGeometry(BOARD_WIDTH, boardHeight, BOARD_THICKNESS),
        boardMaterial
      );

      board.position.set(x, boardHeight / 2, z);
      board.rotation.y = -angle;
      this.mesh.add(board);
    }
  }
}
