import type { LineSegment, Point2D, Theme } from "../../types";
import { getColorTokens } from "../../utils/color";
import type { ICoordinateSystem } from "../CoordinateSystem";
import { drawLineDDA } from "../drawingAlgorithms/DDA";
import { drawLineMidpoint } from "../drawingAlgorithms/Midpoint";

export function renderLines(
	ctx: CanvasRenderingContext2D,
	lines: LineSegment[],
	points: Point2D[],
	theme: Theme,
	coords: ICoordinateSystem,
): void {
	const tokens = getColorTokens(theme);

	for (const line of lines) {
		let { x1, y1, x2, y2 } = line;

		// Resolve attached points if any
		if (line.point1Id) {
			const p1 = points.find((p) => p.id === line.point1Id);
			if (p1) {
				x1 = p1.x;
				y1 = p1.y;
			}
		}
		if (line.point2Id) {
			const p2 = points.find((p) => p.id === line.point2Id);
			if (p2) {
				x2 = p2.x;
				y2 = p2.y;
			}
		}

		const start = coords.worldToScreen(x1, y1);
		const end = coords.worldToScreen(x2, y2);

		const color = line.color ?? tokens.lineDefault;

		if (line.algorithm === "DDA") {
			drawLineDDA(ctx, start.x, start.y, end.x, end.y, color, line.thickness ?? 1);
		} else if (line.algorithm === "midpoint") {
			drawLineMidpoint(ctx, start.x, start.y, end.x, end.y, color, line.thickness ?? 1);
		} else {
			ctx.beginPath();
			ctx.moveTo(start.x, start.y);
			ctx.lineTo(end.x, end.y);
			ctx.strokeStyle = color;
			ctx.lineWidth = line.thickness ?? 2;
			ctx.stroke();
		}

		if (line.label) {
			const midX = (start.x + end.x) / 2;
			const midY = (start.y + end.y) / 2;
			ctx.font = "12px Inter, system-ui, sans-serif";
			ctx.fillStyle = theme === "dark" ? "#e2e8f0" : "#1e293b";
			ctx.textAlign = "center";
			ctx.textBaseline = "bottom";
			ctx.fillText(line.label, midX, midY - 6);
		}
	}
}
