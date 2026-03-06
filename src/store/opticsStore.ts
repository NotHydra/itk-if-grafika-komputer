import { nanoid } from 'nanoid';
import type { StateCreator } from 'zustand';
import type { LightSource, OpticsObject, OpticsObjectType, ShadowResult } from '../types';

export type OpticsSlice = {
  opticsObjects: OpticsObject[];
  lightSources: LightSource[];
  shadowResults: ShadowResult[];
  addOpticsObject: (type: OpticsObjectType, x: number, focalLength: number, aperture: number) => void;
  removeOpticsObject: (id: string) => void;
  updateOpticsObject: (id: string, changes: Partial<OpticsObject>) => void;
  addLightSource: (sourceShapeId: string, opticsObjectId: string, x: number, y: number) => void;
  removeLightSource: (id: string) => void;
  updateLightSource: (id: string, changes: Partial<LightSource>) => void;
  setShadowResults: (results: ShadowResult[]) => void;
};

export const createOpticsSlice: StateCreator<OpticsSlice, [], [], OpticsSlice> = (set) => ({
  opticsObjects: [],
  lightSources: [],
  shadowResults: [],
  addOpticsObject: (type, x, focalLength, aperture) =>
    set((s) => ({
      opticsObjects: [
        ...s.opticsObjects,
        { id: nanoid(), type, x, y: 0, focalLength, aperture, facing: 'left' as const },
      ],
    })),
  removeOpticsObject: (id) =>
    set((s) => ({ opticsObjects: s.opticsObjects.filter((o) => o.id !== id) })),
  updateOpticsObject: (id, changes) =>
    set((s) => ({
      opticsObjects: s.opticsObjects.map((o) => (o.id === id ? { ...o, ...changes } : o)),
    })),
  addLightSource: (sourceShapeId, opticsObjectId, x, y) =>
    set((s) => ({
      lightSources: [
        ...s.lightSources,
        { id: nanoid(), sourceShapeId, opticsObjectId, x, y, angle: 0, rayCount: 3 },
      ],
    })),
  removeLightSource: (id) =>
    set((s) => ({ lightSources: s.lightSources.filter((ls) => ls.id !== id) })),
  updateLightSource: (id, changes) =>
    set((s) => ({
      lightSources: s.lightSources.map((ls) => (ls.id === id ? { ...ls, ...changes } : ls)),
    })),
  setShadowResults: (results) => set({ shadowResults: results }),
});
