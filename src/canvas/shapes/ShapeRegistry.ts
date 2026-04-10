import type { ShapeDefinition } from "./ShapeDefinition";

const registry = new Map<string, ShapeDefinition>();

export const ShapeRegistry = {
	register(def: ShapeDefinition): void {
		if (registry.has(def.id)) {
			console.warn(
				`ShapeRegistry: "${def.id}" already registered — overwriting.`,
			);
		}
		registry.set(def.id, def);
	},
	get(id: string): ShapeDefinition | undefined {
		return registry.get(id);
	},
	getAll(): ShapeDefinition[] {
		return Array.from(registry.values());
	},
};
