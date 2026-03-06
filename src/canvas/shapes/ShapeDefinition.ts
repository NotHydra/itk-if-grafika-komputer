import type { Shape2D, Theme } from '../../types';

export interface ShapeDefinition {
  /** Unique string key — becomes the Shape2D.type value */
  id: string;

  /** Human-readable name shown in the GUI palette */
  label: string;

  /** Lucide icon name for the palette button */
  icon: string;

  /**
   * Draw the shape onto the canvas context.
   * Called with ctx already translated/rotated/scaled to shape-local space.
   * Only draw relative to local origin (0, 0).
   */
  draw: (ctx: CanvasRenderingContext2D, shape: Shape2D, theme: Theme) => void;

  /**
   * Return the bounding box in local (pre-transform) space.
   * Used for click-hit detection and selection handles.
   */
  getBounds: (shape: Shape2D) => { width: number; height: number };

  /**
   * Optional: extra config fields this shape exposes in the inspector panel.
   * Each entry auto-generates a labeled input in the sidebar — no per-shape UI code needed.
   */
  inspectorFields?: ShapeInspectorField[];
}

export interface ShapeInspectorField {
  key: string; // key inside shape.meta
  label: string;
  type: 'number' | 'color' | 'range' | 'select';
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string; label: string }[];
  defaultValue: string | number | boolean;
}
