"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the device supports hover interactions
 * Follows Single Responsibility Principle - only detects hover capability
 */
export function useSupportsHover(): boolean {
	const [supportsHover, setSupportsHover] = useState(true);

	useEffect(() => {
		queueMicrotask(() => {
			setSupportsHover(window.matchMedia('(hover: hover)').matches);
		});
	}, []);

	return supportsHover;
}
