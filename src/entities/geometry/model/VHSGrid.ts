import {
  GridHelper,
  ShaderMaterial,
  Color,
  PlaneGeometry,
  Mesh,
  DoubleSide,
  Group,
} from "three";

export class VHSGrid {
  private static readonly GRID_SIZE = 20;
  private static readonly GRID_DIVISIONS = 20;
  private static readonly GRID_COLOR = 0x00ffff;
  private static readonly FLOOR_OPACITY = 0.1;
  private static readonly FRAME_WIDTH = 0.2;

  public mesh: Group;
  private vhsShaderMaterial: ShaderMaterial;
  private yPosition: number;

  constructor(doorHeight: number) {
    this.mesh = new Group();
    this.yPosition = -(doorHeight / 2) - VHSGrid.FRAME_WIDTH;
    this.vhsShaderMaterial = this.createShaderMaterial();

    this.initGrid();
  }

  private createShaderMaterial(): ShaderMaterial {
    return new ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        tint: { value: new Color(VHSGrid.GRID_COLOR) },
        opacity: { value: VHSGrid.FLOOR_OPACITY },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 tint;
        uniform float opacity;
        varying vec2 vUv;
        
        void main() {
          float wave = sin(vUv.y * 20.0 + time * 0.5) * 0.3;
          float noise = fract(sin(dot(vUv, vec2(12.9898,78.233))) * 43758.5453123) * 0.05;
          vec3 color = tint + vec3(wave + noise);
          gl_FragColor = vec4(color, opacity);
        }
      `,
      transparent: true,
      side: DoubleSide,
    });
  }

  private initGrid() {
    // Создаем базовую сетку
    const grid = new GridHelper(
      VHSGrid.GRID_SIZE,
      VHSGrid.GRID_DIVISIONS,
      VHSGrid.GRID_COLOR,
      VHSGrid.GRID_COLOR
    );
    grid.position.y = this.yPosition;

    // Создаем плоскость под сеткой
    const floorGeometry = new PlaneGeometry(
      VHSGrid.GRID_SIZE,
      VHSGrid.GRID_SIZE,
      VHSGrid.GRID_DIVISIONS,
      VHSGrid.GRID_DIVISIONS
    );
    const floor = new Mesh(floorGeometry, this.vhsShaderMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = this.yPosition - 0.01; // Немного ниже сетки

    this.mesh.add(grid);
    this.mesh.add(floor);
  }

  public update() {
    if (this.vhsShaderMaterial.uniforms) {
      this.vhsShaderMaterial.uniforms.time.value += 0.1;
    }
  }

  public setColor(color: number) {
    if (this.vhsShaderMaterial.uniforms) {
      this.vhsShaderMaterial.uniforms.tint.value = new Color(color);
    }
  }

  public setOpacity(opacity: number) {
    if (this.vhsShaderMaterial.uniforms) {
      this.vhsShaderMaterial.uniforms.opacity.value = opacity;
    }
  }
}
