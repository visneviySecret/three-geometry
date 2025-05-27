import {
  Group,
  Mesh,
  PlaneGeometry,
  MeshStandardMaterial,
  DoubleSide,
} from "three";

export class Grass {
  public mesh: Group;
  private readonly grassCount = 200;
  private readonly flowerCount = 30;
  private readonly areaSize = 20;

  constructor() {
    this.mesh = new Group();
    this.createGrass();
    this.createFlowers();
  }

  private createGrassBlade(x: number, z: number): Group {
    const grassGroup = new Group();
    const grassMaterial = new MeshStandardMaterial({
      color: 0x4caf50,
      side: DoubleSide,
    });

    // Создаем три веточки для каждой травинки
    for (let i = 0; i < 3; i++) {
      const bladeGeometry = new PlaneGeometry(0.05, 0.2); // Уменьшаем размер веточек
      const blade = new Mesh(bladeGeometry, grassMaterial);

      // Располагаем веточки веером
      const angle = (i - 1) * 0.8; // Угол между веточками
      blade.rotation.z = angle;

      // Смещаем веточки относительно центра
      blade.position.x = Math.sin(angle) * -0.1;
      blade.position.y = Math.cos(angle) * -0.1;

      grassGroup.add(blade);
    }

    // Позиционируем группу травинок
    grassGroup.position.set(x, 0, z);

    // Случайный поворот всей группы
    grassGroup.rotation.x = Math.random() * 0.2;
    grassGroup.rotation.z = Math.random() * 0.2;

    // Случайный масштаб
    const scale = 0.8 + Math.random() * 0.4;
    grassGroup.scale.set(scale, scale, scale);

    return grassGroup;
  }

  private createGrass() {
    for (let i = 0; i < this.grassCount; i++) {
      // Случайное положение
      const x = (Math.random() - 0.5) * this.areaSize;
      const z = (Math.random() - 0.5) * this.areaSize;

      const grassBlade = this.createGrassBlade(x, z);
      this.mesh.add(grassBlade);
    }
  }

  private createFlowers() {
    const flowerColors = [
      0xff69b4, // Розовый
      0xffd700, // Желтый
      0xff4500, // Оранжевый
      0x9370db, // Фиолетовый
      0x00ffff, // Голубой
    ];

    for (let i = 0; i < this.flowerCount; i++) {
      // Создаем стебель
      const stemGeometry = new PlaneGeometry(0.1, 0.8);
      const stemMaterial = new MeshStandardMaterial({
        color: 0x228b22,
        side: DoubleSide,
      });
      const stem = new Mesh(stemGeometry, stemMaterial);

      // Создаем цветок
      const flowerGeometry = new PlaneGeometry(0.4, 0.4);
      const flowerMaterial = new MeshStandardMaterial({
        color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
        side: DoubleSide,
      });
      const flower = new Mesh(flowerGeometry, flowerMaterial);
      flower.position.y = 0.4;

      // Группируем стебель и цветок
      const flowerGroup = new Group();
      flowerGroup.add(stem);
      flowerGroup.add(flower);

      // Случайное положение
      const x = (Math.random() - 0.5) * this.areaSize;
      const z = (Math.random() - 0.5) * this.areaSize;

      flowerGroup.position.set(x, 0, z);

      // Случайный поворот
      flowerGroup.rotation.x = Math.random() * 0.2;
      flowerGroup.rotation.z = Math.random() * 0.2;

      this.mesh.add(flowerGroup);
    }
  }

  public update() {
    // Можно добавить анимацию покачивания травы и цветов
  }
}
