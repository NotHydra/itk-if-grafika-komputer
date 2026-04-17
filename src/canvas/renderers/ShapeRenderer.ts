import type { Shape2D, Theme } from "../../types";
import type { ICoordinateSystem } from "../CoordinateSystem";
import { ShapeRegistry } from "../shapes/ShapeRegistry";

export function renderShape(
	ctx: CanvasRenderingContext2D,
	shape: Shape2D,
	theme: Theme,
	coords: ICoordinateSystem,
	selectedId: string | null = null,
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

	// Selection highlight (bounding box)
	const isSelected = selectedId === shape.id;
	if (isSelected) {
		const bounds = def.getBounds(shape);
		ctx.setLineDash([5, 5]);
		ctx.strokeStyle = theme === "dark" ? "#fbbf24" : "#d97706"; // Amber highlight
		ctx.lineWidth = 1 / shape.scale; // Maintain thin line regardless of scale
		ctx.strokeRect(
			bounds.x - 4,
			bounds.y - 4,
			bounds.width + 8,
			bounds.height + 8,
		);
		ctx.setLineDash([]);
	}

	def.draw(ctx, shape, theme);
	ctx.restore();
}

export function renderShapes(
	ctx: CanvasRenderingContext2D,
	shapes: Shape2D[],
	theme: Theme,
	coords: ICoordinateSystem,
	selectedId: string | null = null,
): void {
	for (const shape of shapes) {
		renderShape(ctx, shape, theme, coords, selectedId);
	}
}
