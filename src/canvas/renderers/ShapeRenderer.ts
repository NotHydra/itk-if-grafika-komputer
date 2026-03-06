import type { Shape2D, Theme } from '../../types';
import type { ICoordinateSystem } from '../CoordinateSystem';
import { ShapeRegistry } from '../shapes/ShapeRegistry';

export function renderShape(
  ctx: CanvasRenderingContext2D,
  shape: Shape2D,
  theme: Theme,
  coords: ICoordinateSystem,
): void {
  const def = ShapeRegistry.get(shape.type);
  if (!def) {
    console.warn(`ShapeRenderer: no definition for type "${shape.type}"`);
    return;
  }
  const { x: screenX, y: screenY } = coords.worldToScreen(shape.x, shape.y);
  ctx.save();
  ctx.translate(screenX, screenY);
  ctx.rotate((shape.rotation * Math.PI) / 180);
  ctx.scale(shape.scale, shape.scale);
  def.draw(ctx, shape, theme);
  ctx.restore();
}

export function renderShapes(
  ctx: CanvasRenderingContext2D,
  shapes: Shape2D[],
  theme: Theme,
  coords: ICoordinateSystem,
): void {
  for (const shape of shapes) {
    renderShape(ctx, shape, theme, coords);
  }
}
