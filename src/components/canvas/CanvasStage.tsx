import { useCallback, useEffect, useRef, useState } from 'react';
import { CanvasEngine } from '../../canvas/CanvasEngine';
import { useCanvas } from '../../hooks/useCanvas';
import { useStore } from '../../store';
import { ShapeRegistry } from '../../canvas/shapes/ShapeRegistry';
import { calculateImage } from '../../utils/opticsCalculations';
import type { ShadowResult } from '../../types';

export function CanvasStage() {
  const { canvasRef, containerRef, size } = useCanvas();
  const engineRef = useRef<CanvasEngine | null>(null);
  const [mousePos, setMousePos] = useState<{ wx: number; wy: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Store selectors
  const theme = useStore((s) => s.theme);
  const transform = useStore((s) => s.transform);
  const gridScale = useStore((s) => s.gridScale);
  const points = useStore((s) => s.points);
  const lines = useStore((s) => s.lines);
  const graphs = useStore((s) => s.graphs);
  const shapes = useStore((s) => s.shapes);
  const opticsObjects = useStore((s) => s.opticsObjects);
  const lightSources = useStore((s) => s.lightSources);
  const shadowResults = useStore((s) => s.shadowResults);
  const selectedObjectId = useStore((s) => s.selectedObjectId);
  const setTransform = useStore((s) => s.setTransform);
  const setSelectedObjectId = useStore((s) => s.setSelectedObjectId);
  const setShadowResults = useStore((s) => s.setShadowResults);

  // Initialize engine
  useEffect(() => {
    if (canvasRef.current && !engineRef.current) {
      engineRef.current = new CanvasEngine(canvasRef.current);
      engineRef.current.start();
    }
    return () => {
      engineRef.current?.stop();
      engineRef.current = null;
    };
  }, [canvasRef]);

  // Handle resize
  useEffect(() => {
    if (engineRef.current && size.width > 0 && size.height > 0) {
      engineRef.current.resize();
      // Update transform origin if it hasn't been set (initial state)
      if (transform.originX === 0 && transform.originY === 0) {
        setTransform({
          originX: size.width / 2,
          originY: size.height / 2,
        });
      }
    }
  }, [size, transform.originX, transform.originY, setTransform]);

  // Synchronize physics calculations for Optics
  const lastShadowsStr = useRef<string>('');
  useEffect(() => {
    const newShadows: ShadowResult[] = [];
    for (const ls of lightSources) {
      const sourceShape = shapes.find((s) => s.id === ls.sourceShapeId);
      const optic = opticsObjects.find((o) => o.id === ls.opticsObjectId);
      if (sourceShape && optic) {
        const shadow = calculateImage(optic, sourceShape);
        if (shadow) newShadows.push(shadow);
      }
    }
    const signature = JSON.stringify(newShadows);
    if (signature !== lastShadowsStr.current) {
      lastShadowsStr.current = signature;
      setShadowResults(newShadows);
    }
  }, [shapes, opticsObjects, lightSources, setShadowResults]);

  // Sync state to engine
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updateState({
        theme,
        transform,
        gridScale,
        points,
        lines,
        graphs,
        shapes,
        opticsObjects,
        lightSources,
        shadowResults,
        selectedObjectId,
      });
    }
  }, [theme, transform, gridScale, points, lines, graphs, shapes, opticsObjects, lightSources, shadowResults, selectedObjectId]);

  const updateShape = useStore((s) => s.updateShape);
  const updatePoint = useStore((s) => s.updatePoint);

  const [dragState, setDragState] = useState<{
    type: 'pan' | 'shape' | 'point';
    id: string;
    lastX: number;
    lastY: number;
    worldX: number;
    worldY: number;
  } | null>(null);

  // Helper: check if world point is inside shape bounds
  const getShapeAt = useCallback((wx: number, wy: number) => {
    // Reverse order for top-first selection
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      const def = ShapeRegistry.get(s.type);
      if (!def) continue;
      const bounds = def.getBounds(s);
      
      // Calculate local mouse pos (relative to shape center)
      const dx = wx - s.x;
      const dy = wy - s.y;
      
      // Rotate back to local
      const rad = (-s.rotation * Math.PI) / 180;
      const lx = dx * Math.cos(rad) - dy * Math.sin(rad);
      const ly = dx * Math.sin(rad) + dy * Math.cos(rad);
      
      const halfW = (bounds.width * s.scale) / 2;
      const halfH = (bounds.height * s.scale) / 2;
      
      if (Math.abs(lx) <= halfW && Math.abs(ly) <= halfH) {
        return s;
      }
    }
    return null;
  }, [shapes]);

  // Handle mouse move for coordinate tooltip & panning/dragging
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!engineRef.current) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const coords = engineRef.current.getCoordinateSystem();
      const world = coords.screenToWorld(sx, sy);

      // Handle interactions
      if (dragState) {
        if (dragState.type === 'pan') {
          setTransform({
            originX: transform.originX + (sx - dragState.lastX),
            originY: transform.originY + (sy - dragState.lastY),
          });
          setDragState({ ...dragState, lastX: sx, lastY: sy });
        } else if (dragState.type === 'point') {
          updatePoint(dragState.id, { x: world.x, y: world.y });
        } else if (dragState.type === 'shape') {
          const dx = world.x - dragState.worldX;
          const dy = world.y - dragState.worldY;
          const shape = shapes.find(s => s.id === dragState.id);
          if (shape) {
            updateShape(dragState.id, { 
              x: shape.x + dx, 
              y: shape.y + dy 
            });
            setDragState({ ...dragState, worldX: world.x, worldY: world.y });
          }
        }
      }

      // Update coordinate tooltip
      setMousePos({
        wx: Math.round(world.x * 100) / 100,
        wy: Math.round(world.y * 100) / 100,
      });
    },
    [canvasRef, dragState, transform, setTransform, updatePoint, updateShape, shapes],
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect || !engineRef.current) return;
      
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const coords = engineRef.current.getCoordinateSystem();
      const world = coords.screenToWorld(sx, sy);

      // Priority: Points > Shapes > Pan
      // 1. Check points
      for (const p of points) {
        const dist = Math.sqrt((p.x - world.x) ** 2 + (p.y - world.y) ** 2);
        if (dist < 0.5) {
          setSelectedObjectId(p.id);
          setDragState({ type: 'point', id: p.id, lastX: sx, lastY: sy, worldX: world.x, worldY: world.y });
          return;
        }
      }

      // 2. Check shapes
      const hitShape = getShapeAt(world.x, world.y);
      if (hitShape) {
        setSelectedObjectId(hitShape.id);
        setDragState({ type: 'shape', id: hitShape.id, lastX: sx, lastY: sy, worldX: world.x, worldY: world.y });
        return;
      }

      // 3. Fallback to Pan
      setIsDragging(true);
      setDragState({ type: 'pan', id: 'canvas', lastX: sx, lastY: sy, worldX: world.x, worldY: world.y });
    },
    [canvasRef, points, getShapeAt, setSelectedObjectId],
  );

  const handleMouseUpOrLeave = useCallback(() => {
    setIsDragging(false);
    setDragState(null);
    setMousePos(null);
  }, []);

  // Handle click only if not dragged much
  const handleClick = useCallback(
    () => {
      // Selection logic handled in mouseDown/Move for dragging
    },
    [],
  );

  const zoomLevel = Math.round(transform.scale);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${isDragging ? 'cursor-grabbing' : 'cursor-default'}`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClick={handleClick}
      />

      {/* Coordinate tooltip */}
      {mousePos && (
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-md bg-background/80 border border-border shadow-lg pointer-events-none">
          <span className="text-muted-foreground">X:</span>{' '}
          <span className="text-foreground font-semibold">{mousePos.wx}</span>
          <span className="text-muted-foreground ml-3">Y:</span>{' '}
          <span className="text-foreground font-semibold">{mousePos.wy}</span>
        </div>
      )}

      {/* Zoom indicator */}
      <div className="absolute bottom-3 right-3 px-2 py-1 rounded text-[10px] font-mono backdrop-blur-md bg-background/70 border border-border text-muted-foreground">
        {zoomLevel}px/unit
      </div>
    </div>
  );
}
