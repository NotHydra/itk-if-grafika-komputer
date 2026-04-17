import { nanoid } from "nanoid";
import type { StateCreator } from "zustand";
import type { Point2D } from "../types";

export type PointsSlice = {
	points: Point2D[];
	addPoint: (x: number, y: number, label?: string, color?: string) => void;
	removePoint: (id: string) => void;
	updatePoint: (id: string, changes: Partial<Point2D>) => void;
};

export const createPointsSlice: StateCreator<
	PointsSlice,
	[],
	[],
	PointsSlice
> = (set) => ({
	points: [],
	addPoint: (x, y, label, color) =>
		set((s) => ({
			points: [
				...s.points,
				{ id: nanoid(), x, y, label, color, size: undefined },
			],
		})),
	removePoint: (id) =>
		set((s) => ({ points: s.points.filter((p) => p.id !== id) })),
	updatePoint: (id, changes) =>
		set((s) => ({
			points: s.points.map((p) =>
				p.id === id ? { ...p, ...changes } : p,
			),
		})),
});
