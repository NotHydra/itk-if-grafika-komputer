import type { CanvasTransform, FunctionGraph, LightSource, LineSegment, OpticsObject, Point2D, ShadowResult, Shape2D, Theme } from '../types';
import { getColorTokens } from '../utils/color';
import { CoordinateSystem } from './CoordinateSystem';
import { renderGraphs } from './renderers/GraphRenderer';
import { renderGrid } from './renderers/GridRenderer';
import { renderLines } from './renderers/LineRenderer';
import { renderOptics } from './renderers/OpticsRenderer';
import { renderSinglePoint } from './renderers/PointRenderer';
import { renderShapes } from './renderers/ShapeRenderer';

export interface CanvasEngineState {
  theme: Theme;
  transform: CanvasTransform;
  gridScale: number;
  points: Point2D[];
  lines: LineSegment[];
  graphs: FunctionGraph[];
  shapes: Shape2D[];
  opticsObjects: OpticsObject[];
  lightSources: LightSource[];
  shadowResults: ShadowResult[];
  selectedObjectId: string | null;
}

export class CanvasEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private coords: CoordinateSystem;
  private animId: number | null = null;
  private state: CanvasEngineState;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get 2D context');
    this.ctx = ctx;
    this.coords = new CoordinateSystem();
    this.state = {
      theme: 'dark',
      transform: { originX: 0, originY: 0, scale: 40 },
      gridScale: 1,
      points: [],
      lines: [],
      graphs: [],
      shapes: [],
      opticsObjects: [],
      lightSources: [],
      shadowResults: [],
      selectedObjectId: null,
    };
  }

  updateState(newState: Partial<CanvasEngineState>): void {
    this.state = { ...this.state, ...newState };
  }

  resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  render(): void {
    const { ctx, state, coords } = this;
    const width = this.canvas.getBoundingClientRect().width;
    const height = this.canvas.getBoundingClientRect().height;

    // Update coordinate system
    coords.update(width, height, state.transform);

    // Clear canvas
    const tokens = getColorTokens(state.theme);
    ctx.fillStyle = tokens.canvasBg;
    ctx.fillRect(0, 0, width, height);

    // Render pipeline: Grid → Points → Lines → Graphs → Shapes → Optics
    renderGrid(ctx, width, height, state.theme, coords, state.transform, state.gridScale);

    // Render points using dedicated point renderer
    for (const point of state.points) {
      renderSinglePoint(ctx, point, state.theme, coords, point.id === state.selectedObjectId);
    }

    // Render lines (stub until Step 2)
    renderLines(ctx, state.lines, state.theme, coords);

    // Render graphs (stub until Step 2)
    renderGraphs(ctx, state.graphs, state.theme, coords);

    // Render shapes (stub until Step 3)
    renderShapes(ctx, state.shapes, state.theme, coords);

    // Render optics (stub until Step 4)
    renderOptics(ctx, state.opticsObjects, state.lightSources, state.shadowResults, state.theme, coords);
  }

  start(): void {
    const loop = () => {
      this.render();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  stop(): void {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  getCoordinateSystem(): CoordinateSystem {
    return this.coords;
  }
}
