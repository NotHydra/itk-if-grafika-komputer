import type { CanvasTransform } from "../types";

export interface ICoordinateSystem {
	/** Convert a world-space point to canvas pixel coordinates */
	worldToScreen(wx: number, wy: number): { x: number; y: number };
	/** Convert a canvas pixel coordinate back to world space */
	screenToWorld(sx: number, sy: number): { x: number; y: number };
	/** Update the transform when canvas size or pan/zoom changes */
	update(
		canvasWidth: number,
		canvasHeight: number,
		transform: CanvasTransform,
	): void;
	/** Get current zoom scale */
	getScale(): number;
}

export class CoordinateSystem implements ICoordinateSystem {
	private originX = 0;
	private originY = 0;
	private scale = 40; // pixels per world unit

	update(
		canvasWidth: number,
		canvasHeight: number,
		transform: CanvasTransform,
	): void {
		// If originX/originY are 0, use canvas center (initial state)
		this.originX = transform.originX || canvasWidth / 2;
		this.originY = transform.originY || canvasHeight / 2;
		this.scale = transform.scale;
	}

	worldToScreen(wx: number, wy: number): { x: number; y: number } {
		return {
			x: this.originX + wx * this.scale,
			y: this.originY - wy * this.scale, // Y is inverted: world Y up → screen Y down
		};
	}

	screenToWorld(sx: number, sy: number): { x: number; y: number } {
		return {
			x: (sx - this.originX) / this.scale,
			y: (this.originY - sy) / this.scale, // invert Y
		};
	}

	getScale(): number {
		return this.scale;
	}

	getOrigin(): { x: number; y: number } {
		return { x: this.originX, y: this.originY };
	}
}
