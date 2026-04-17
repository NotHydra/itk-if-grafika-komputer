import { CanvasStage } from "../canvas/CanvasStage";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";

export function AppShell() {
	return (
		<div className="flex flex-col h-screen w-screen">
			<Toolbar />
			<div className="flex flex-1 overflow-hidden">
				<Sidebar />
				<main className="flex-1 min-w-[400px] overflow-hidden">
					<CanvasStage />
				</main>
			</div>
		</div>
	);
}
