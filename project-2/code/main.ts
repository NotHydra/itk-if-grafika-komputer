class Ball {
	balPos: number = 0;
	balFlo: number = 400; // Initial floor position (relative to ground)
	axis: number = 0; // Rotation axis for skeleton
	skel: number = 0; // Skeleton deformation based on drop height
	velocity: number = 300;

	// Initial skeleton points (relative to ball center)
	x1 = 100;
	y1 = 100;
	x2 = 100;
	y2 = 700;
	x3 = 700;
	y3 = 700;
	x4 = 700;
	y4 = 100;

	readonly BALL_DIA = 100;
	readonly SSA = 8;

	get ballRad() {
		return (this.BALL_DIA * this.SSA) / 2;
	}

	reset() {
		this.balPos = 0;
		this.balFlo = 400;
		this.axis = 0;
		this.skel = 0;
		this.velocity = 300;
		this.x1 = 100;
		this.y1 = 100;
		this.x2 = 100;
		this.y2 = 700;
		this.x3 = 700;
		this.y3 = 700;
		this.x4 = 700;
		this.y4 = 100;
	}
}

class Renderer {
	private ctx: CanvasRenderingContext2D;
	private imageData: ImageData;
	private data: Uint8ClampedArray;

	// For Super-Sampling Anti-Aliasing (SSA)
	private hiBuf: Uint8ClampedArray;
	private hiW: number;
	readonly W: number;
	readonly H: number;

	constructor(canvas: HTMLCanvasElement) {
		this.ctx = canvas.getContext("2d")!;
		this.W = canvas.width;
		this.H = canvas.height;
		this.imageData = this.ctx.createImageData(this.W, this.H);
		this.data = this.imageData.data;

		// SSA buffer is 8x resolution
		this.hiW = 8 * 100;
		this.hiBuf = new Uint8ClampedArray(this.hiW * this.hiW * 4);
	}

	clear(r = 0, g = 0, b = 0) {
		const d = this.data;
		for (let i = 0; i < d.length; i += 4) {
			d[i] = r;
			d[i + 1] = g;
			d[i + 2] = b;
			d[i + 3] = 255;
		}
	}

	putPixel(x: number, y: number, r: number, g: number, b: number, a = 255) {
		const xi = Math.round(x),
			yi = Math.round(y);

		if (xi < 0 || xi >= this.W || yi < 0 || yi >= this.H) {
			return;
		}

		const i = (yi * this.W + xi) * 4;
		this.data[i] = r;
		this.data[i + 1] = g;
		this.data[i + 2] = b;
		this.data[i + 3] = a;
	}

	getPixel(x: number, y: number): [number, number, number, number] {
		const i = (y * this.W + x) * 4;

		return [
			this.data[i],
			this.data[i + 1],
			this.data[i + 2],
			this.data[i + 3],
		];
	}

	flush() {
		this.ctx.putImageData(this.imageData, 0, 0);
	}

	// Midpoint Circle Algorithm
	// Draws 8 symmetric points for each octant
	private _circlePoints(
		cx: number,
		cy: number,
		x: number,
		y: number,
		buf: Uint8ClampedArray,
		W: number,
		col: number,
	) {
		const set = (px: number, py: number) => {
			if (px < 0 || px >= W || py < 0 || py >= W) {
				return;
			}

			const i = (py * W + px) * 4;

			// Set color
			buf[i] = (col >> 16) & 255;
			buf[i + 1] = (col >> 8) & 255;
			buf[i + 2] = col & 255;
			buf[i + 3] = 255;
		};
		set(cx + x, cy + y);
		set(cx - x, cy + y);
		set(cx + x, cy - y);
		set(cx - x, cy - y);
		set(cx + y, cy + x);
		set(cx - y, cy + x);
		set(cx + y, cy - x);
		set(cx - y, cy - x);
	}

	// DDA Line Algorithm
	// Draws a line from (x0, y0) to (xn, yn) on the given buffer
	private _ddaLine(
		x0: number,
		y0: number,
		xn: number,
		yn: number,
		buf: Uint8ClampedArray,
		W: number,
		col: number,
	) {
		const setP = (px: number, py: number) => {
			const xi = Math.round(px);
			const yi = Math.round(py);

			if (xi < 0 || xi >= W || yi < 0 || yi >= W) {
				return;
			}

			const i = (yi * W + xi) * 4;
			buf[i] = (col >> 16) & 255;
			buf[i + 1] = (col >> 8) & 255;
			buf[i + 2] = col & 255;
			buf[i + 3] = 255;
		};

		const dx = Math.abs(xn - x0);
		const dy = Math.abs(yn - y0);

		const dt = dx > dy ? dx : dy;
		if (dt === 0) {
			setP(x0, y0);

			return;
		}

		const xt = dx / dt;
		const yt = dy / dt;

		let xc = x0;
		let yc = y0;

		// Determine step direction based on the sign of the difference
		const sx = xn >= x0 ? xt : -xt;
		const sy = yn >= y0 ? yt : -yt;
		const steps = Math.ceil(dt) + 1;
		for (let i = 0; i < steps; i++) {
			setP(xc, yc);

			xc += sx;
			yc += sy;
		}
	}

	// Super-Sampling Anti-Aliasing
	// Downsamples the hi-res buffer to a 100x100 ImageData by averaging blocks of pixels
	private _ssaDownsample(
		hiBuf: Uint8ClampedArray,
		hiW: number,
		ssa: number,
	): ImageData {
		const loW = hiW / ssa;
		const result = new ImageData(loW, loW);
		const d = result.data;
		for (let by = 0; by < loW; by++) {
			for (let bx = 0; bx < loW; bx++) {
				let rSum = 0;
				let gSum = 0;
				let bSum = 0;
				let aSum = 0;

				for (let j = 0; j < ssa; j++) {
					for (let i = 0; i < ssa; i++) {
						const px = bx * ssa + i;
						const py = by * ssa + j;

						const idx = (py * hiW + px) * 4;
						rSum += hiBuf[idx];
						gSum += hiBuf[idx + 1];
						bSum += hiBuf[idx + 2];
						aSum += hiBuf[idx + 3];
					}
				}

				const n = ssa * ssa;
				let ar = Math.min(255, (rSum / n) | 0);
				let ag = Math.min(255, (gSum / n) | 0);
				let ab = Math.min(255, (bSum / n) | 0);
				let aa = Math.min(255, (aSum / n) | 0);

				// If the block is fully transparent, keep it transparent.
				// If the block is fully opaque and has a uniform color, make it fully opaque white to enhance contrast.
				if (ar === 0 && ag === 0 && ab === 0) {
					aa = 0;
				} else if (ar === ag && ag === ab) {
					ar = 255;
					ag = 255;
					ab = 255;
				}

				const oi = (by * loW + bx) * 4;
				d[oi] = ar;
				d[oi + 1] = ag;
				d[oi + 2] = ab;
				d[oi + 3] = aa;
			}
		}
		return result;
	}

	// Ground Line
	renderGround(groundY: number) {
		for (let x = 0; x < this.W; x++) {
			this.putPixel(x, groundY, 100, 100, 100);
		}
	}

	// Full Ball Render
	// Renders the ball with SSA and skeleton lines based on the current state of the ball
	renderBall(ball: Ball) {
		const { SSA, ballRad, BALL_DIA, x1, y1, x2, y2, x3, y3, x4, y4, skel } =
			ball;

		const hiW = this.hiW;
		const hiBuf = this.hiBuf;

		// Clear hi-res buffer
		hiBuf.fill(0);

		const cx = ballRad,
			cy = ballRad;

		// Step 1: Draw the ball circle on the hi-res buffer using the Midpoint Circle Algorithm
		const WHITE = 0xffffff;
		const setRow = (y: number, x1: number, x2: number, c: number) => {
			const x1c = Math.max(0, x1);
			const x2c = Math.min(hiW - 1, x2);

			if (y < 0 || y >= hiW) {
				return;
			}

			const rowBase = y * hiW;
			for (let xi = x1c; xi <= x2c; xi++) {
				const i = (rowBase + xi) * 4;

				hiBuf[i] = (c >> 16) & 255;
				hiBuf[i + 1] = (c >> 8) & 255;
				hiBuf[i + 2] = c & 255;
				hiBuf[i + 3] = 255;
			}
		};
		{
			let bx = 0;
			let by = ballRad;
			let p = 1 - ballRad;

			setRow(cy - by, cx - bx, cx + bx, WHITE);
			setRow(cy + by, cx - bx, cx + bx, WHITE);
			setRow(cy - bx, cx - by, cx + by, WHITE);
			setRow(cy + bx, cx - by, cx + by, WHITE);

			while (bx < by) {
				if (p <= 0) {
					p += 2 * bx + 1;
					bx++;
				} else {
					p += 2 * (bx - by) + 1;
					bx++;
					by--;
				}

				setRow(cy - by, cx - bx, cx + bx, WHITE);
				setRow(cy + by, cx - bx, cx + bx, WHITE);
				setRow(cy - bx, cx - by, cx + by, WHITE);
				setRow(cy + bx, cx - by, cx + by, WHITE);
			}
		}

		// Step 2: Draw the skeleton lines on the hi-res buffer using the DDA Line Algorithm
		const BLUE = 0x0000ff;
		const RED = 0xff0000;

		const drawThick = (
			ax: number,
			ay: number,
			bx: number,
			by: number,
			col: number,
		) => {
			this._ddaLine(ax, ay, bx, by, hiBuf, hiW, col);

			for (const d of [1, 2, 3]) {
				this._ddaLine(ax + d, ay + d, bx + d, by + d, hiBuf, hiW, col);
				this._ddaLine(ax - d, ay - d, bx - d, by - d, hiBuf, hiW, col);
				this._ddaLine(ax + d, ay - d, bx + d, by - d, hiBuf, hiW, col);
				this._ddaLine(ax - d, ay + d, bx - d, by + d, hiBuf, hiW, col);
			}
		};

		drawThick(x1, y1, x3, y3, BLUE);
		drawThick(x2, y2, x4, y4, RED);

		// Step 3: Downsample the hi-res buffer to a 100x100 ImageData using SSA
		const loData = this._ssaDownsample(hiBuf, hiW, SSA);

		// Step 4: Draw the downsampled ball onto the main canvas at the correct position, scaling it based on the skeleton value
		const skelJ = skel * 1.5; // Scale skeleton influence for more visible effect
		const drawDia = BALL_DIA - Math.trunc(skelJ / 10); // Reduce diameter as skeleton value increases
		const screenX = ball.balPos + Math.trunc(skelJ / 20);
		const screenY = ball.balFlo - BALL_DIA + Math.trunc(skelJ / 10);

		if (drawDia <= 0) {
			return;
		}

		const scale = drawDia / 100;
		for (let py = 0; py < drawDia; py++) {
			for (let px = 0; px < drawDia; px++) {
				const srcX = Math.min(99, (px / scale) | 0);
				const srcY = Math.min(99, (py / scale) | 0);

				const si = (srcY * 100 + srcX) * 4;
				const a = loData.data[si + 3];

				if (a === 0) {
					continue;
				}

				this.putPixel(
					screenX + px,
					screenY + py,
					loData.data[si],
					loData.data[si + 1],
					loData.data[si + 2],
					a,
				);
			}
		}
	}
}

class PhysicsEngine {
	private ball: Ball;
	readonly GROUND: number;
	readonly MIN_X: number = 0; // Left boundary for rolling
	readonly MAX_X: number = 700; // Right boundary for rolling
	private dropActive = false;
	private gravityAccum = 0;
	private isDrop = true;

	constructor(ball: Ball, groundY: number) {
		this.ball = ball;
		this.GROUND = groundY;
	}

	// Moves the ball to the right
	stepRight(): boolean {
		const b = this.ball;
		const G = 1;

		let cur = b.balPos + Math.trunc(b.velocity / 10);
		if (cur > this.MAX_X) {
			const ov = cur - this.MAX_X;
			cur = this.MAX_X - ov;

			b.velocity -= G;
			b.velocity *= -1;
		} else {
			b.velocity -= G;
		}

		b.axis = -(b.balPos - cur);
		b.balPos = cur;

		this._rotate();

		return b.velocity > 0;
	}

	// Moves the ball to the left
	stepLeft(): boolean {
		const b = this.ball;
		const G = 1;

		let cur = b.balPos + Math.trunc(b.velocity / 10);
		if (cur < this.MIN_X) {
			const ov = cur - this.MIN_X;

			cur = ov - this.MIN_X;

			b.velocity += G;
			b.velocity *= -1;
		} else {
			b.velocity += G;
		}

		b.axis = -(b.balPos - cur);
		b.balPos = cur;

		this._rotate();

		return b.velocity < 0;
	}

	startDrop(sliderY: HTMLInputElement) {
		this.gravityAccum = 0;
		this.isDrop = true;
		this.dropActive = true;

		// If the slider is at 0, set it to 300 to start the drop from a visible height
		if (parseInt(sliderY.value) === 0) {
			sliderY.value = "300";
		}
	}

	// Simulates the drop of the ball under gravity
	tickDrop(sliderY: HTMLInputElement): boolean {
		if (!this.dropActive) {
			return false;
		}

		const b = this.ball;
		let val = parseInt(sliderY.value);

		if (this.isDrop) {
			// Apply gravity
			this.gravityAccum += 1;
			val = val - this.gravityAccum;

			// Clamp the value to prevent it from going below 0
			if (val < 0) {
				val = 0;
			}

			sliderY.value = String(val);
			b.balFlo = this.GROUND - val;
			b.skel = val;

			// If the ball has reached the ground, stop the drop
			if (val === 0) {
				this.isDrop = false;
			}
		} else {
			// Apply bounce effect
			this.gravityAccum -= 2;
			val = val + this.gravityAccum;

			if (val < 0) {
				val = 0;
			}

			if (val > 400) {
				val = 400;
			}

			sliderY.value = String(val);
			b.balFlo = this.GROUND - val;
			b.skel = val;

			// If the ball starts falling again, reactivate the drop
			if (this.gravityAccum < 0) {
				this.isDrop = true;
			}
		}

		// If the slider is at 0 and the ball is not moving upwards, end the drop
		const sliderVal = parseInt(sliderY.value);
		if (sliderVal <= 0 && this.gravityAccum <= 0) {
			this.dropActive = false;

			b.balFlo = this.GROUND;
			b.skel = 0;

			sliderY.value = "0";

			return false;
		}

		return true;
	}

	get isDropActive() {
		return this.dropActive;
	}

	// Rotates the skeleton points of the ball based on the current axis value to simulate rolling
	private _rotate() {
		const b = this.ball;
		const cx = b.ballRad;
		const cy = b.ballRad;
		const θ = (b.axis * Math.PI) / 180;
		const cos = Math.cos(θ);
		const sin = Math.sin(θ);

		const rot = (x: number, y: number): [number, number] => [
			Math.round(cx + (x - cx) * cos - (y - cy) * sin),
			Math.round(cy + (x - cx) * sin + (y - cy) * cos),
		];

		[b.x1, b.y1] = rot(b.x1, b.y1);
		[b.x2, b.y2] = rot(b.x2, b.y2);
		[b.x3, b.y3] = rot(b.x3, b.y3);
		[b.x4, b.y4] = rot(b.x4, b.y4);
	}
}

class UIController {
	readonly sliderX: HTMLInputElement;
	readonly sliderY: HTMLInputElement;
	readonly velInput: HTMLInputElement;
	private xVal: HTMLElement;
	private yVal: HTMLElement;
	private ball: Ball;
	private phys: PhysicsEngine;
	private rend: Renderer;
	private rollId = 0;
	private dropId = 0;

	constructor(ball: Ball, phys: PhysicsEngine, rend: Renderer) {
		this.ball = ball;
		this.phys = phys;
		this.rend = rend;
		this.sliderX = document.getElementById("sliderX") as HTMLInputElement;
		this.sliderY = document.getElementById("sliderY") as HTMLInputElement;
		this.velInput = document.getElementById(
			"velocityInput",
		) as HTMLInputElement;
		this.xVal = document.getElementById("sliderXVal")!;
		this.yVal = document.getElementById("sliderYVal")!;

		this._bind();
	}

	private _vel() {
		return Math.abs(parseInt(this.velInput.value) || 300);
	}

	private _bind() {
		// Update ball position and axis when sliderX changes, then re-render
		this.sliderX.addEventListener("input", () => {
			const v = parseInt(this.sliderX.value);

			this.xVal.textContent = String(v);
			this.ball.axis = -(this.ball.balPos - v);
			this.ball.balPos = v;
			this._render();
		});

		// Update ball floor and skeleton when sliderY changes, then re-render
		this.sliderY.addEventListener("input", () => {
			const v = parseInt(this.sliderY.value);

			this.yVal.textContent = String(v);
			this.ball.skel = v;
			this.ball.balFlo = this.rend.H - 100 - v; //
			this._render();
		});

		document
			.getElementById("btnStepLeft")!
			.addEventListener("click", () => {
				this.ball.velocity = -this._vel();
				this.phys.stepLeft();

				this._syncX();
				this._render();
			});

		document
			.getElementById("btnStepRight")!
			.addEventListener("click", () => {
				this.ball.velocity = this._vel();
				this.phys.stepRight();

				this._syncX();
				this._render();
			});

		document
			.getElementById("btnRollLeft")!
			.addEventListener("click", () => this._roll(false));

		document
			.getElementById("btnRollRight")!
			.addEventListener("click", () => this._roll(true));

		document
			.getElementById("btnDrop")!
			.addEventListener("click", () => this._drop());

		document
			.getElementById("btnReset")!
			.addEventListener("click", () => this._reset());
	}

	private _roll(right: boolean) {
		cancelAnimationFrame(this.rollId);

		this.ball.velocity = right ? this._vel() : -this._vel();

		// Use a fixed timestep for consistent physics updates regardless of frame rate
		let lastTime = performance.now();
		let accum = 0;
		const STEP_MS = 10; // 10ms per physics step (~100 FPS)

		const tick = (now: number) => {
			accum += now - lastTime;
			lastTime = now;

			// Process physics steps in fixed increments to ensure consistent behavior even if frame times vary
			while (accum >= STEP_MS && this.ball.velocity !== 0) {
				accum -= STEP_MS;
				const v = this.ball.velocity;

				if (v > 0) {
					this.phys.stepRight();
				} else if (v < 0) {
					this.phys.stepLeft();
				}
			}

			this._syncX();
			this._render();

			if (this.ball.velocity !== 0) {
				this.rollId = requestAnimationFrame(tick);
			}
		};

		this.rollId = requestAnimationFrame(tick);
	}

	private _drop() {
		cancelAnimationFrame(this.dropId);

		this.phys.startDrop(this.sliderY);

		// If the drop is not active (e.g., slider was at 0 and ball is on the ground), do nothing
		this.yVal.textContent = this.sliderY.value;
		this._render();

		let lastTime = performance.now();
		let accum = 0;

		const STEP_MS = 10;
		const tick = (now: number) => {
			accum += now - lastTime;
			lastTime = now;

			let cont = true;
			while (accum >= STEP_MS && cont) {
				accum -= STEP_MS;
				cont = this.phys.tickDrop(this.sliderY);
			}

			this.yVal.textContent = this.sliderY.value;
			this._render();

			if (cont) {
				this.dropId = requestAnimationFrame(tick);
			}
		};

		this.dropId = requestAnimationFrame(tick);
	}

	private _reset() {
		cancelAnimationFrame(this.rollId);
		cancelAnimationFrame(this.dropId);

		this.ball.reset();
		this.sliderX.value = "0";
		this.sliderY.value = "0";
		this.xVal.textContent = "0";
		this.yVal.textContent = "0";
		this.velInput.value = "300";

		this._render();
	}

	private _syncX() {
		this.sliderX.value = String(
			Math.max(0, Math.min(700, this.ball.balPos)),
		);

		this.xVal.textContent = this.sliderX.value;

		// If the ball is out of bounds, clamp the slider to the edge and update the ball position accordingly
		this.velInput.value = String(this.ball.velocity);
	}

	private _render() {
		this.rend.clear();
		this.rend.renderGround(this.rend.H - 100);
		this.rend.renderBall(this.ball);
		this.rend.flush();
	}
}

// Initialization
const canvas = document.getElementById("simCanvas") as HTMLCanvasElement;
const ball = new Ball();
const rend = new Renderer(canvas);
const phys = new PhysicsEngine(ball, rend.H - 100);
const ui = new UIController(ball, phys, rend);

// Initial Render
rend.clear();
rend.renderGround(rend.H - 100);
rend.renderBall(ball);
rend.flush();
