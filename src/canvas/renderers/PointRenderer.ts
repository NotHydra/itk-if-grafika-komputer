import type { Point2D, Theme } from '../../types';
import { getColorTokens } from '../../utils/color';
import type { ICoordinateSystem } from '../CoordinateSystem';

export function renderSinglePoint(
  ctx: CanvasRenderingContext2D,
  point: Point2D,
  theme: Theme,
  coords: ICoordinateSystem,
  isSelected: boolean,
): void {
  const tokens = getColorTokens(theme);
  const { x: sx, y: sy } = coords.worldToScreen(point.x, point.y);
  const radius = point.size ?? 6;
  const color = point.color ?? tokens.pointDefault;

  // Selected highlight ring
  if (isSelected) {
    ctx.beginPath();
    ctx.arc(sx, sy, radius + 4, 0, Math.PI * 2);
    ctx.strokeStyle = tokens.selected;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Point fill with glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.arc(sx, sy, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.shadowBlur = 0;

  // Point stroke
  ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Label
  const labelText = point.label
    ? `${point.label} (${point.x}, ${point.y})`
    : `(${point.x}, ${point.y})`;
  ctx.font = '12px Inter, system-ui, sans-serif';
  ctx.fillStyle = theme === 'dark' ? '#e2e8f0' : '#1e293b';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(labelText, sx + radius + 4, sy - 4);
}
