import { SphereGeometry, Mesh, MeshStandardMaterial } from "three";

export class Sphere {
  private geometry: SphereGeometry;
  private material: MeshStandardMaterial;
  public mesh: Mesh;

  constructor(radius: number = 1, segments: number = 32) {
    this.geometry = new SphereGeometry(radius, segments, segments);
    this.material = new MeshStandardMaterial({
      color: 0x0000ff,
      metalness: 0.3,
      roughness: 0.4,
    });
    this.mesh = new Mesh(this.geometry, this.material);
  }

  public setPosition(x: number = 0, y: number = 0, z: number = 0): void {
    this.mesh.position.set(x, y, z);
  }
}
