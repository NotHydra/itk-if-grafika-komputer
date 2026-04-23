/** Safe accessor for numeric shape.meta values */
export function metaNum(
	meta: Record<string, unknown> | undefined,
	key: string,
	fallback: number,
): number {
	const v = meta?.[key];
	return typeof v === "number" ? v : fallback;
}

/** Safe accessor for string shape.meta values */
export function metaStr(
	meta: Record<string, unknown> | undefined,
	key: string,
	fallback: string,
): string {
	const v = meta?.[key];
	return typeof v === "string" ? v : fallback;
}

/** Safe accessor for boolean shape.meta values */
export function metaBool(
	meta: Record<string, unknown> | undefined,
	key: string,
	fallback: boolean,
): boolean {
	const v = meta?.[key];
	return typeof v === "boolean" ? v : fallback;
}
