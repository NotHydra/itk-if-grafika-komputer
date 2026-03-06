import { useCallback, useEffect, useRef, useState } from 'react';

interface CanvasSize {
  width: number;
  height: number;
}

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<CanvasSize>({ width: 0, height: 0 });

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(() => {
      handleResize();
    });

    observer.observe(container);
    handleResize(); // Initial size

    return () => observer.disconnect();
  }, [handleResize]);

  return { canvasRef, containerRef, size };
}
