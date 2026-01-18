"use client";

import { useRef, useEffect, RefObject } from "react";

/**
 * Hook for keyboard navigation within card button lists.
 * Handles ArrowUp/ArrowDown navigation between glass-button-link elements.
 * 
 * @returns A ref to attach to the container element containing the buttons
 */
export function useCardKeyboardNavigation(): RefObject<HTMLDivElement | null> {
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

			// Get all buttons within this card
			const buttons = Array.from(container.querySelectorAll<HTMLAnchorElement>('.glass-button-link'));
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
	}, []);

	return containerRef;
}
