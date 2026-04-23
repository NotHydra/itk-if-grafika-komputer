import { useCallback, useEffect, useRef } from "react";

export function useAnimationFrame(callback: () => void, active = true) {
	const callbackRef = useRef(callback);
	const frameRef = useRef<number | null>(null);

	// Keep callback ref up to date
	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	const loop = useCallback(() => {
		callbackRef.current();
		frameRef.current = requestAnimationFrame(loop);
	}, []);

	useEffect(() => {
		if (active) {
			frameRef.current = requestAnimationFrame(loop);
		}
		return () => {
			if (frameRef.current !== null) {
				cancelAnimationFrame(frameRef.current);
			}
		};
	}, [active, loop]);
}
