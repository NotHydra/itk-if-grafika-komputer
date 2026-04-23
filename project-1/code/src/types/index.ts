// All entity IDs are generated with nanoid() — never Math.random() or Date.now()

export type Theme = "dark" | "light";

export interface CanvasTransform {
	// originX/originY = pixel position of the world (0,0) point on the canvas.
	// At rest (no pan) these equal canvasWidth/2 and canvasHeight/2.
	// Panning the canvas simply moves originX/originY — there is NO separate panX/panY field.
	originX: number;
	originY: number;
	scale: number; // pixels per world unit (zoom level)
}

export interface Point2D {
	id: string; // nanoid()
	x: number; // world coordinates
	y: number;
	label?: string;
	color?: string;
	size?: number;
}

export interface LineSegment {
	id: string; // nanoid()
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	// Optional foreign keys: if set, the line tracks the source points when they move.
	point1Id?: string;
	point2Id?: string;
	algorithm: "native" | "DDA" | "midpoint"; // default: 'native'
	color?: string;
	thickness?: number;
	label?: string;
}

// FunctionGraph: a sampled mathematical curve — stored separately from LineSegments
export interface FunctionGraph {
	id: string; // nanoid()
	expression: string; // e.g. "x^2", "sin(x)*10" — evaluated with mathjs
	xMin: number;
	xMax: number;
	sampleCount: number; // number of sample points (default: 200)
	color?: string;
	thickness?: number;
	label?: string;
}

// ShapeType is a plain string — NOT a closed union enum.
// New shapes are registered at runtime via ShapeRegistry; no type file needs editing.
export type ShapeType = string;

export interface Shape2D {
	id: string; // nanoid()
	type: ShapeType; // matches ShapeDefinition.id in the registry
	x: number;
	y: number;
	rotation: number;
	scale: number;
	color?: string;
	meta?: Record<string, unknown>; // per-shape extra config
}

export type OpticsObjectType =
	| "concave-mirror"
	| "convex-mirror"
	| "concave-lens"
	| "convex-lens";

export interface OpticsObject {
	id: string; // nanoid()
	type: OpticsObjectType;
	x: number;
	y: number;
	focalLength: number;
	aperture: number;
	facing: "left" | "right";
}

export interface LightSource {
	id: string; // nanoid()
	sourceShapeId: string;
	opticsObjectId: string;
	x: number;
	y: number;
	angle: number;
	rayCount: number;
}

export interface ShadowResult {
	opticsObjectId: string;
	sourceShapeId: string;
	imageX: number;
	imageY: number;
	imageDistance: number;
	imageHeight: number;
	imageType: "real" | "virtual";
	imageOrientation: "upright" | "inverted";
	magnification: number;
}

export interface AppState {
	theme: Theme;
	transform: CanvasTransform;
	points: Point2D[];
	lines: LineSegment[];
	graphs: FunctionGraph[];
	shapes: Shape2D[];
	opticsObjects: OpticsObject[];
	lightSources: LightSource[];
	shadowResults: ShadowResult[];
	activeStep: 1 | 2 | 3 | 4 | 5;
	selectedObjectId: string | null;
}
