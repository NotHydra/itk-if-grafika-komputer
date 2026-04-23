import { create } from "zustand";
import { createCanvasSlice } from "./canvasStore";
import { createLinesSlice } from "./linesStore";
import { createOpticsSlice } from "./opticsStore";
import { createPointsSlice } from "./pointsStore";
import { createShapesSlice } from "./shapesStore";
import type { BoundStore } from "./storeTypes";
import { createThemeSlice } from "./themeStore";

export const useStore = create<BoundStore>()((...args) => ({
	...createCanvasSlice(...args),
	...createPointsSlice(...args),
	...createLinesSlice(...args),
	...createShapesSlice(...args),
	...createOpticsSlice(...args),
	...createThemeSlice(...args),
}));
