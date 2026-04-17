export function drawLineDDA(
	ctx: CanvasRenderingContext2D,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	color: string,
	pixelSize: number = 1,
): void {
	const dx = x2 - x1;
	const dy = y2 - y1;
	const steps = Math.max(Math.abs(dx), Math.abs(dy));

	ctx.fillStyle = color;

	if (steps === 0) {
		ctx.fillRect(Math.round(x1), Math.round(y1), pixelSize, pixelSize);
		return;
	}

	const xInc = dx / steps;
	const yInc = dy / steps;
	let x = x1;
	let y = y1;

	for (let i = 0; i <= steps; i++) {
		ctx.fillRect(Math.round(x), Math.round(y), pixelSize, pixelSize);
		x += xInc;
		y += yInc;
	}
}
