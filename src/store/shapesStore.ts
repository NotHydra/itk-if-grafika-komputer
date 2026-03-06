import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { Shape2D, ShapeType } from '../types';

export type ShapesSlice = {
  shapes: Shape2D[];
  addShape: (type: ShapeType, x: number, y: number, options?: Partial<Shape2D>) => void;
  removeShape: (id: string) => void;
  updateShape: (id: string, changes: Partial<Shape2D>) => void;
};

export const createShapesSlice: StateCreator<ShapesSlice, [], [], ShapesSlice> = (set) => ({
  shapes: [],
  addShape: (type, x, y, options) =>
    set((s) => ({
      shapes: [
        ...s.shapes,
        { id: nanoid(), type, x, y, rotation: 0, scale: 1, ...options },
      ],
    })),
  removeShape: (id) =>
    set((s) => ({ shapes: s.shapes.filter((sh) => sh.id !== id) })),
  updateShape: (id, changes) =>
    set((s) => ({
      shapes: s.shapes.map((sh) => (sh.id === id ? { ...sh, ...changes } : sh)),
    })),
});
