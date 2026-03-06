import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store';

const COLOR_PRESETS = [
  '#60a5fa', '#34d399', '#f87171', '#fbbf24', '#a78bfa',
  '#fb923c', '#2dd4bf', '#f472b6', '#818cf8', '#4ade80',
];

export function CoordinatePanel() {
  const points = useStore((s) => s.points);
  const addPoint = useStore((s) => s.addPoint);
  const removePoint = useStore((s) => s.removePoint);
  const updatePoint = useStore((s) => s.updatePoint);
  const gridScale = useStore((s) => s.gridScale);
  const setGridScale = useStore((s) => s.setGridScale);
  const resetView = useStore((s) => s.resetView);
  const selectedObjectId = useStore((s) => s.selectedObjectId);
  const setSelectedObjectId = useStore((s) => s.setSelectedObjectId);

  const [newX, setNewX] = useState('');
  const [newY, setNewY] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState(COLOR_PRESETS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editX, setEditX] = useState('');
  const [editY, setEditY] = useState('');
  const [editLabel, setEditLabel] = useState('');
  const [editColor, setEditColor] = useState('');

  const handleAddPoint = () => {
    const x = parseFloat(newX);
    const y = parseFloat(newY);
    if (isNaN(x) || isNaN(y)) return;
    addPoint(x, y, newLabel || undefined, newColor);
    setNewX('');
    setNewY('');
    setNewLabel('');
  };

  const startEdit = (point: { id: string; x: number; y: number; label?: string; color?: string }) => {
    setEditingId(point.id);
    setEditX(point.x.toString());
    setEditY(point.y.toString());
    setEditLabel(point.label ?? '');
    setEditColor(point.color ?? COLOR_PRESETS[0]);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const x = parseFloat(editX);
    const y = parseFloat(editY);
    if (isNaN(x) || isNaN(y)) return;
    updatePoint(editingId, {
      x,
      y,
      label: editLabel || undefined,
      color: editColor,
    });
    setEditingId(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleResetView = () => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      resetView(rect.width, rect.height);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Add Point Form */}
      <div className="p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Add Point
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1">X</Label>
            <Input
              type="number"
              placeholder="0"
              value={newX}
              onChange={(e) => setNewX(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()}
            />
          </div>
          <div>
            <Label className="text-[11px] text-muted-foreground mb-1">Y</Label>
            <Input
              type="number"
              placeholder="0"
              value={newY}
              onChange={(e) => setNewY(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()}
            />
          </div>
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1">Label (optional)</Label>
          <Input
            placeholder="e.g. A, B, P1..."
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            className="h-8 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleAddPoint()}
          />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground mb-1">Color</Label>
          <div className="flex gap-1.5 flex-wrap">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                className={`w-6 h-6 rounded-full border-2 transition-all ${
                  newColor === color
                    ? 'border-foreground scale-110'
                    : 'border-transparent hover:border-muted-foreground/50'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setNewColor(color)}
                title={color}
              />
            ))}
          </div>
        </div>
        <Button onClick={handleAddPoint} className="w-full h-8 text-sm" size="sm">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Point
        </Button>
      </div>

      <Separator />

      {/* Points List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-4 py-2 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Points
          </h3>
          <span className="text-[11px] text-muted-foreground">{points.length} items</span>
        </div>
        <ScrollArea className="flex-1 px-2">
          {points.length === 0 ? (
            <div className="px-2 py-8 text-center">
              <p className="text-sm text-muted-foreground">No points yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Add a point using the form above
              </p>
            </div>
          ) : (
            <div className="space-y-1 pb-2">
              {points.map((point) =>
                editingId === point.id ? (
                  // Edit mode
                  <div
                    key={point.id}
                    className="p-2 rounded-lg border border-primary/30 bg-primary/5 space-y-2"
                  >
                    <div className="grid grid-cols-2 gap-1.5">
                      <Input
                        type="number"
                        value={editX}
                        onChange={(e) => setEditX(e.target.value)}
                        className="h-7 text-xs"
                        placeholder="X"
                      />
                      <Input
                        type="number"
                        value={editY}
                        onChange={(e) => setEditY(e.target.value)}
                        className="h-7 text-xs"
                        placeholder="Y"
                      />
                    </div>
                    <Input
                      value={editLabel}
                      onChange={(e) => setEditLabel(e.target.value)}
                      className="h-7 text-xs"
                      placeholder="Label"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      {COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          className={`w-5 h-5 rounded-full border-2 transition-all ${
                            editColor === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent hover:border-muted-foreground/50'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => setEditColor(color)}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-6 text-xs flex-1" onClick={saveEdit}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 text-xs flex-1"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  // Display mode
                  <div
                    key={point.id}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedObjectId === point.id
                        ? 'bg-primary/10 border border-primary/20'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedObjectId(point.id)}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: point.color ?? '#60a5fa' }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">
                        {point.label ? `${point.label}` : `Point`}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        ({point.x}, {point.y})
                      </div>
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEdit(point);
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          removePoint(point.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      <Separator />

      {/* Canvas Controls */}
      <div className="p-4 space-y-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Canvas Controls
        </h3>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label className="text-[11px] text-muted-foreground">Grid Scale</Label>
            <span className="text-[11px] font-mono text-muted-foreground">{gridScale}</span>
          </div>
          <Slider
            value={[gridScale]}
            onValueChange={([v]) => setGridScale(v)}
            min={0.5}
            max={10}
            step={0.5}
            className="w-full"
          />
        </div>
        <Button variant="outline" size="sm" className="w-full h-7 text-xs" onClick={handleResetView}>
          Reset View
        </Button>
      </div>
    </div>
  );
}
