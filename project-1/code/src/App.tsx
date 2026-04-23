import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";
import { AppShell } from "./components/layout/AppShell";
import { useStore } from "./store";

function App() {
	const theme = useStore((s) => s.theme);

	// Sync theme class to <html> element
	useEffect(() => {
		const html = document.documentElement;
		if (theme === "dark") {
			html.classList.add("dark");
		} else {
			html.classList.remove("dark");
		}
	}, [theme]);

	return (
		<TooltipProvider>
			<AppShell />
		</TooltipProvider>
	);
}

export default App;
