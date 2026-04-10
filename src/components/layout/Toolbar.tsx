import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Moon, RefreshCw, Sun, ZoomIn, ZoomOut } from "lucide-react";
import { useStore } from "../../store";

export function Toolbar() {
	const theme = useStore((s) => s.theme);
	const toggleTheme = useStore((s) => s.toggleTheme);
	const activeStep = useStore((s) => s.activeStep);
	const zoom = useStore((s) => s.zoom);
	const resetView = useStore((s) => s.resetView);

	const steps = [
		{ id: 1 as const, label: "Points" },
		{ id: 2 as const, label: "Lines" },
		{ id: 3 as const, label: "Shapes" },
		{ id: 4 as const, label: "Optics" },
	];

	const handleResetView = () => {
		// Get canvas dimensions from DOM
		const canvas = document.querySelector("canvas");
		if (canvas) {
			const rect = canvas.getBoundingClientRect();
			resetView(rect.width, rect.height);
		}
	};

	return (
		<header className="h-12 border-b border-border bg-background/95 backdrop-blur-sm flex items-center px-4 gap-3 shrink-0">
			{/* App title */}
			<div className="flex items-center gap-2">
				<h1 className="text-sm font-semibold text-foreground tracking-tight">
					Optics Simulator
				</h1>
			</div>

			{/* <Separator orientation="vertical" className="h-6" /> */}

			{/* Step indicator */}
			{/* <div className="flex items-center gap-1">
				{steps.map((step, i) => (
					<div key={step.id} className="flex items-center">
						<div
							className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
								step.id === activeStep
									? "bg-primary text-primary-foreground"
									: step.id < activeStep
										? "bg-muted text-muted-foreground"
										: "text-muted-foreground/50"
							}`}
						>
							{step.label}
						</div>
						{i < steps.length - 1 && (
							<span className="text-muted-foreground/30 mx-0.5 text-xs">
								›
							</span>
						)}
					</div>
				))}
			</div> */}

			{/* Spacer */}
			<div className="flex-1" />

			{/* Zoom controls */}
			<div className="flex items-center gap-1">
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={() => zoom(0.8)}
					title="Zoom Out"
				>
					<ZoomOut className="h-3.5 w-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={() => zoom(1.25)}
					title="Zoom In"
				>
					<ZoomIn className="h-3.5 w-3.5" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					className="h-7 w-7"
					onClick={handleResetView}
					title="Reset View"
				>
					<RefreshCw className="h-3.5 w-3.5" />
				</Button>
			</div>

			{/* <Separator orientation="vertical" className="h-6" /> */}

			{/* Theme toggle */}
			{/* <Button
				variant="ghost"
				size="icon"
				className="h-7 w-7"
				onClick={toggleTheme}
				title={
					theme === "dark"
						? "Switch to light mode"
						: "Switch to dark mode"
				}
			>
				{theme === "dark" ? (
					<Sun className="h-3.5 w-3.5 text-yellow-400" />
				) : (
					<Moon className="h-3.5 w-3.5 text-slate-600" />
				)}
			</Button> */}
		</header>
	);
}
