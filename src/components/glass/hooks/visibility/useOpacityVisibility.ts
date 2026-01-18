"use client";

import { useState, useEffect, useRef } from "react";

export interface UseOpacityVisibilityOptions {
	opacity: number;
	/** Delay before hiding after opacity reaches 0 (default: 100ms) */
	hideDelayMs?: number;
}

export interface UseOpacityVisibilityResult {
	isVisible: boolean;
}

/**
 * Hook for basic opacity-based visibility
 * Follows Single Responsibility Principle - only handles opacity visibility
 */
export function useOpacityVisibility(options: UseOpacityVisibilityOptions): UseOpacityVisibilityResult {
	const { opacity, hideDelayMs = 100 } = options;

	const [isVisible, setIsVisible] = useState(() => opacity > 0.01);
	const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		// Clear any pending timer
		if (visibilityTimerRef.current) {
			clearTimeout(visibilityTimerRef.current);
			visibilityTimerRef.current = null;
		}

		if (opacity > 0.01) {
			// Immediately show when opacity increases
			visibilityTimerRef.current = setTimeout(() => setIsVisible(true), 0);
		} else {
			// Brief delay to ensure smooth transition completion
			visibilityTimerRef.current = setTimeout(() => setIsVisible(false), hideDelayMs);
		}

		return () => {
			if (visibilityTimerRef.current) {
				clearTimeout(visibilityTimerRef.current);
			}
		};
	}, [opacity, hideDelayMs]);

	return { isVisible };
}
