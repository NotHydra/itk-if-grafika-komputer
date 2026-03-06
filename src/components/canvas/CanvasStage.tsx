import { useCallback, useEffect, useRef, useState } from 'react';
import { CanvasEngine } from '../../canvas/CanvasEngine';
import { useCanvas } from '../../hooks/useCanvas';
import { useStore } from '../../store';

export function CanvasStage() {
  const { canvasRef, containerRef, size } = useCanvas();
  const engineRef = useRef<CanvasEngine | null>(null);
  const [mousePos, setMousePos] = useState<{ wx: number; wy: number } | null>(null);

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

  // Handle mouse move for coordinate tooltip
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!engineRef.current) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const coords = engineRef.current.getCoordinateSystem();
      const world = coords.screenToWorld(sx, sy);
      setMousePos({
        wx: Math.round(world.x * 100) / 100,
        wy: Math.round(world.y * 100) / 100,
      });
    },
    [canvasRef],
  );

  const handleMouseLeave = useCallback(() => {
    setMousePos(null);
  }, []);

  // Handle click for point selection
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!engineRef.current) return;
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;
      const coords = engineRef.current.getCoordinateSystem();
      const world = coords.screenToWorld(sx, sy);

      // Check if click is near any point
      let closestId: string | null = null;
      let closestDist = Infinity;
      for (const p of points) {
        const dist = Math.sqrt((p.x - world.x) ** 2 + (p.y - world.y) ** 2);
        if (dist < 0.5 && dist < closestDist) {
          closestDist = dist;
          closestId = p.id;
        }
      }
      setSelectedObjectId(closestId);
    },
    [canvasRef, points, setSelectedObjectId],
  );

  const zoomLevel = Math.round(transform.scale);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-background">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* Coordinate tooltip */}
      {mousePos && (
        <div className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-mono backdrop-blur-md bg-background/80 border border-border shadow-lg">
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
