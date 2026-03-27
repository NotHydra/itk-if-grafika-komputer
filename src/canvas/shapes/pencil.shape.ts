import { metaNum } from '../../utils/shapeUtils';
import { ShapeRegistry } from './ShapeRegistry';

ShapeRegistry.register({
  id: 'pencil',
  label: 'Pencil',
  icon: 'pencil',
  defaultColor: '#f5c542',
  draw(ctx, shape, _theme) {
    const len = metaNum(shape.meta, 'length', 80);
    const w = 10;
    // Body
    ctx.fillStyle = shape.color ?? '#f5c542';
    ctx.fillRect(-len / 2, -w / 2, len * 0.85, w);
    // Tip
    ctx.beginPath();
    ctx.moveTo(len * 0.35, -w / 2);
    ctx.lineTo(len / 2, 0);
    ctx.lineTo(len * 0.35, w / 2);
    ctx.closePath();
    ctx.fillStyle = '#d4a017';
    ctx.fill();
    // Eraser
    ctx.fillStyle = '#f48fb1';
    ctx.fillRect(-len / 2, -w / 2, len * 0.1, w);
  },
  getBounds(shape) {
    const len = metaNum(shape.meta, 'length', 80);
    return { x: -len / 2, y: -5, width: len, height: 10 };
  },
  inspectorFields: [
    { key: 'length', label: 'Length', type: 'range', min: 30, max: 200, step: 5, defaultValue: 80 },
  ],
});
