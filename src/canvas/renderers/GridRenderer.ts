import type { CanvasTransform, Point2D, Theme } from '../../types';
import { getColorTokens } from '../../utils/color';
import type { ICoordinateSystem } from '../CoordinateSystem';

export function renderGrid(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  theme: Theme,
  coords: ICoordinateSystem,
  transform: CanvasTransform,
  gridScale: number,
): void {
  const tokens = getColorTokens(theme);
  const scale = transform.scale;
  const origin = {
    x: transform.originX || width / 2,
    y: transform.originY || height / 2,
  };

  // Calculate visible world range
  const worldLeft = -origin.x / scale;
  const worldRight = (width - origin.x) / scale;
  const worldBottom = -(height - origin.y) / scale;
  const worldTop = origin.y / scale;

  // Determine grid spacing in world units
  const gridSpacing = gridScale;

  // Draw minor gridlines
  ctx.strokeStyle = tokens.gridMinor;
  ctx.lineWidth = 0.5;
  ctx.beginPath();

  const minorSpacing = gridSpacing / 5;
  const minorStartX = Math.floor(worldLeft / minorSpacing) * minorSpacing;
  const minorStartY = Math.floor(worldBottom / minorSpacing) * minorSpacing;

  for (let wx = minorStartX; wx <= worldRight; wx += minorSpacing) {
    if (Math.abs(wx % gridSpacing) < 0.001) continue; // skip major lines
    const screen = coords.worldToScreen(wx, 0);
    ctx.moveTo(screen.x, 0);
    ctx.lineTo(screen.x, height);
  }
  for (let wy = minorStartY; wy <= worldTop; wy += minorSpacing) {
    if (Math.abs(wy % gridSpacing) < 0.001) continue;
    const screen = coords.worldToScreen(0, wy);
    ctx.moveTo(0, screen.y);
    ctx.lineTo(width, screen.y);
  }
  ctx.stroke();

  // Draw major gridlines
  ctx.strokeStyle = tokens.gridMajor;
  ctx.lineWidth = 0.8;
  ctx.beginPath();

  const startX = Math.floor(worldLeft / gridSpacing) * gridSpacing;
  const startY = Math.floor(worldBottom / gridSpacing) * gridSpacing;

  for (let wx = startX; wx <= worldRight; wx += gridSpacing) {
    if (Math.abs(wx) < 0.001) continue; // skip axis
    const screen = coords.worldToScreen(wx, 0);
    ctx.moveTo(screen.x, 0);
    ctx.lineTo(screen.x, height);
  }
  for (let wy = startY; wy <= worldTop; wy += gridSpacing) {
    if (Math.abs(wy) < 0.001) continue;
    const screen = coords.worldToScreen(0, wy);
    ctx.moveTo(0, screen.y);
    ctx.lineTo(width, screen.y);
  }
  ctx.stroke();

  // Draw axes
  ctx.strokeStyle = tokens.axisLine;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  // X axis
  ctx.moveTo(0, origin.y);
  ctx.lineTo(width, origin.y);
  // Y axis
  ctx.moveTo(origin.x, 0);
  ctx.lineTo(origin.x, height);
  ctx.stroke();

  // Draw tick marks and labels
  ctx.fillStyle = tokens.axisLine;
  ctx.font = '11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  for (let wx = startX; wx <= worldRight; wx += gridSpacing) {
    if (Math.abs(wx) < 0.001) continue;
    const screen = coords.worldToScreen(wx, 0);
    // Tick mark on X axis
    ctx.beginPath();
    ctx.moveTo(screen.x, origin.y - 4);
    ctx.lineTo(screen.x, origin.y + 4);
    ctx.strokeStyle = tokens.axisLine;
    ctx.lineWidth = 1;
    ctx.stroke();
    // Label
    const label = Number.isInteger(wx) ? wx.toString() : wx.toFixed(1);
    ctx.fillText(label, screen.x, origin.y + 8);
  }

  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let wy = startY; wy <= worldTop; wy += gridSpacing) {
    if (Math.abs(wy) < 0.001) continue;
    const screen = coords.worldToScreen(0, wy);
    // Tick mark on Y axis
    ctx.beginPath();
    ctx.moveTo(origin.x - 4, screen.y);
    ctx.lineTo(origin.x + 4, screen.y);
    ctx.strokeStyle = tokens.axisLine;
    ctx.lineWidth = 1;
    ctx.stroke();
    // Label
    const label = Number.isInteger(wy) ? wy.toString() : wy.toFixed(1);
    ctx.fillText(label, origin.x - 8, screen.y);
  }

  // Origin label
  ctx.textAlign = 'right';
  ctx.textBaseline = 'top';
  ctx.fillText('0', origin.x - 6, origin.y + 6);
}

export function renderPoints(
  ctx: CanvasRenderingContext2D,
  points: Point2D[],
  theme: Theme,
  coords: ICoordinateSystem,
  selectedId: string | null,
): void {
  const tokens = getColorTokens(theme);

  for (const point of points) {
    const { x: sx, y: sy } = coords.worldToScreen(point.x, point.y);
    const radius = point.size ?? 6;
    const color = point.color ?? tokens.pointDefault;

    // Selected highlight ring
    if (point.id === selectedId) {
      ctx.beginPath();
      ctx.arc(sx, sy, radius + 4, 0, Math.PI * 2);
      ctx.strokeStyle = tokens.selected;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Point fill
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Point stroke
    ctx.strokeStyle = theme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Label
    if (point.label || true) {
      const labelText = point.label
        ? `${point.label} (${point.x}, ${point.y})`
        : `(${point.x}, ${point.y})`;
      ctx.font = '12px Inter, system-ui, sans-serif';
      ctx.fillStyle = theme === 'dark' ? '#e2e8f0' : '#1e293b';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'bottom';
      ctx.fillText(labelText, sx + radius + 4, sy - 4);
    }
  }
}
