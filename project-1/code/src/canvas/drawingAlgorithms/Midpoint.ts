export function drawLineMidpoint(
	ctx: CanvasRenderingContext2D,
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	color: string,
	pixelSize: number = 1,
): void {
	let xi = Math.round(x1);
	let yi = Math.round(y1);
	const x2i = Math.round(x2);
	const y2i = Math.round(y2);

	const dx = Math.abs(x2i - xi);
	const dy = Math.abs(y2i - yi);
	const sx = xi < x2i ? 1 : -1;
	const sy = yi < y2i ? 1 : -1;
	let err = dx - dy;

	ctx.fillStyle = color;
	while (true) {
		ctx.fillRect(xi, yi, pixelSize, pixelSize);
		if (xi === x2i && yi === y2i) break;
		const e2 = 2 * err;
		if (e2 > -dy) {
			err -= dy;
			xi += sx;
		}
		if (e2 < dx) {
			err += dx;
			yi += sy;
		}
	}
}

export function drawCircleMidpoint(
	ctx: CanvasRenderingContext2D,
	cx: number,
	cy: number,
	radius: number,
	color: string,
	pixelSize: number = 1,
): void {
	const cxi = Math.round(cx);
	const cyi = Math.round(cy);
	const r = Math.round(radius);

	let x = 0;
	let y = r;
	let d = 1 - r;

	ctx.fillStyle = color;

	const plot = (px: number, py: number): void => {
		ctx.fillRect(cxi + px, cyi + py, pixelSize, pixelSize);
		ctx.fillRect(cxi - px, cyi + py, pixelSize, pixelSize);
		ctx.fillRect(cxi + px, cyi - py, pixelSize, pixelSize);
		ctx.fillRect(cxi - px, cyi - py, pixelSize, pixelSize);
		ctx.fillRect(cxi + py, cyi + px, pixelSize, pixelSize);
		ctx.fillRect(cxi - py, cyi + px, pixelSize, pixelSize);
		ctx.fillRect(cxi + py, cyi - px, pixelSize, pixelSize);
		ctx.fillRect(cxi - py, cyi - px, pixelSize, pixelSize);
	};

	plot(x, y);
	while (x < y) {
		x++;
		if (d < 0) {
			d += 2 * x + 1;
		} else {
			y--;
			d += 2 * (x - y) + 1;
		}
		plot(x, y);
	}
}
