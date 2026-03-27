import { metaNum } from '../../utils/shapeUtils';
import { ShapeRegistry } from './ShapeRegistry';

ShapeRegistry.register({
  id: 'pin',
  label: 'Pin',
  icon: 'pin',
  defaultColor: '#9ca3af',
  draw(ctx, shape, _theme) {
    const headRadius = metaNum(shape.meta, 'headRadius', 8);
    const shaftLength = metaNum(shape.meta, 'shaftLength', 60);
    const shaftWidth = 4;

    // Shaft
    ctx.fillStyle = shape.color ?? '#9ca3af';
    ctx.fillRect(-shaftWidth / 2, -shaftLength + headRadius, shaftWidth, shaftLength);

    // Tapered point
    ctx.beginPath();
    ctx.moveTo(-shaftWidth / 2, headRadius);
    ctx.lineTo(0, headRadius + 12);
    ctx.lineTo(shaftWidth / 2, headRadius);
    ctx.closePath();
    ctx.fillStyle = '#6b7280';
    ctx.fill();

    // Head
    ctx.beginPath();
    ctx.arc(0, -shaftLength + headRadius, headRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#d1d5db';
    ctx.fill();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 1;
    ctx.stroke();
  },
  getBounds(shape) {
    const headRadius = metaNum(shape.meta, 'headRadius', 8);
    const shaftLength = metaNum(shape.meta, 'shaftLength', 60);
    return { x: -headRadius, y: -shaftLength, width: headRadius * 2, height: shaftLength + headRadius + 12 };
  },
  inspectorFields: [
    { key: 'headRadius', label: 'Head Radius', type: 'range', min: 4, max: 20, step: 1, defaultValue: 8 },
    { key: 'shaftLength', label: 'Shaft Length', type: 'range', min: 20, max: 120, step: 5, defaultValue: 60 },
  ],
});
