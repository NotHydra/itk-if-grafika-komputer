import { useMemo } from 'react';
import { CoordinateSystem } from '../canvas/CoordinateSystem';
import type { CanvasTransform } from '../types';

export function useCoordinateTransform(
  canvasWidth: number,
  canvasHeight: number,
  transform: CanvasTransform,
) {
  const coords = useMemo(() => new CoordinateSystem(), []);

  useMemo(() => {
    coords.update(canvasWidth, canvasHeight, transform);
  }, [coords, canvasWidth, canvasHeight, transform]);

  return coords;
}
