import { evaluate } from 'mathjs';
import type { FunctionGraph, Theme } from '../../types';
import { getColorTokens } from '../../utils/color';
import type { ICoordinateSystem } from '../CoordinateSystem';

export function renderGraphs(
  ctx: CanvasRenderingContext2D,
  graphs: FunctionGraph[],
  theme: Theme,
  coords: ICoordinateSystem,
): void {
  const tokens = getColorTokens(theme);

  for (const graph of graphs) {
    if (graph.xMin >= graph.xMax || graph.sampleCount < 2) continue;

    const step = (graph.xMax - graph.xMin) / graph.sampleCount;
    let isFirstPoint = true;

    ctx.beginPath();

    for (let i = 0; i <= graph.sampleCount; i++) {
      const x = graph.xMin + i * step;

      try {
        const y = evaluate(graph.expression, { x });

        // Skip non-finite values (e.g. 1/0, sqrt(-1))
        if (!isFinite(y)) {
          isFirstPoint = true; // Break the line segment
          continue;
        }

        const screenPoint = coords.worldToScreen(x, y);

        if (isFirstPoint) {
          ctx.moveTo(screenPoint.x, screenPoint.y);
          isFirstPoint = false;
        } else {
          ctx.lineTo(screenPoint.x, screenPoint.y);
        }
      } catch (err) {
        // Break on evaluation error (e.g., partial expression typed in UI)
        break;
      }
    }

    ctx.strokeStyle = graph.color ?? tokens.lineDefault;
    ctx.lineWidth = graph.thickness ?? 2;
    ctx.stroke();

    if (graph.label) {
      // Put label near the end of the line
      try {
        const x = graph.xMax;
        const y = evaluate(graph.expression, { x });
        if (isFinite(y)) {
          const screenPoint = coords.worldToScreen(x, y);
          ctx.font = '12px Inter, system-ui, sans-serif';
          ctx.fillStyle = theme === 'dark' ? '#e2e8f0' : '#1e293b';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(graph.label, screenPoint.x + 8, screenPoint.y);
        }
      } catch (e) {
        // ignore
      }
    }
  }
}
