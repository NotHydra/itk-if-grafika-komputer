import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../store';

const DEFAULT_LINE_COLOR = '#34d399';
const DEFAULT_GRAPH_COLOR = '#a78bfa';

export function GraphPanel() {
  const points = useStore((s) => s.points);
  const lines = useStore((s) => s.lines);
  const graphs = useStore((s) => s.graphs);
  const addLine = useStore((s) => s.addLine);
  const removeLine = useStore((s) => s.removeLine);
  const addGraph = useStore((s) => s.addGraph);
  const removeGraph = useStore((s) => s.removeGraph);
  const selectedObjectId = useStore((s) => s.selectedObjectId);
  const setSelectedObjectId = useStore((s) => s.setSelectedObjectId);

  // Line State
  const [lineMode, setLineMode] = useState<'coords' | 'points'>('points');
  const [x1, setX1] = useState('');
  const [y1, setY1] = useState('');
  const [x2, setX2] = useState('');
  const [y2, setY2] = useState('');
  const [p1Id, setP1Id] = useState('');
  const [p2Id, setP2Id] = useState('');
  const [lineLabel, setLineLabel] = useState('');
  const [lineColor, setLineColor] = useState(DEFAULT_LINE_COLOR);

  // Graph State
  const [exp, setExp] = useState('x^2');
  const [xMin, setXMin] = useState('-10');
  const [xMax, setXMax] = useState('10');
  const [graphLabel, setGraphLabel] = useState('');
  const [graphColor, setGraphColor] = useState(DEFAULT_GRAPH_COLOR);

  const handleAddLine = () => {
    if (lineMode === 'coords') {
      const px1 = parseFloat(x1);
      const py1 = parseFloat(y1);
      const px2 = parseFloat(x2);
      const py2 = parseFloat(y2);
      if (isNaN(px1) || isNaN(py1) || isNaN(px2) || isNaN(py2)) return;
      addLine(px1, py1, px2, py2, { label: lineLabel || undefined, color: lineColor });
    } else {
      if (!p1Id || !p2Id || p1Id === p2Id) return;
      addLine(0, 0, 0, 0, { point1Id: p1Id, point2Id: p2Id, label: lineLabel || undefined, color: lineColor });
    }
  };

  const handleAddGraph = () => {
    const min = parseFloat(xMin);
    const max = parseFloat(xMax);
    if (!exp || isNaN(min) || isNaN(max) || min >= max) return;
    addGraph(exp, min, max, 200, graphColor);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs defaultValue="lines" className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border bg-transparent h-10 p-0">
          <TabsTrigger
            value="lines"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs h-full"
          >
            Lines
          </TabsTrigger>
          <TabsTrigger
            value="graphs"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs h-full"
          >
            Functions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lines" className="flex-1 flex flex-col m-0 min-h-0">
          <div className="p-4 space-y-3">
            <div className="flex bg-muted rounded-md p-0.5">
              <button
                className={`flex-1 text-[11px] py-1 rounded-sm font-medium transition-colors ${lineMode === 'points' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setLineMode('points')}
              >
                Connect Points
              </button>
              <button
                className={`flex-1 text-[11px] py-1 rounded-sm font-medium transition-colors ${lineMode === 'coords' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                onClick={() => setLineMode('coords')}
              >
                Coordinates
              </button>
            </div>

            {lineMode === 'points' ? (
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1">Point 1</Label>
                  <select
                    className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={p1Id}
                    onChange={(e) => setP1Id(e.target.value)}
                  >
                    <option value="" disabled>Select point...</option>
                    {points.map((p) => (
                      <option key={p.id} value={p.id}>{p.label || `Point (${p.x}, ${p.y})`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label className="text-[11px] text-muted-foreground mb-1">Point 2</Label>
                  <select
                    className="flex h-8 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                    value={p2Id}
                    onChange={(e) => setP2Id(e.target.value)}
                  >
                    <option value="" disabled>Select point...</option>
                    {points.map((p) => (
                      <option key={p.id} value={p.id}>{p.label || `Point (${p.x}, ${p.y})`}</option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <Input type="number" placeholder="X1" value={x1} onChange={(e) => setX1(e.target.value)} className="h-8 text-xs" />
                    <Input type="number" placeholder="Y1" value={y1} onChange={(e) => setY1(e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex gap-1">
                    <Input type="number" placeholder="X2" value={x2} onChange={(e) => setX2(e.target.value)} className="h-8 text-xs" />
                    <Input type="number" placeholder="Y2" value={y2} onChange={(e) => setY2(e.target.value)} className="h-8 text-xs" />
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-[11px] text-muted-foreground mb-1">Label</Label>
                <Input placeholder="Line label..." value={lineLabel} onChange={(e) => setLineLabel(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Color</Label>
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded-md [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
                  title="Choose line color"
                />
              </div>
            </div>

            <Button onClick={handleAddLine} className="w-full h-8 text-sm" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Line
            </Button>
          </div>

          <Separator />
          
          <ScrollArea className="flex-1 px-2 py-2 min-h-0">
            {lines.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground mt-4">No lines added yet.</p>
            ) : (
              <div className="space-y-1 pb-2">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedObjectId === line.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedObjectId(line.id)}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: line.color ?? DEFAULT_LINE_COLOR }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{line.label || 'Line Segment'}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {line.point1Id && line.point2Id ? 'Tracking points' : `(${line.x1}, ${line.y1}) to (${line.x2}, ${line.y2})`}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); removeLine(line.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="graphs" className="flex-1 flex flex-col m-0 min-h-0">
          <div className="p-4 space-y-3">
            <div>
              <Label className="text-[11px] text-muted-foreground mb-1">Function Expression [ y = f(x) ]</Label>
              <Input placeholder="e.g. sin(x) * 5" value={exp} onChange={(e) => setExp(e.target.value)} className="h-8 text-xs font-mono" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1">Min X</Label>
                <Input type="number" placeholder="-10" value={xMin} onChange={(e) => setXMin(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1">Max X</Label>
                <Input type="number" placeholder="10" value={xMax} onChange={(e) => setXMax(e.target.value)} className="h-8 text-xs" />
              </div>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Label className="text-[11px] text-muted-foreground mb-1">Label</Label>
                <Input placeholder="Graph label..." value={graphLabel} onChange={(e) => setGraphLabel(e.target.value)} className="h-8 text-xs" />
              </div>
              <div>
                <Label className="text-[11px] text-muted-foreground mb-1 block">Color</Label>
                <input
                  type="color"
                  value={graphColor}
                  onChange={(e) => setGraphColor(e.target.value)}
                  className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer rounded-md [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-md"
                  title="Choose graph color"
                />
              </div>
            </div>
            <Button onClick={handleAddGraph} className="w-full h-8 text-sm" size="sm">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Function
            </Button>
          </div>

          <Separator />
          
          <ScrollArea className="flex-1 px-2 py-2 min-h-0">
            {graphs.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground mt-4">No functions yet.</p>
            ) : (
              <div className="space-y-1 pb-2">
                {graphs.map((g) => (
                  <div
                    key={g.id}
                    className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
                      selectedObjectId === g.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedObjectId(g.id)}
                  >
                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: g.color ?? DEFAULT_GRAPH_COLOR }} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-foreground truncate">{g.label || `f(x) = ${g.expression}`}</div>
                      <div className="text-[10px] text-muted-foreground">Domain: [{g.xMin}, {g.xMax}]</div>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); removeGraph(g.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
