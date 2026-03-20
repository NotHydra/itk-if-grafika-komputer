import type { LightSource, OpticsObject, ShadowResult, Theme, Shape2D } from '../../types';
import type { ICoordinateSystem } from '../CoordinateSystem';
import { renderShape } from './ShapeRenderer';
import { ShapeRegistry } from '../shapes/ShapeRegistry';

export function renderOptics(
  ctx: CanvasRenderingContext2D,
  opticsObjects: OpticsObject[],
  _lightSources: LightSource[],
  shadowResults: ShadowResult[],
  shapes: Shape2D[],
  theme: Theme,
  coords: ICoordinateSystem,
): void {
  const isDark = theme === 'dark';
  const scale = coords.getScale();
  ctx.save();
  
  // 1. Draw Optics Devices
  for (const obj of opticsObjects) {
    const { x: sx, y: sy } = coords.worldToScreen(obj.x, obj.y);
    
    // Principal axis
    ctx.beginPath();
    ctx.moveTo(0, sy);
    ctx.lineTo(ctx.canvas.width, sy);
    ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);
    
    // The device line (vertical)
    const halfHeightScreen = (obj.aperture * scale) / 2;
    
    ctx.beginPath();
    ctx.moveTo(sx, sy - halfHeightScreen);
    ctx.lineTo(sx, sy + halfHeightScreen);
    ctx.strokeStyle = isDark ? '#60a5fa' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw markers for Convex/Concave
    const markerSize = 8;
    ctx.beginPath();
    if (obj.type === 'convex-lens') {
      ctx.moveTo(sx - markerSize/2, sy - halfHeightScreen + markerSize);
      ctx.lineTo(sx, sy - halfHeightScreen);
      ctx.lineTo(sx + markerSize/2, sy - halfHeightScreen + markerSize);
      
      ctx.moveTo(sx - markerSize/2, sy + halfHeightScreen - markerSize);
      ctx.lineTo(sx, sy + halfHeightScreen);
      ctx.lineTo(sx + markerSize/2, sy + halfHeightScreen - markerSize);
    } else if (obj.type === 'concave-lens') {
      ctx.moveTo(sx - markerSize/2, sy - halfHeightScreen);
      ctx.lineTo(sx, sy - halfHeightScreen + markerSize);
      ctx.lineTo(sx + markerSize/2, sy - halfHeightScreen);
      
      ctx.moveTo(sx - markerSize/2, sy + halfHeightScreen);
      ctx.lineTo(sx, sy + halfHeightScreen - markerSize);
      ctx.lineTo(sx + markerSize/2, sy + halfHeightScreen);
    } else {
      // Mirrors: hatch marks
      const dashCount = Math.floor(halfHeightScreen / 6);
      for (let i = -dashCount; i <= dashCount; i++) {
        const y = sy + i * 6;
        ctx.moveTo(sx, y);
        ctx.lineTo(sx + 5, y - 5);
      }
    }
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw F and C
    ctx.fillStyle = isDark ? '#9ca3af' : '#4b5563';
    ctx.font = '10px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    const drawMarker = (label: string, wx: number) => {
      const { x: px } = coords.worldToScreen(wx, obj.y);
      ctx.fillRect(px - 1, sy - 4, 2, 8);
      ctx.fillText(label, px, sy + 16);
    };

    if (obj.type.includes('lens')) {
      drawMarker('F', obj.x - obj.focalLength);
      drawMarker('2F', obj.x - obj.focalLength * 2);
      drawMarker('F\'', obj.x + obj.focalLength);
      drawMarker('2F\'', obj.x + obj.focalLength * 2);
    } else {
      drawMarker('F', obj.x - obj.focalLength);
      drawMarker('C', obj.x - obj.focalLength * 2);
    }
  }

  // 2. Draw Ray Tracing & Shadows
  for (const shadow of shadowResults) {
    const sourceShape = shapes.find(s => s.id === shadow.sourceShapeId);
    if (!sourceShape) continue;
    
    const optic = opticsObjects.find(o => o.id === shadow.opticsObjectId);
    if (!optic) continue;

    const isDegenerate = Math.abs(sourceShape.y - optic.y) < 0.1;
    
    // Render Shadow Image
    if (isDegenerate) {
      ctx.globalAlpha = isDark ? 0.15 : 0.2; // Dim degenerate on-axis projections
    } else {
      ctx.globalAlpha = shadow.imageType === 'virtual' ? 0.3 : 0.8;
    }
    
    const shadowShape: Shape2D = {
      ...sourceShape,
      id: shadow.sourceShapeId + '_shadow',
      x: shadow.imageX,
      y: shadow.imageY, 
      scale: sourceShape.scale * Math.abs(shadow.magnification),
      rotation: sourceShape.rotation + (shadow.imageOrientation === 'inverted' ? 180 : 0)
    };
    
    renderShape(ctx, shadowShape, theme, coords, null);
    ctx.globalAlpha = 1.0;
    
    // Draw Principal Rays
    const def = ShapeRegistry.get(sourceShape.type);
    if (def) {
      // We trace the principal rays from the "Y" coordinate of the object.
      // Usually users place the base of the object on the axis, or the object is centered.
      // For physics diagrams, tracing from the object's `y` to the image's `y` creates 
      // the perfect geometric intersection.
      const tipWorldY = sourceShape.y;
      
      const { x: sx, y: sy } = coords.worldToScreen(sourceShape.x, tipWorldY);
      const { x: ox, y: oy } = coords.worldToScreen(optic.x, optic.y);
      const { y: oty } = coords.worldToScreen(optic.x, tipWorldY); 
      
      const tipImgWorldY = shadowShape.y;
      const { x: ix, y: iy } = coords.worldToScreen(shadowShape.x, tipImgWorldY); 
      
      ctx.beginPath();
      
      // Ray 1: Parallel to principal axis -> through focal point
      ctx.moveTo(sx, sy);
      ctx.lineTo(ox, oty);
      if (shadow.imageType === 'real') {
         // It crosses the focal point on the other side and goes to the image tip
         ctx.lineTo(ix, iy); 
      } else {
         // Ray diverges. It traces back to the virtual image tip.
         ctx.lineTo(ix, iy); 
      }
      
      // Ray 2: Through optical center (pole) -> straight through
      ctx.moveTo(sx, sy);
      ctx.lineTo(ox, oy);
      if (shadow.imageType === 'real') {
         ctx.lineTo(ix, iy); 
      } else {
         ctx.lineTo(ix, iy);
      }
      
      ctx.strokeStyle = isDark ? 'rgba(250, 204, 21, 0.6)' : 'rgba(234, 179, 8, 0.6)';
      ctx.lineWidth = 1.5;
      if (shadow.imageType === 'virtual') {
        ctx.setLineDash([4, 4]); // Dashed for virtual tracebacks
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }
  
  ctx.restore();
}
