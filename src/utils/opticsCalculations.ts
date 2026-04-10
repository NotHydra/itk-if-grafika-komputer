import { ShapeRegistry } from "../canvas/shapes/ShapeRegistry";
import type { OpticsObject, ShadowResult, Shape2D } from "../types";

/**
 * Calculates the resulting image (shadow) formed by an optical object
 * (Lens or Mirror) given a light source shape.
 *
 * Uses standard absolute-distance conventions:
 * 1/f = 1/do + 1/di
 * m = -di / do
 */
export function calculateImage(
	optics: OpticsObject,
	sourceShape: Shape2D,
): ShadowResult | null {
	const def = ShapeRegistry.get(sourceShape.type);
	if (!def) return null;

	// We assume the optical axis is at y = optics.y (usually 0).
	// We assume light always travels from left to right in this simulation context.
	// Therefore, real, self-luminous objects MUST be placed strictly to the left of the lens or mirror.
	// If the object overlaps the optic device or is dragged past it (object is on the right),
	// it is a physically degenerate case (object straddles or is on transmission side) and produces no image.

	const isLeft = sourceShape.x < optics.x;
	const isStraddling = Math.abs(optics.x - sourceShape.x) <= 0.5;

	if (!isLeft || isStraddling) return null;
	const do_dist = Math.abs(optics.x - sourceShape.x);

	if (do_dist === 0) return null; // Object is exactly on the lens/mirror

	// Adjust focal length sign based on strictly standard conventions:
	// - Convex Lens: +f
	// - Concave Lens: -f
	// - Concave Mirror: +f
	// - Convex Mirror: -f
	let f = Math.abs(optics.focalLength); // assume stored focal length is absolute
	if (optics.type === "concave-lens" || optics.type === "convex-mirror") {
		f = -f;
	}
	// If optics is concave mirror or convex lens, f is positive.

	let di: number;
	if (do_dist === f) {
		// Image at infinity
		di = 999999;
	} else {
		di = (do_dist * f) / (do_dist - f);
	}

	const magnification = -di / do_dist;

	// Calculate source object height using its bounds.
	// We'll treat the upper half of the bounds as the visible object height above the optical axis.

	// Image location
	let imageX: number;
	if (optics.type.includes("mirror")) {
		// Mirrors reflect light back.
		// Real image (di > 0) is on the same side as object (left).
		// Virtual image (di < 0) is behind the mirror (right).
		imageX = optics.x - di;
	} else {
		// Lenses transmit light.
		// Real image (di > 0) is on the opposite side (right).
		// Virtual image (di < 0) is on the same side (left).
		imageX = optics.x + di;
	}

	// Calculate source object height using its bounds.
	// We'll treat the upper half of the bounds as the visible object height above the optical axis.
	const bounds = def.getBounds(sourceShape);
	const sourceHeight = bounds.height * sourceShape.scale;

	// Magnified height (maintaining the same sign conventions)
	// Usually, if m is negative, it's inverted.
	const imageHeight = sourceHeight * Math.abs(magnification);

	const isVirtual = di < 0;
	const isUpright = magnification > 0;

	// Image Y location (inverting if m is negative)
	// optical axis is optics.y
	const dy = sourceShape.y - optics.y;
	const imageY = optics.y + dy * magnification;

	return {
		opticsObjectId: optics.id,
		sourceShapeId: sourceShape.id,
		imageX,
		imageY,
		imageDistance: di, // can be negative for virtual
		imageHeight,
		imageType: isVirtual ? "virtual" : "real",
		imageOrientation: isUpright ? "upright" : "inverted",
		magnification,
	};
}
