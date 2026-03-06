import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crosshair, Microscope, Shapes, TrendingUp } from 'lucide-react';
import { CoordinatePanel } from '../panels/CoordinatePanel';
import { GraphPanel } from '../panels/GraphPanel';
import { IllustrationPanel } from '../panels/IllustrationPanel';
import { OpticsPanel } from '../panels/OpticsPanel';

export function Sidebar() {
  return (
    <aside className="w-[320px] border-r border-border bg-background flex flex-col shrink-0 h-full">
      <Tabs defaultValue="points" className="flex flex-col h-full">
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

        <TabsContent value="points" className="flex-1 m-0 overflow-hidden">
          <CoordinatePanel />
        </TabsContent>
        <TabsContent value="lines" className="flex-1 m-0 overflow-hidden">
          <GraphPanel />
        </TabsContent>
        <TabsContent value="shapes" className="flex-1 m-0 overflow-hidden">
          <IllustrationPanel />
        </TabsContent>
        <TabsContent value="optics" className="flex-1 m-0 overflow-hidden">
          <OpticsPanel />
        </TabsContent>
      </Tabs>
    </aside>
  );
}
