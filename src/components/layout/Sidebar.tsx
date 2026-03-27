import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crosshair, Microscope, Shapes, TrendingUp } from 'lucide-react';
import { useStore } from '../../store';
import { CoordinatePanel } from '../panels/CoordinatePanel';
import { GraphPanel } from '../panels/GraphPanel';
import { IllustrationPanel } from '../panels/IllustrationPanel';
import { OpticsPanel } from '../panels/OpticsPanel';

export function Sidebar() {
  const setActiveStep = useStore((s) => s.setActiveStep);

  const handleTabChange = (value: string) => {
    switch (value) {
      case 'points': setActiveStep(1); break;
      case 'lines': setActiveStep(2); break;
      case 'shapes': setActiveStep(3); break;
      case 'optics': setActiveStep(4); break;
    }
  };

  return (
    <aside className="w-[320px] border-r border-border bg-background flex flex-col shrink-0 h-full">
      <Tabs defaultValue="points" onValueChange={handleTabChange} className="flex flex-col h-full">
        <TabsList className="grid w-full grid-cols-4 rounded-none border-b border-border bg-transparent h-10 p-0">
          <TabsTrigger
            value="points"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs gap-1 h-full"
          >
            <Crosshair className="h-3.5 w-3.5" />
            Points
          </TabsTrigger>
          <TabsTrigger
            value="lines"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs gap-1 h-full"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Lines
          </TabsTrigger>
          <TabsTrigger
            value="shapes"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs gap-1 h-full"
          >
            <Shapes className="h-3.5 w-3.5" />
            Shapes
          </TabsTrigger>
          <TabsTrigger
            value="optics"
            className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none text-xs gap-1 h-full"
          >
            <Microscope className="h-3.5 w-3.5" />
            Optics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="points" className="flex-1 m-0 overflow-hidden flex flex-col min-h-0">
          <CoordinatePanel />
        </TabsContent>
        <TabsContent value="lines" className="flex-1 m-0 overflow-hidden flex flex-col min-h-0">
          <GraphPanel />
        </TabsContent>
        <TabsContent value="shapes" className="flex-1 m-0 overflow-hidden flex flex-col min-h-0">
          <IllustrationPanel />
        </TabsContent>
        <TabsContent value="optics" className="flex-1 m-0 overflow-hidden flex flex-col min-h-0">
          <OpticsPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
