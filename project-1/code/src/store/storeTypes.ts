import type { CanvasSlice } from "./canvasStore";
import type { LinesSlice } from "./linesStore";
import type { OpticsSlice } from "./opticsStore";
import type { PointsSlice } from "./pointsStore";
import type { ShapesSlice } from "./shapesStore";
import type { ThemeSlice } from "./themeStore";

// BoundStore is used ONLY in store/index.ts and by components via useStore.
// Slice files never import this type — that is what prevents circular imports.
export type BoundStore = CanvasSlice &
	PointsSlice &
	LinesSlice &
	ShapesSlice &
	OpticsSlice &
	ThemeSlice;
