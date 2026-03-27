import { metaNum } from '../../utils/shapeUtils';
import { ShapeRegistry } from './ShapeRegistry';

ShapeRegistry.register({
  id: 'arrow',
  label: 'Arrow',
  icon: 'move-right',
  defaultColor: '#ef4444',
  draw(ctx, shape, _theme) {
    const shaftLength = metaNum(shape.meta, 'shaftLength', 60);
    const headSize = metaNum(shape.meta, 'headSize', 15);
    const shaftWidth = 4;

    // Shaft
    ctx.fillStyle = shape.color ?? '#ef4444';
    ctx.fillRect(-shaftLength / 2, -shaftWidth / 2, shaftLength - headSize, shaftWidth);

    // Arrowhead
    ctx.beginPath();
    ctx.moveTo(shaftLength / 2 - headSize, -headSize / 2);
    ctx.lineTo(shaftLength / 2, 0);
    ctx.lineTo(shaftLength / 2 - headSize, headSize / 2);
    ctx.closePath();
    ctx.fillStyle = shape.color ?? '#ef4444';
    ctx.fill();
  },
  getBounds(shape) {
    const shaftLength = metaNum(shape.meta, 'shaftLength', 60);
    const headSize = metaNum(shape.meta, 'headSize', 15);
    return { x: -shaftLength / 2, y: -headSize / 2, width: shaftLength, height: headSize };
  },
  inspectorFields: [
    { key: 'shaftLength', label: 'Shaft Length', type: 'range', min: 20, max: 150, step: 5, defaultValue: 60 },
    { key: 'headSize', label: 'Head Size', type: 'range', min: 5, max: 30, step: 1, defaultValue: 15 },
  ],
});
