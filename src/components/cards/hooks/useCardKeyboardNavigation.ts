"use client";

import { useRef, useEffect, RefObject } from "react";
import { GLASS_BUTTON_SELECTOR } from "@/components/glass";

export interface UseCardKeyboardNavigationOptions {
	/** CSS selector for focusable elements (default: glass button selector) */
	selector?: string;
}

/**
 * Hook for keyboard navigation within card button lists
 * Follows Open/Closed Principle - selector is configurable
 * 
 * @param options - Configuration options
 * @returns A ref to attach to the container element containing the buttons
 */
export function useCardKeyboardNavigation(
	options: UseCardKeyboardNavigationOptions = {}
): RefObject<HTMLDivElement | null> {
	const { selector = GLASS_BUTTON_SELECTOR } = options;
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			// Only handle arrow up/down keys
			if (e.key !== "ArrowUp" && e.key !== "ArrowDown") {
				return;
			}

			// Check if a button within this card is focused
			const activeElement = document.activeElement;
			if (!activeElement || !container.contains(activeElement)) {
				return;
			}

			// Get all buttons within this card using the configured selector
			const buttons = Array.from(container.querySelectorAll<HTMLAnchorElement>(`.${selector}`));
			const currentIndex = buttons.indexOf(activeElement as HTMLAnchorElement);

			if (currentIndex === -1) return;

			e.preventDefault();
			e.stopPropagation();

			// Navigate to next/previous button
			if (e.key === "ArrowDown") {
				// Move to next button, but don't go past the last one
				if (currentIndex < buttons.length - 1) {
					buttons[currentIndex + 1].focus();
				}
			} else if (e.key === "ArrowUp") {
				// Move to previous button, but don't go past the first one
				if (currentIndex > 0) {
					buttons[currentIndex - 1].focus();
				}
			}
		};

		// Use capture phase to intercept before global handlers
		window.addEventListener("keydown", handleKeyDown, true);

		return () => {
			window.removeEventListener("keydown", handleKeyDown, true);
		};
	}, [selector]);

	return containerRef;
}
