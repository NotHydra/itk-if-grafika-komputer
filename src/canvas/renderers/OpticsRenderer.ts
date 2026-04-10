import type {
	LightSource,
	OpticsObject,
	ShadowResult,
	Shape2D,
	Theme,
} from "../../types";
import type { ICoordinateSystem } from "../CoordinateSystem";
import { ShapeRegistry } from "../shapes/ShapeRegistry";
import { renderShape } from "./ShapeRenderer";

/**
 * Find the point where a ray (x0,y0) + t*(dx,dy) exits the canvas rectangle.
 * Returns the exit point in canvas pixel coordinates.
 * If the ray has zero length, returns the start point.
 */
function rayToEdge(
	x0: number,
	y0: number,
	dx: number,
	dy: number,
	w: number,
	h: number,
): { x: number; y: number } {
	if (dx === 0 && dy === 0) return { x: x0, y: y0 };
	let t = Infinity;
	if (dx > 0) t = Math.min(t, (w - x0) / dx);
	else if (dx < 0) t = Math.min(t, -x0 / dx);
	if (dy > 0) t = Math.min(t, (h - y0) / dy);
	else if (dy < 0) t = Math.min(t, -y0 / dy);
	return { x: x0 + t * dx, y: y0 + t * dy };
}

export function renderOptics(
	ctx: CanvasRenderingContext2D,
	opticsObjects: OpticsObject[],
	_lightSources: LightSource[],
	shadowResults: ShadowResult[],
	shapes: Shape2D[],
	theme: Theme,
	coords: ICoordinateSystem,
): void {
	const isDark = theme === "dark";
	const scale = coords.getScale();
	ctx.save();

	// 1. Draw Optics Devices
	for (const obj of opticsObjects) {
		const { x: sx, y: sy } = coords.worldToScreen(obj.x, obj.y);

		// Principal axis
		ctx.beginPath();
		ctx.moveTo(0, sy);
		ctx.lineTo(ctx.canvas.width, sy);
		ctx.strokeStyle = isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)";
		ctx.setLineDash([5, 5]);
		ctx.lineWidth = 1;
		ctx.stroke();
		ctx.setLineDash([]);

		// Draw optics device shape
		const halfHeightScreen = (obj.aperture * scale) / 2;
		const top = sy - halfHeightScreen;
		const bottom = sy + halfHeightScreen;
		const lensBulge = Math.max(8, halfHeightScreen * 0.35);
		const mirrorBulge = Math.max(10, halfHeightScreen * 0.45);
		const concaveRim = 4;
		const bigBulge = Math.max(14, halfHeightScreen * 0.5);

		ctx.lineCap = "round";
		ctx.lineJoin = "round";

		if (obj.type === "convex-lens") {
			// Double-convex: filled eye/football shape
			const color = isDark ? "#60a5fa" : "#2563eb";
			ctx.beginPath();
			ctx.moveTo(sx, top);
			ctx.quadraticCurveTo(sx + lensBulge, sy, sx, bottom);
			ctx.quadraticCurveTo(sx - lensBulge, sy, sx, top);
			ctx.closePath();
			ctx.fillStyle = isDark
				? "rgba(96,165,250,0.2)"
				: "rgba(37,99,235,0.15)";
			ctx.fill();
			ctx.strokeStyle = color;
			ctx.lineWidth = 2;
			ctx.stroke();
			// Outward arrows at top and bottom
			const aw = 4,
				ah = 6;
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(sx, top - ah);
			ctx.lineTo(sx - aw, top);
			ctx.lineTo(sx + aw, top);
			ctx.closePath();
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(sx, bottom + ah);
			ctx.lineTo(sx - aw, bottom);
			ctx.lineTo(sx + aw, bottom);
			ctx.closePath();
			ctx.fill();
		} else if (obj.type === "concave-lens") {
			// Biconcave: thin at center, thick at edges — )( shape
			// Draw as two separate concave arcs + connecting caps
			const color = isDark ? "#c084fc" : "#7c3aed";
			const fillColor = isDark
				? "rgba(192,132,252,0.12)"
				: "rgba(124,58,237,0.08)";
			const edgeOffset = Math.max(6, halfHeightScreen * 0.15); // half-width at top/bottom edges

			// Right surface ) — starts at (sx + edgeOffset, top), curves LEFT toward center, ends at (sx + edgeOffset, bottom)
			// At the midpoint the curve reaches sx (the center), making the lens thin there.
			// Left surface ( — starts at (sx - edgeOffset, top), curves RIGHT toward center, ends at (sx - edgeOffset, bottom)

			// Fill the shape: trace right surface down, bottom cap, left surface up, top cap
			ctx.beginPath();
			ctx.moveTo(sx + edgeOffset, top);
			ctx.quadraticCurveTo(sx, sy, sx + edgeOffset, bottom); // right ) surface toward center
			ctx.lineTo(sx - edgeOffset, bottom); // bottom cap
			ctx.quadraticCurveTo(sx, sy, sx - edgeOffset, top); // left ( surface toward center
			ctx.closePath(); // top cap
			ctx.fillStyle = fillColor;
			ctx.fill();
			ctx.strokeStyle = color;
			ctx.lineWidth = 2.5;
			ctx.stroke();

			// Inward arrows (pointing toward center)
			const aw = 4,
				ah = 6;
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.moveTo(sx, top + ah);
			ctx.lineTo(sx - aw, top);
			ctx.lineTo(sx + aw, top);
			ctx.closePath();
			ctx.fill();
			ctx.beginPath();
			ctx.moveTo(sx, bottom - ah);
			ctx.lineTo(sx - aw, bottom);
			ctx.lineTo(sx + aw, bottom);
			ctx.closePath();
			ctx.fill();
		} else if (obj.type === "concave-mirror") {
			// Concave mirror: arc shaped like ) — hollow opens LEFT toward light source
			const color = isDark ? "#fbbf24" : "#d97706";
			ctx.beginPath();
			ctx.moveTo(sx, top);
			ctx.quadraticCurveTo(sx + mirrorBulge, sy, sx, bottom);
			ctx.strokeStyle = color;
			ctx.lineWidth = 3;
			ctx.stroke();
			// Hatch marks on right (back) side of the arc
			ctx.strokeStyle = isDark
				? "rgba(251,191,36,0.5)"
				: "rgba(180,83,9,0.5)";
			ctx.lineWidth = 1.5;
			const steps = Math.max(4, Math.floor(halfHeightScreen / 7));
			for (let i = 0; i <= steps; i++) {
				const t = i / steps;
				const ax =
					(1 - t) * (1 - t) * sx +
					2 * t * (1 - t) * (sx + mirrorBulge) +
					t * t * sx;
				const ay =
					(1 - t) * (1 - t) * top +
					2 * t * (1 - t) * sy +
					t * t * bottom;
				ctx.beginPath();
				ctx.moveTo(ax, ay);
				ctx.lineTo(ax + 9, ay + 6);
				ctx.stroke();
			}
		} else if (obj.type === "convex-mirror") {
			// Convex mirror: arc shaped like ( — convex bulge faces LEFT toward light source
			const color = isDark ? "#34d399" : "#059669";
			ctx.beginPath();
			ctx.moveTo(sx, top);
			ctx.quadraticCurveTo(sx - mirrorBulge, sy, sx, bottom);
			ctx.strokeStyle = color;
			ctx.lineWidth = 3;
			ctx.stroke();
			// Hatch marks on right (back/inner) side of the arc
			ctx.strokeStyle = isDark
				? "rgba(52,211,153,0.5)"
				: "rgba(4,120,87,0.5)";
			ctx.lineWidth = 1.5;
			const steps = Math.max(4, Math.floor(halfHeightScreen / 7));
			for (let i = 0; i <= steps; i++) {
				const t = i / steps;
				const ax =
					(1 - t) * (1 - t) * sx +
					2 * t * (1 - t) * (sx - mirrorBulge) +
					t * t * sx;
				const ay =
					(1 - t) * (1 - t) * top +
					2 * t * (1 - t) * sy +
					t * t * bottom;
				ctx.beginPath();
				ctx.moveTo(ax, ay);
				ctx.lineTo(ax + 9, ay + 6);
				ctx.stroke();
			}
		}

		ctx.lineCap = "butt";
		ctx.lineJoin = "miter";

		// Draw F and C
		const deviceColor =
			obj.type === "convex-lens"
				? isDark
					? "#60a5fa"
					: "#2563eb"
				: obj.type === "concave-lens"
					? isDark
						? "#c084fc"
						: "#7c3aed"
					: obj.type === "concave-mirror"
						? isDark
							? "#fbbf24"
							: "#d97706"
						: isDark
							? "#34d399"
							: "#059669";
		ctx.fillStyle = deviceColor;
		ctx.font = "10px Inter, system-ui, sans-serif";
		ctx.textAlign = "center";

		const drawMarker = (label: string, wx: number) => {
			const { x: px } = coords.worldToScreen(wx, obj.y);
			ctx.fillRect(px - 1, sy - 4, 2, 8);
			ctx.fillText(label, px, sy + 16);
		};

		if (obj.type.includes("lens")) {
			drawMarker("F", obj.x - obj.focalLength);
			drawMarker("2F", obj.x - obj.focalLength * 2);
			drawMarker("F'", obj.x + obj.focalLength);
			drawMarker("2F'", obj.x + obj.focalLength * 2);
		} else {
			drawMarker("F", obj.x - obj.focalLength);
			drawMarker("C", obj.x - obj.focalLength * 2);
		}
	}

	// 2. Draw Ray Tracing & Shadows
	for (const shadow of shadowResults) {
		const sourceShape = shapes.find((s) => s.id === shadow.sourceShapeId);
		if (!sourceShape) continue;

		const optic = opticsObjects.find((o) => o.id === shadow.opticsObjectId);
		if (!optic) continue;

		const isDegenerate = Math.abs(sourceShape.y - optic.y) < 0.1;

		// Render Shadow Image
		if (isDegenerate) {
			ctx.globalAlpha = isDark ? 0.15 : 0.2; // Dim degenerate on-axis projections
		} else {
			ctx.globalAlpha = shadow.imageType === "virtual" ? 0.3 : 0.8;
		}

		const shadowShape: Shape2D = {
			...sourceShape,
			id: shadow.sourceShapeId + "_shadow",
			x: shadow.imageX,
			y: shadow.imageY,
			scale: sourceShape.scale * Math.abs(shadow.magnification),
			rotation:
				sourceShape.rotation +
				(shadow.imageOrientation === "inverted" ? 180 : 0),
		};

		renderShape(ctx, shadowShape, theme, coords, null);
		ctx.globalAlpha = 1.0;

		const def = ShapeRegistry.get(sourceShape.type);
		if (def) {
			// Compute the VISUAL TIP of the source object in world coordinates.
			// getBounds().y is the topmost local canvas pixel (negative = above origin).
			// In world space (canvas Y inverted): tipOffset = -bounds.y × scale / worldScale.
			// Source objects are always upright (rotation ≈ 0).
			const bounds = def.getBounds(sourceShape);
			const worldScale = scale; // coords.getScale() — pixels per world unit

			const tipOffset = (-bounds.y * sourceShape.scale) / worldScale;
			const tipWorldY = sourceShape.y + tipOffset;

			// Compute the VISUAL TIP of the shadow (image) in world coordinates.
			// For an INVERTED image (m < 0, rotation=180°), the head of the shape
			// has flipped below its local origin, so the tip is BELOW shadowShape.y.
			// For an UPRIGHT image (m > 0, rotation=0), the tip is ABOVE shadowShape.y.
			// Formula: tipImgWorldY = shadowShape.y + sign(m) × (−bounds.y × shadowScale / worldScale)
			const imgTopOffset = (-bounds.y * shadowShape.scale) / worldScale;
			const tipImgWorldY =
				shadowShape.y + Math.sign(shadow.magnification) * imgTopOffset;

			const { x: sx, y: sy } = coords.worldToScreen(
				sourceShape.x,
				tipWorldY,
			);
			const { x: ox, y: oy } = coords.worldToScreen(optic.x, optic.y);
			const { y: oty } = coords.worldToScreen(optic.x, tipWorldY);

			const { x: ix, y: iy } = coords.worldToScreen(
				shadowShape.x,
				tipImgWorldY,
			);

			const rayColor = isDark
				? "rgba(250, 204, 21, 0.7)"
				: "rgba(234, 179, 8, 0.7)";
			const extColor = isDark
				? "rgba(250, 204, 21, 0.3)"
				: "rgba(234, 179, 8, 0.3)";

			// Canvas CSS dimensions for ray-to-edge clipping
			const cw = ctx.canvas.getBoundingClientRect().width;
			const ch = ctx.canvas.getBoundingClientRect().height;

			ctx.lineWidth = 1.5;
			ctx.setLineDash([]);

			// ─────────────────────────────────────────────────────────────────────
			// RAY 3 SETUP — common for both real and virtual
			// ─────────────────────────────────────────────────────────────────────
			// Ray 3 is aimed at the appropriate focal point so that after hitting
			// the optic it exits PARALLEL to the optical axis.
			//   • Converging (convex lens, concave mirror) → aim at near focal F
			//     F = (optic.x − |f|, optic.y)
			//   • Diverging  (concave lens, convex mirror)  → aim at far focal F′
			//     F′ = (optic.x + |f|, optic.y)
			//
			// Math proof: for any optic, the y-coordinate where Ray 3 hits the
			// optic plane equals tipImgWorldY (the image tip), so the horizontal
			// exit ray always passes through the convergence point. ✓
			const isDivergingOptic =
				optic.type === "concave-lens" || optic.type === "convex-mirror";
			const focal3X = isDivergingOptic
				? optic.x + optic.focalLength // far virtual focal F′
				: optic.x - optic.focalLength; // near real focal F
			const focal3Y = optic.y;

			const denom3 = focal3X - sourceShape.x;
			const ray3Valid = Math.abs(denom3) > 0.01; // skip if source sits on focal point

			// Hit-point on the optic plane (world Y)
			const hitY3World = ray3Valid
				? tipWorldY +
					((optic.x - sourceShape.x) / denom3) * (focal3Y - tipWorldY)
				: tipWorldY;
			const { x: h3x, y: h3y } = coords.worldToScreen(optic.x, hitY3World);

			// Exit direction: lenses transmit (→ right), mirrors reflect (→ left)
			const isLensType = optic.type.includes("lens");
			const exitDx3 = isLensType ? 1 : -1;

			if (shadow.imageType === "real") {
				// ── REAL IMAGE ──────────────────────────────────────────────
				// Solid rays: source tip → lens → image tip (actual physical path)
				ctx.beginPath();
				ctx.strokeStyle = rayColor;
				// Ray 1: parallel to axis → refracts through far focal point
				ctx.moveTo(sx, sy);
				ctx.lineTo(ox, oty);
				ctx.lineTo(ix, iy);
				// Ray 2: straight through optical centre
				ctx.moveTo(sx, sy);
				ctx.lineTo(ox, oy);
				ctx.lineTo(ix, iy);
				// Ray 3: aimed at focal point → exits parallel to axis
				if (ray3Valid) {
					ctx.moveTo(sx, sy);
					ctx.lineTo(h3x, h3y); // source → optic plane
					ctx.lineTo(ix, h3y); // horizontal exit to image (h3y ≈ iy)
				}
				ctx.stroke();

				// Dashed extensions: continue each ray to the screen edge
				ctx.beginPath();
				ctx.strokeStyle = extColor;
				ctx.setLineDash([6, 5]);

				// Ray 1 extension (lens→image direction, beyond image)
				const ext1 = rayToEdge(ix, iy, ix - ox, iy - oty, cw, ch);
				ctx.moveTo(ix, iy);
				ctx.lineTo(ext1.x, ext1.y);

				// Ray 2 extension (centre→image direction, beyond image)
				const ext2 = rayToEdge(ix, iy, ix - ox, iy - oy, cw, ch);
				ctx.moveTo(ix, iy);
				ctx.lineTo(ext2.x, ext2.y);

				// Ray 3 extension: continue horizontal from image tip to screen edge
				if (ray3Valid) {
					const ext3 = rayToEdge(ix, h3y, exitDx3, 0, cw, ch);
					ctx.moveTo(ix, h3y);
					ctx.lineTo(ext3.x, h3y);
				}

				ctx.stroke();
				ctx.setLineDash([]);
			} else {
				// ── VIRTUAL IMAGE ────────────────────────────────────────────
				// Solid rays: actual diverging physical paths (away from virtual image)
				ctx.beginPath();
				ctx.strokeStyle = rayColor;
				ctx.setLineDash([]);

				// Ray 1: source → lens-hit, then diverge to screen edge
				const div1 = rayToEdge(ox, oty, ox - ix, oty - iy, cw, ch);
				ctx.moveTo(sx, sy);
				ctx.lineTo(ox, oty);
				ctx.lineTo(div1.x, div1.y);

				// Ray 2: source → optical centre, then continue to screen edge
				const div2 = rayToEdge(ox, oy, ox - sx, oy - sy, cw, ch);
				ctx.moveTo(sx, sy);
				ctx.lineTo(ox, oy);
				ctx.lineTo(div2.x, div2.y);

				// Ray 3: source → optic hit, exits PARALLEL to axis (horizontal)
				// Forward direction (physical exit) → screen edge
				if (ray3Valid) {
					const fwd3 = rayToEdge(h3x, h3y, exitDx3, 0, cw, ch);
					ctx.moveTo(sx, sy);
					ctx.lineTo(h3x, h3y);
					ctx.lineTo(fwd3.x, h3y);
				}

				ctx.stroke();

				// Dashed back-extensions: lens → through virtual image → screen edge
				// The virtual image is where these lines APPEAR to converge, not stop.
				// Direction: from lens toward virtual image, then keep going.
				ctx.beginPath();
				ctx.strokeStyle = extColor;
				ctx.setLineDash([6, 5]);

				// Ray 1 back-extension: from lens-hit through virtual image tip to edge
				const back1 = rayToEdge(ox, oty, ix - ox, iy - oty, cw, ch);
				ctx.moveTo(ox, oty);
				ctx.lineTo(back1.x, back1.y);

				// Ray 2 back-extension: from optical centre through virtual image tip to edge
				const back2 = rayToEdge(ox, oy, ix - ox, iy - oy, cw, ch);
				ctx.moveTo(ox, oy);
				ctx.lineTo(back2.x, back2.y);

				// Ray 3 back-extension: from optic hit going BACKWARD (horizontal) to edge
				// This dashed line passes through the virtual image at h3y ≈ iy
				if (ray3Valid) {
					const back3 = rayToEdge(h3x, h3y, -exitDx3, 0, cw, ch);
					ctx.moveTo(h3x, h3y);
					ctx.lineTo(back3.x, h3y);
				}

				ctx.stroke();
				ctx.setLineDash([]);
			}
		}
	}

	ctx.restore();
}
