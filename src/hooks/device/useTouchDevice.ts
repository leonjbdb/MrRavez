"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the current device is a touch device
 * Follows Single Responsibility Principle - only detects touch capability
 */
export function useTouchDevice(): boolean {
	// Start with false for SSR compatibility
	const [isTouchDevice, setIsTouchDevice] = useState(false);

	useEffect(() => {
		// Check for touch device on mount to avoid SSR/hydration mismatch
		// Use queueMicrotask to avoid synchronous setState warning
		queueMicrotask(() => {
			const isTouch =
				window.matchMedia('(hover: none)').matches ||
				window.matchMedia('(pointer: coarse)').matches ||
				'ontouchstart' in window;
			setIsTouchDevice(isTouch);
		});
	}, []);

	return isTouchDevice;
}
