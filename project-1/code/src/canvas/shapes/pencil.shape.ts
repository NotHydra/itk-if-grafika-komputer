import { metaNum } from "../../utils/shapeUtils";
import { ShapeRegistry } from "./ShapeRegistry";

ShapeRegistry.register({
	id: "pencil",
	label: "Pencil",
	icon: "pencil",
	defaultColor: "#f5c542",
	draw(ctx, shape, _theme) {
		const totalHeight = metaNum(shape.meta, "length", 80);
		const w = 10;
		const eraserH = 10;
		const tipH = 14;
		const bodyH = totalHeight - eraserH - tipH;

		// Eraser (pink) — at the base, from y=0 upward to y=-eraserH
		ctx.fillStyle = "#f48fb1";
		ctx.fillRect(-w / 2, -eraserH, w, eraserH);

		// Body (yellow) — from y=-eraserH upward to y=-(eraserH+bodyH)
		ctx.fillStyle = shape.color ?? "#f5c542";
		ctx.fillRect(-w / 2, -(eraserH + bodyH), w, bodyH);

		// Tip taper (dark gold) — triangle pointing up
		ctx.beginPath();
		ctx.moveTo(0, -totalHeight);              // sharp tip at top
		ctx.lineTo(-w / 2, -(eraserH + bodyH));  // lower-left of taper
		ctx.lineTo(w / 2, -(eraserH + bodyH));   // lower-right of taper
		ctx.closePath();
		ctx.fillStyle = "#d4a017";
		ctx.fill();
	},
	getBounds(shape) {
		const totalHeight = metaNum(shape.meta, "length", 80);
		const w = 10;
		return {
			x: -w / 2,
			y: -totalHeight, // topmost pixel (graphite tip)
			width: w,
			height: totalHeight, // reaches down to y=0 (eraser base / local origin)
		};
	},
	inspectorFields: [
		{
			key: "length",
			label: "Height",
			type: "range",
			min: 40,
			max: 200,
			step: 5,
			defaultValue: 80,
		},
	],
});
