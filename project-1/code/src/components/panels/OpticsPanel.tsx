import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Info, Link as LinkIcon, Trash2 } from "lucide-react";
import { ShapeRegistry } from "../../canvas/shapes/ShapeRegistry";
import { useStore } from "../../store";
import type { OpticsObjectType } from "../../types";

export function OpticsPanel() {
	const opticsObjects = useStore((s) => s.opticsObjects);
	const addOpticsObject = useStore((s) => s.addOpticsObject);
	const removeOpticsObject = useStore((s) => s.removeOpticsObject);
	const updateOpticsObject = useStore((s) => s.updateOpticsObject);

	const lightSources = useStore((s) => s.lightSources);
	const addLightSource = useStore((s) => s.addLightSource);
	const removeLightSource = useStore((s) => s.removeLightSource);

	const shadowResults = useStore((s) => s.shadowResults);
	const shapes = useStore((s) => s.shapes);

	const selectedObjectId = useStore((s) => s.selectedObjectId);
	const setSelectedObjectId = useStore((s) => s.setSelectedObjectId);

	const handleAdd = (type: OpticsObjectType) => {
		addOpticsObject(type, 0, 5, 8);
	};

	const selectedOptic = opticsObjects.find((o) => o.id === selectedObjectId);
	const activeLightSource = lightSources.find(
		(ls) => ls.opticsObjectId === selectedObjectId,
	);
	const activeShadow = shadowResults.find(
		(sr) => sr.opticsObjectId === selectedObjectId,
	);
	const activeSourceShape = shapes.find(
		(s) => s.id === activeLightSource?.sourceShapeId,
	);

	return (
		<div className="flex flex-col h-full bg-card">
			<div className="p-3 border-b flex shrink-0">
				<h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
					Optics Palette
				</h2>
			</div>

			<div className="p-3 grid grid-cols-2 gap-2 shrink-0">
				<Button
					variant="outline"
					size="sm"
					onClick={() => handleAdd("convex-lens")}
					className="text-xs"
				>
					Convex Lens
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handleAdd("concave-lens")}
					className="text-xs"
				>
					Concave Lens
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handleAdd("concave-mirror")}
					className="text-xs"
				>
					Concave Mirror
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => handleAdd("convex-mirror")}
					className="text-xs"
				>
					Convex Mirror
				</Button>
			</div>

			<Separator />

			<div className="p-3 border-b flex shrink-0 justify-between items-center">
				<h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
					Active Optics
				</h2>
				<span className="text-xs text-muted-foreground">
					{opticsObjects.length} items
				</span>
			</div>

			<ScrollArea className="flex-1 min-h-0">
				<div className="p-3 space-y-2">
					{opticsObjects.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground text-xs italic bg-muted/30 rounded-lg border border-dashed">
							No optics added. Create one from the palette above.
						</div>
					) : (
						opticsObjects.map((obj) => (
							<div
								key={obj.id}
								className={`flex items-center justify-between p-2 rounded-md border text-sm cursor-pointer transition-colors ${
									selectedObjectId === obj.id
										? "bg-primary/10 border-primary text-primary-foreground"
										: "bg-background hover:bg-muted/50 border-border"
								}`}
								onClick={() => setSelectedObjectId(obj.id)}
							>
								<div className="flex items-center gap-3 overflow-hidden">
									<div className="w-6 h-6 rounded bg-muted flex items-center justify-center shrink-0">
										<span className="text-xs">🔭</span>
									</div>
									<div className="flex flex-col min-w-0">
										<span className="font-medium truncate capitalize">
											{obj.type.replace("-", " ")}
										</span>
										<span className="text-[10px] text-muted-foreground">
											Pos: {obj.x.toFixed(1)} | f:{" "}
											{obj.focalLength}
										</span>
									</div>
								</div>
								<Button
									variant="ghost"
									size="icon"
									className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
									onClick={(e) => {
										e.stopPropagation();
										removeOpticsObject(obj.id);
										if (selectedObjectId === obj.id)
											setSelectedObjectId(null);
									}}
								>
									<Trash2 className="h-3.5 w-3.5" />
								</Button>
							</div>
						))
					)}
				</div>
			</ScrollArea>

			{selectedOptic && (
				<div className="shrink-0 border-t bg-card/50">
					<div className="p-3 border-b bg-muted/20">
						<h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
							Optics Inspector
							<span className="capitalize font-mono text-[10px] bg-background px-1.5 py-0.5 rounded border">
								{selectedOptic.type.replace("-", " ")}
							</span>
						</h2>
					</div>

					<ScrollArea className="h-64">
						<div className="p-4 space-y-4">
							{/* Position */}
							<div className="space-y-2">
								<div className="flex justify-between">
									<label className="text-[11px] font-medium text-muted-foreground">
										Position X
									</label>
									<span className="text-[11px] font-mono">
										{selectedOptic.x.toFixed(1)}
									</span>
								</div>
								<Slider
									min={-20}
									max={20}
									step={0.5}
									value={[selectedOptic.x]}
									onValueChange={([val]) =>
										updateOpticsObject(selectedOptic.id, {
											x: val,
										})
									}
								/>
							</div>

							{/* Focal Length */}
							<div className="space-y-2">
								<div className="flex justify-between">
									<label className="text-[11px] font-medium text-muted-foreground">
										Focal Length (f)
									</label>
									<span className="text-[11px] font-mono">
										{selectedOptic.focalLength.toFixed(1)}
									</span>
								</div>
								<Slider
									min={1}
									max={15}
									step={0.5}
									value={[selectedOptic.focalLength]}
									onValueChange={([val]) =>
										updateOpticsObject(selectedOptic.id, {
											focalLength: val,
										})
									}
								/>
							</div>

							<Separator />

							{/* Light Source Link */}
							<div className="space-y-2">
								<label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
									<LinkIcon className="h-3 w-3" /> Source
									Object (Light)
								</label>

								{shapes.length === 0 ? (
									<div className="text-[11px] text-muted-foreground italic px-2 py-1 bg-muted/50 rounded">
										Add a Shape to the canvas first to
										project an image.
									</div>
								) : (
									<div className="flex flex-col gap-2">
										<select
											className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
											value={
												activeLightSource?.sourceShapeId ||
												""
											}
											onChange={(e) => {
												const sid = e.target.value;
												if (!sid) {
													if (activeLightSource)
														removeLightSource(
															activeLightSource.id,
														);
												} else {
													if (activeLightSource) {
														removeLightSource(
															activeLightSource.id,
														);
													}
													addLightSource(
														sid,
														selectedOptic.id,
														0,
														0,
													);
												}
											}}
										>
											<option value="">-- None --</option>
											{shapes.map((s) => (
												<option key={s.id} value={s.id}>
													{ShapeRegistry.get(s.type)
														?.label || s.type}{" "}
													({s.x.toFixed(1)},{" "}
													{s.y.toFixed(1)})
												</option>
											))}
										</select>
									</div>
								)}
							</div>

							{/* Results Display */}
							{activeLightSource &&
							activeSourceShape &&
							!activeShadow ? (
								<div className="space-y-2 mt-4">
									<div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
										<p className="text-xs text-destructive flex items-center gap-1 font-medium mb-1">
											<AlertTriangle className="h-3 w-3" />{" "}
											Invalid Physical Setup
										</p>
										<p className="text-[10px] text-muted-foreground leading-tight">
											{activeSourceShape.x >=
											selectedOptic.x
												? "The light source is on the transmission side (right). Real objects must be placed to the left."
												: "The light source is physically overlapping or straddling the optical element."}
										</p>
									</div>
								</div>
							) : activeShadow ? (
								<div className="space-y-2 mt-4">
									<label className="text-[11px] font-bold text-muted-foreground uppercase flex items-center gap-1">
										<Info className="h-3 w-3" /> Physics
										Formations
									</label>

									{/* Edge Case Warning: On axis */}
									{Math.abs(
										activeSourceShape!.y - selectedOptic.y,
									) < 0.1 && (
										<div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-2 mt-1 mb-2">
											<p className="text-[10px] text-amber-500/90 font-medium flex items-center gap-1 leading-tight">
												<AlertTriangle className="h-3 w-3 shrink-0" />
												<span>
													<strong>Degenerate:</strong>{" "}
													Object is on the optical
													axis ($y=0$). True
													transverse image height is
													zero.
												</span>
											</p>
										</div>
									)}

									{/* Edge Case Warning: Near focal point */}
									{Math.abs(
										Math.abs(
											activeSourceShape!.x -
												selectedOptic.x,
										) - Math.abs(selectedOptic.focalLength),
									) < 0.2 && (
										<div className="bg-orange-500/10 border border-orange-500/20 rounded-md p-2 mt-1 mb-2">
											<p className="text-[10px] text-orange-500/90 font-medium flex items-center gap-1 leading-tight">
												<AlertTriangle className="h-3 w-3 shrink-0" />
												<span>
													<strong>
														Near-Singular:
													</strong>{" "}
													Object is at or near the
													focal point. Image tends
													toward infinity.
												</span>
											</p>
										</div>
									)}

									<div className="bg-muted/30 border rounded-md p-3 space-y-2">
										<div className="flex justify-between items-center border-b border-border/50 pb-1">
											<span className="text-[11px] text-muted-foreground">
												Image Pos ($d_i$)
											</span>
											<span className="text-xs font-mono font-bold text-blue-400">
												{activeShadow.imageDistance.toFixed(
													2,
												)}{" "}
												units
											</span>
										</div>
										<div className="flex justify-between items-center border-b border-border/50 pb-1">
											<span className="text-[11px] text-muted-foreground">
												Magnification ($m$)
											</span>
											<span className="text-xs font-mono font-bold text-amber-400">
												{activeShadow.magnification.toFixed(
													2,
												)}
												x
											</span>
										</div>
										<div className="flex justify-between items-center border-b border-border/50 pb-1">
											<span className="text-[11px] text-muted-foreground">
												Type
											</span>
											<span
												className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${activeShadow.imageType === "real" ? "bg-green-500/20 text-green-500" : "bg-purple-500/20 text-purple-400"}`}
											>
												{activeShadow.imageType}
											</span>
										</div>
										<div className="flex justify-between items-center">
											<span className="text-[11px] text-muted-foreground">
												Orientation
											</span>
											<span
												className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${activeShadow.imageOrientation === "upright" ? "bg-emerald-500/20 text-emerald-500" : "bg-rose-500/20 text-rose-400"}`}
											>
												{activeShadow.imageOrientation}
											</span>
										</div>
									</div>
								</div>
							) : null}
						</div>
					</ScrollArea>
				</div>
			)}
		</div>
	);
}
