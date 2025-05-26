import {
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  TextureLoader,
  RepeatWrapping,
  Group,
} from "three";
import packageJson from "../../../../package.json";

export class Tape {
  public mesh: Group;
  private width: number;
  private height: number;
  private technologies: string[];
  private tapeGap: number = 0.4; // Расстояние между лентами

  constructor(width: number = 4, height: number = 0.5) {
    this.width = width;
    this.height = height;
    this.mesh = new Group();

    // Получаем список технологий из package.json
    const deps = Object.keys(packageJson.dependencies || {});
    const devDeps = Object.keys(packageJson.devDependencies || {});
    const techsArray = Array.from(new Set([...deps, ...devDeps]));
    this.technologies = techsArray.filter((tech) => {
      return !tech.includes("@");
    });

    // Разделяем технологии на три части
    const partLength = Math.ceil(this.technologies.length / 3);
    const techParts = [
      this.technologies.slice(0, partLength),
      this.technologies.slice(partLength, partLength * 2),
      this.technologies.slice(partLength * 2),
    ];

    // Создаем три ленты
    techParts.forEach((techs, index) => {
      const tape = this.createTape(techs);
      tape.position.y = index * (this.height + this.tapeGap);
      tape.rotation.z = Math.PI * -0.05;
      this.mesh.add(tape);
    });
  }

  private createTape(techs: string[]): Mesh {
    const geometry = new PlaneGeometry(this.width, this.height);

    // Создаем текстуру с полосками
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    // Заполняем фон жёлтым
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Рисуем чёрные полоски сверху и снизу
    ctx.fillStyle = "#000000";
    const stripeWidth = 4;
    const stripeGap = 6;
    const topHeight = 6;
    const bottomHeight = 6;

    // Рисуем верхние полоски
    for (let x = 0; x < canvas.width; x += stripeWidth + stripeGap) {
      ctx.fillRect(x, 0, stripeWidth, topHeight);
    }

    // Рисуем нижние полоски
    for (let x = 0; x < canvas.width; x += stripeWidth + stripeGap) {
      ctx.fillRect(x, canvas.height - bottomHeight, stripeWidth, bottomHeight);
    }

    // Добавляем текст
    ctx.fillStyle = "#000000";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Выводим технологии через запятую
    const techText = techs.join(" • ");
    ctx.fillText(techText, canvas.width / 2, canvas.height / 2);

    const texture = new TextureLoader().load(canvas.toDataURL());
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.repeat.set(1, 1);

    const material = new MeshBasicMaterial({
      map: texture,
      side: DoubleSide,
      transparent: true,
      opacity: 0.8,
    });

    const mesh = new Mesh(geometry, material);
    return mesh;
  }

  public update() {
    // Анимация покачивания убрана
  }
}
