import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import * as LucideIcons from "lucide-react";
import { Plus, Trash2 } from "lucide-react";
import { ShapeRegistry } from "../../canvas/shapes/ShapeRegistry";
import { useStore } from "../../store";
import type { ShapeType } from "../../types";

export function IllustrationPanel() {
	const shapes = useStore((s) => s.shapes);
	const addShape = useStore((s) => s.addShape);
	const removeShape = useStore((s) => s.removeShape);
	const updateShape = useStore((s) => s.updateShape);
	const selectedObjectId = useStore((s) => s.selectedObjectId);
	const setSelectedObjectId = useStore((s) => s.setSelectedObjectId);

	const availableShapes = ShapeRegistry.getAll();
	const selectedShape = shapes.find((s) => s.id === selectedObjectId);
	const selectedDef = selectedShape
		? ShapeRegistry.get(selectedShape.type)
		: null;

	const handleAddShape = (type: string) => {
		addShape(type as ShapeType, 0, 0);
	};

	// Helper to render lucide icons from string name
	const renderIcon = (iconName: string, className?: string) => {
		// Convert kebab-case or lowercase to PascalCase for Lucide component matching
		// e.g. 'pencil' -> 'Pencil', 'move-right' -> 'MoveRight'
		const pascalName = iconName
			.split("-")
			.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
			.join("");

		const IconComponent =
			(LucideIcons as any)[pascalName] || LucideIcons.HelpCircle;
		return <IconComponent className={className || "h-4 w-4"} />;
	};

	return (
		<div className="flex flex-col h-full">
			{/* Shape Options */}
			<div className="p-4 space-y-3">
				<h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
					Shape Options
				</h3>
				<div className="grid grid-cols-3 gap-2">
					{availableShapes.map((def) => (
						<Button
							key={def.id}
							variant="outline"
							size="sm"
							className="flex flex-col items-center justify-center h-16 gap-1.5 p-0"
							onClick={() => handleAddShape(def.id)}
						>
							{renderIcon(def.icon, "h-5 w-5")}
							<span className="text-[10px] truncate w-full px-1">
								{def.label}
							</span>
						</Button>
					))}
				</div>
			</div>

			<Separator />

			{/* Shapes List */}
			<div className="flex-1 flex flex-col min-h-0">
				<div className="px-4 py-2 flex items-center justify-between">
					<h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
						Active Shapes
					</h3>
					<span className="text-[11px] text-muted-foreground">
						{shapes.length} items
					</span>
				</div>
				<ScrollArea className="flex-1 px-2 min-h-0">
					{shapes.length === 0 ? (
						<div className="px-2 py-8 text-center">
							<p className="text-sm text-muted-foreground">
								No shapes yet
							</p>
							<p className="text-xs text-muted-foreground/60 mt-1">
								Select a shape from the palette above
							</p>
						</div>
					) : (
						<div className="space-y-1 pb-2">
							{shapes.map((shape) => {
								const def = ShapeRegistry.get(shape.type);
								return (
									<div
										key={shape.id}
										className={`group flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition-colors ${
											selectedObjectId === shape.id
												? "bg-primary/10 border border-primary/20"
												: "hover:bg-muted/50"
										}`}
										onClick={() =>
											setSelectedObjectId(shape.id)
										}
									>
										<div className="text-muted-foreground shrink-0">
											{def ? (
												renderIcon(
													def.icon,
													"h-3.5 w-3.5",
												)
											) : (
												<Plus className="h-3.5 w-3.5" />
											)}
										</div>
										<div className="flex-1 min-w-0">
											<div className="text-xs font-medium text-foreground truncate">
												{def?.label || shape.type}
											</div>
											<div className="text-[10px] text-muted-foreground">
												Pos: ({shape.x}, {shape.y}) |
												Rot: {shape.rotation}°
											</div>
										</div>
										<Button
											variant="ghost"
											size="icon"
											className="h-6 w-6 text-destructive hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
											onClick={(e) => {
												e.stopPropagation();
												removeShape(shape.id);
											}}
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									</div>
								);
							})}
						</div>
					)}
				</ScrollArea>
			</div>

			<Separator />

			{/* Inspector */}
			<div className="h-2/5 min-h-[250px] bg-muted/20 flex flex-col">
				<div className="px-4 py-2 border-b bg-muted/30">
					<h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
						Shape Inspector
					</h3>
				</div>
				<ScrollArea className="flex-1 min-h-0">
					{selectedShape && selectedDef ? (
						<div className="p-4 space-y-4">
							{/* Common Fields */}
							<div className="space-y-3">
								<div className="grid grid-cols-2 gap-3">
									<div className="space-y-1.5">
										<Label className="text-[11px] text-muted-foreground">
											Position X
										</Label>
										<Input
											type="number"
											value={selectedShape.x}
											onChange={(e) =>
												updateShape(selectedShape.id, {
													x:
														parseFloat(
															e.target.value,
														) || 0,
												})
											}
											className="h-7 text-xs"
										/>
									</div>
									<div className="space-y-1.5">
										<Label className="text-[11px] text-muted-foreground">
											Position Y
										</Label>
										<Input
											type="number"
											value={selectedShape.y}
											onChange={(e) =>
												updateShape(selectedShape.id, {
													y:
														parseFloat(
															e.target.value,
														) || 0,
												})
											}
											className="h-7 text-xs"
										/>
									</div>
								</div>

								{/* <div className="space-y-1.5">
									<div className="flex justify-between">
										<Label className="text-[11px] text-muted-foreground">
											Rotation (°)
										</Label>
										<span className="text-[10px] font-mono text-muted-foreground">
											{selectedShape.rotation}
										</span>
									</div>
									<Slider
										value={[selectedShape.rotation]}
										onValueChange={([v]) =>
											updateShape(selectedShape.id, {
												rotation: v,
											})
										}
										min={0}
										max={360}
										step={1}
										className="py-1"
									/>
								</div> */}

								<div className="space-y-1.5">
									<div className="flex justify-between">
										<Label className="text-[11px] text-muted-foreground">
											Scale
										</Label>
										<span className="text-[10px] font-mono text-muted-foreground">
											{selectedShape.scale}x
										</span>
									</div>
									<Slider
										value={[selectedShape.scale]}
										onValueChange={([v]) =>
											updateShape(selectedShape.id, {
												scale: v,
											})
										}
										min={0.1}
										max={3}
										step={0.1}
										className="py-1"
									/>
								</div>

								<div className="space-y-1.5">
									<Label className="text-[11px] text-muted-foreground">
										Base Color
									</Label>
									<div className="flex items-center gap-2">
										<input
											type="color"
											value={
												selectedShape.color ||
												selectedDef.defaultColor ||
												"#60a5fa"
											}
											onChange={(e) =>
												updateShape(selectedShape.id, {
													color: e.target.value,
												})
											}
											className="w-7 h-7 p-0 border-0 bg-transparent cursor-pointer rounded [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded"
										/>
										<span className="text-[10px] font-mono text-muted-foreground uppercase">
											{selectedShape.color ||
												selectedDef.defaultColor ||
												"#60a5fa"}
										</span>
									</div>
								</div>
							</div>

							<Separator />

							{/* Dynamic Meta Fields */}
							{selectedDef.inspectorFields &&
								selectedDef.inspectorFields.length > 0 && (
									<div className="space-y-3">
										<h4 className="text-[10px] font-bold text-muted-foreground uppercase italic tracking-tight">
											Properties
										</h4>
										{selectedDef.inspectorFields.map(
											(field) => (
												<div
													key={field.key}
													className="space-y-1.5"
												>
													<div className="flex justify-between">
														<Label className="text-[11px] text-muted-foreground">
															{field.label}
														</Label>
														{(field.type ===
															"range" ||
															field.type ===
																"number") && (
															<span className="text-[10px] font-mono text-muted-foreground">
																{String(
																	selectedShape
																		.meta?.[
																		field
																			.key
																	] ??
																		field.defaultValue,
																)}
															</span>
														)}
													</div>

													{field.type === "range" && (
														<Slider
															value={[
																(selectedShape
																	.meta?.[
																	field.key
																] as number) ??
																	(field.defaultValue as number),
															]}
															onValueChange={([
																v,
															]) =>
																updateShape(
																	selectedShape.id,
																	{
																		meta: {
																			...selectedShape.meta,
																			[field.key]:
																				v,
																		},
																	},
																)
															}
															min={field.min ?? 0}
															max={
																field.max ?? 100
															}
															step={
																field.step ?? 1
															}
															className="py-1"
														/>
													)}

													{field.type ===
														"number" && (
														<Input
															type="number"
															value={
																(selectedShape
																	.meta?.[
																	field.key
																] as number) ??
																(field.defaultValue as number)
															}
															onChange={(e) =>
																updateShape(
																	selectedShape.id,
																	{
																		meta: {
																			...selectedShape.meta,
																			[field.key]:
																				parseFloat(
																					e
																						.target
																						.value,
																				) ||
																				0,
																		},
																	},
																)
															}
															className="h-7 text-xs"
														/>
													)}

													{/* Add support for other types if needed later */}
												</div>
											),
										)}
									</div>
								)}
						</div>
					) : (
						<div className="p-8 text-center">
							<LucideIcons.Settings2 className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
							<p className="text-xs text-muted-foreground italic">
								Select a shape from the list to inspect
								properties
							</p>
						</div>
					)}
				</ScrollArea>
			</div>
		</div>
	);
}
