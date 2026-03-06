import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { FunctionGraph, LineSegment } from '../types';

export type LinesSlice = {
  lines: LineSegment[];
  graphs: FunctionGraph[];
  addLine: (x1: number, y1: number, x2: number, y2: number, options?: Partial<LineSegment>) => void;
  removeLine: (id: string) => void;
  updateLine: (id: string, changes: Partial<LineSegment>) => void;
  addGraph: (expression: string, xMin: number, xMax: number, sampleCount?: number, color?: string) => void;
  removeGraph: (id: string) => void;
  updateGraph: (id: string, changes: Partial<FunctionGraph>) => void;
};

export const createLinesSlice: StateCreator<LinesSlice, [], [], LinesSlice> = (set) => ({
  lines: [],
  graphs: [],
  addLine: (x1, y1, x2, y2, options) =>
    set((s) => ({
      lines: [
        ...s.lines,
        { id: nanoid(), x1, y1, x2, y2, algorithm: 'native' as const, ...options },
      ],
    })),
  removeLine: (id) =>
    set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
  updateLine: (id, changes) =>
    set((s) => ({
      lines: s.lines.map((l) => (l.id === id ? { ...l, ...changes } : l)),
    })),
  addGraph: (expression, xMin, xMax, sampleCount = 200, color) =>
    set((s) => ({
      graphs: [...s.graphs, { id: nanoid(), expression, xMin, xMax, sampleCount, color }],
    })),
  removeGraph: (id) =>
    set((s) => ({ graphs: s.graphs.filter((g) => g.id !== id) })),
  updateGraph: (id, changes) =>
    set((s) => ({
      graphs: s.graphs.map((g) => (g.id === id ? { ...g, ...changes } : g)),
    })),
});
