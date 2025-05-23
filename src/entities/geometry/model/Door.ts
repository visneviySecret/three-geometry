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

  constructor() {
    this.mesh = new Group();

    // Создаем основу двери
    const doorGeometry = new BoxGeometry(2, 3, 0.1);
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
  }

  setPosition(x: number, y: number, z: number): void {
    this.mesh.position.set(x, y, z);
  }

  setRotation(x: number, y: number, z: number): void {
    this.mesh.rotation.set(x, y, z);
  }
}
