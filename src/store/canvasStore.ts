import type { StateCreator } from 'zustand';
import type { CanvasTransform } from '../types';

export type CanvasSlice = {
  transform: CanvasTransform;
  activeStep: 1 | 2 | 3 | 4 | 5;
  selectedObjectId: string | null;
  gridScale: number; // world units per grid division
  setTransform: (transform: Partial<CanvasTransform>) => void;
  setActiveStep: (step: 1 | 2 | 3 | 4 | 5) => void;
  setSelectedObjectId: (id: string | null) => void;
  setGridScale: (scale: number) => void;
  resetView: (canvasWidth: number, canvasHeight: number) => void;
  zoom: (factor: number) => void;
};

export const createCanvasSlice: StateCreator<CanvasSlice, [], [], CanvasSlice> = (set) => ({
  transform: { originX: 0, originY: 0, scale: 40 },
  activeStep: 1,
  selectedObjectId: null,
  gridScale: 1,
  setTransform: (partial) =>
    set((s) => ({ transform: { ...s.transform, ...partial } })),
  setActiveStep: (step) => set({ activeStep: step }),
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  setGridScale: (scale) => set({ gridScale: scale }),
  resetView: (canvasWidth, canvasHeight) =>
    set({
      transform: {
        originX: canvasWidth / 2,
        originY: canvasHeight / 2,
        scale: 40,
      },
    }),
  zoom: (factor) =>
    set((s) => ({
      transform: { ...s.transform, scale: Math.max(5, Math.min(200, s.transform.scale * factor)) },
    })),
});
