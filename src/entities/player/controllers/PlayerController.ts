import { PerspectiveCamera, Vector3, Euler, Vector2 } from "three";
import { CollisionManager } from "@/entities/geometry/controllers/CollisionManager";

export class PlayerController {
  private camera: PerspectiveCamera;
  private container: HTMLDivElement;
  private collisionManager: CollisionManager;

  // Настройки FPS-управления
  private moveSpeed = 0.1;
  private mouseSensitivity = 0.002;
  public isPointerLocked = false;
  private moveForward = false;
  private moveBackward = false;
  private moveLeft = false;
  private moveRight = false;
  private velocity = new Vector3();
  private direction = new Vector3();
  private rotation = new Euler(0, 0, 0, "YXZ");
  private mouse = new Vector2();
  private playerSize = new Vector3(0.5, 1.7, 0.5); // Размер коллайдера игрока

  constructor(
    container: HTMLDivElement,
    camera: PerspectiveCamera,
    collisionManager: CollisionManager
  ) {
    this.container = container;
    this.camera = camera;
    this.collisionManager = collisionManager;

    // Устанавливаем фиксированную высоту камеры
    this.camera.position.y = 1.7;

    this.initEventListeners();
  }

  private initEventListeners(): void {
    document.addEventListener("keydown", this.onKeyDown.bind(this));
    document.addEventListener("keyup", this.onKeyUp.bind(this));
    this.container.addEventListener("click", this.onContainerClick.bind(this));
    document.addEventListener(
      "pointerlockchange",
      this.onPointerLockChange.bind(this)
    );
    this.container.addEventListener("mousemove", this.onMouseMove.bind(this));
  }

  private onContainerClick(): void {
    if (!this.isPointerLocked) {
      this.container.requestPointerLock();
    } else {
      document.exitPointerLock();
    }
  }

  private onPointerLockChange(): void {
    this.isPointerLocked = document.pointerLockElement === this.container;
  }

  private onKeyDown(event: KeyboardEvent): void {
    switch (event.code) {
      case "KeyW":
      case "KeyЦ":
        this.moveForward = true;
        break;
      case "KeyS":
      case "KeyЫ":
        this.moveBackward = true;
        break;
      case "KeyA":
      case "KeyФ":
        this.moveLeft = true;
        break;
      case "KeyD":
      case "KeyВ":
        this.moveRight = true;
        break;
    }
  }

  private onKeyUp(event: KeyboardEvent): void {
    switch (event.code) {
      case "KeyW":
      case "KeyЦ":
        this.moveForward = false;
        break;
      case "KeyS":
      case "KeyЫ":
        this.moveBackward = false;
        break;
      case "KeyA":
      case "KeyФ":
        this.moveLeft = false;
        break;
      case "KeyD":
      case "KeyВ":
        this.moveRight = false;
        break;
    }
  }

  private onMouseMove(event: MouseEvent): void {
    if (this.isPointerLocked) {
      this.mouse.x -= event.movementX * this.mouseSensitivity;
      this.mouse.y += event.movementY * this.mouseSensitivity;

      // Ограничиваем вертикальный угол обзора
      this.mouse.y = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, this.mouse.y)
      );

      this.rotation.set(-this.mouse.y, this.mouse.x, 0);
      this.camera.quaternion.setFromEuler(this.rotation);
    }
  }

  public update(): void {
    if (!this.isPointerLocked) return;

    this.velocity.x = 0;
    this.velocity.z = 0;

    this.direction.z = Number(this.moveForward) - Number(this.moveBackward);
    this.direction.x = Number(this.moveLeft) - Number(this.moveRight);
    this.direction.normalize();

    if (this.moveForward || this.moveBackward) {
      this.velocity.z = this.direction.z * this.moveSpeed;
    }
    if (this.moveLeft || this.moveRight) {
      this.velocity.x = this.direction.x * this.moveSpeed;
    }

    // Применяем движение относительно направления камеры
    const cameraDirection = new Vector3();
    this.camera.getWorldDirection(cameraDirection);
    const cameraRight = new Vector3()
      .crossVectors(this.camera.up, cameraDirection)
      .normalize();

    // Сохраняем текущую позицию
    const oldPosition = this.camera.position.clone();

    // Пробуем двигаться по X
    this.camera.position.addScaledVector(cameraRight, this.velocity.x);
    if (
      !this.collisionManager.updatePlayerPosition(
        this.camera.position,
        this.playerSize
      )
    ) {
      this.camera.position.copy(oldPosition);
    }

    // Пробуем двигаться по Z
    this.camera.position.addScaledVector(cameraDirection, this.velocity.z);
    if (
      !this.collisionManager.updatePlayerPosition(
        this.camera.position,
        this.playerSize
      )
    ) {
      this.camera.position.copy(oldPosition);
    }

    // Сохраняем фиксированную высоту
    this.camera.position.y = 1.7;
  }

  public destroy(): void {
    document.removeEventListener("keydown", this.onKeyDown.bind(this));
    document.removeEventListener("keyup", this.onKeyUp.bind(this));
    this.container.removeEventListener(
      "click",
      this.onContainerClick.bind(this)
    );
    document.removeEventListener(
      "pointerlockchange",
      this.onPointerLockChange.bind(this)
    );
    this.container.removeEventListener(
      "mousemove",
      this.onMouseMove.bind(this)
    );
  }
}
