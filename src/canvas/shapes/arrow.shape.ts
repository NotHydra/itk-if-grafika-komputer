import { metaNum } from "../../utils/shapeUtils";
import { ShapeRegistry } from "./ShapeRegistry";

ShapeRegistry.register({
	id: "arrow",
	label: "Arrow",
	icon: "arrow-up",
	defaultColor: "#ef4444",
	draw(ctx, shape, _theme) {
		const totalHeight = metaNum(shape.meta, "height", 80);
		const headSize = metaNum(shape.meta, "headSize", 20);
		const shaftWidth = 8;
		const shaftHeight = totalHeight - headSize;

		ctx.fillStyle = shape.color ?? "#ef4444";

		// Shaft: from base (y=0) upward to y=-shaftHeight
		ctx.fillRect(-shaftWidth / 2, -shaftHeight, shaftWidth, shaftHeight);

		// Arrowhead: triangle pointing upward
		ctx.beginPath();
		ctx.moveTo(0, -totalHeight);             // tip
		ctx.lineTo(-headSize / 2, -shaftHeight); // lower-left corner
		ctx.lineTo(headSize / 2, -shaftHeight);  // lower-right corner
		ctx.closePath();
		ctx.fill();
	},
	getBounds(shape) {
		const totalHeight = metaNum(shape.meta, "height", 80);
		const headSize = metaNum(shape.meta, "headSize", 20);
		return {
			x: -headSize / 2,
			y: -totalHeight, // topmost pixel
			width: headSize,
			height: totalHeight, // reaches down to y=0 (local origin)
		};
	},
	inspectorFields: [
		{
			key: "height",
			label: "Height",
			type: "range",
			min: 30,
			max: 200,
			step: 5,
			defaultValue: 80,
		},
		{
			key: "headSize",
			label: "Head Size",
			type: "range",
			min: 10,
			max: 50,
			step: 1,
			defaultValue: 20,
		},
	],
});
