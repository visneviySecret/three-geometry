import { BoxGeometry, Mesh, MeshStandardMaterial } from "three";

export class Cube {
  private geometry: BoxGeometry;
  private material: MeshStandardMaterial;
  public mesh: Mesh;

  constructor(size: number = 1) {
    this.geometry = new BoxGeometry(size, size, size);
    this.material = new MeshStandardMaterial({
      color: 0x00ff00,
      metalness: 0.3,
      roughness: 0.4,
    });
    this.mesh = new Mesh(this.geometry, this.material);
  }

  public setPosition(x: number = 0, y: number = 0, z: number = 0): void {
    this.mesh.position.set(x, y, z);
  }
}
