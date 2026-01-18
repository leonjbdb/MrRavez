"use client";

import { RefObject, useCallback } from "react";

export interface MouseProximityResult {
	/** Influence factor from 0 (far away) to 1 (directly over) */
	influence: number;
	/** Whether mouse is directly over the element */
	isDirectlyOver: boolean;
}

export interface UseMouseProximityOptions {
	/** Reference to the element to check proximity against */
	elementRef: RefObject<HTMLElement | null>;
	/** Unique ID for element detection in overlapping scenarios */
	elementId: string;
	/** Pixels beyond element bounds to detect proximity (default: 150) */
	proximityZone?: number;
	/** Minimum opacity to consider element visible (default: 0.1) */
	minOpacity?: number;
}

/**
 * Hook for calculating mouse proximity to an element
 * Extracted from useCardTilt to follow Single Responsibility Principle
 * 
 * Handles:
 * - Distance calculation to element bounds
 * - Direct overlap detection with z-index consideration
 * - Visibility checks (opacity, visibility)
 * - Proximity zone influence with easing
 */
export function useMouseProximity(options: UseMouseProximityOptions) {
	const {
		elementRef,
		elementId,
		proximityZone = 150,
		minOpacity = 0.1,
	} = options;

	/**
	 * Check if an element is inside this card using data attribute
	 */
	const isElementInside = useCallback((element: Element | null): boolean => {
		let current: Element | null = element;
		while (current) {
			if (current.getAttribute('data-glass-card-id') === elementId) {
				return true;
			}
			current = current.parentElement;
		}
		return false;
	}, [elementId]);

	/**
	 * Get mouse influence based on proximity
	 * Returns influence (0-1) and whether mouse is directly over
	 */
	const getMouseInfluence = useCallback((clientX: number, clientY: number): MouseProximityResult => {
		const element = elementRef.current;
		if (!element) {
			return { influence: 0, isDirectlyOver: false };
		}

		// Check visibility - skip hidden elements
		const computedStyle = window.getComputedStyle(element);
		const elementOpacity = parseFloat(computedStyle.opacity);
		if (elementOpacity < minOpacity || computedStyle.visibility === 'hidden') {
			return { influence: 0, isDirectlyOver: false };
		}

		const rect = element.getBoundingClientRect();

		// Check if directly over the element
		const isDirectlyOver = clientX >= rect.left && clientX <= rect.right &&
			clientY >= rect.top && clientY <= rect.bottom;

		if (isDirectlyOver) {
			// Verify with element check for overlapping cards
			const elementAtPoint = document.elementFromPoint(clientX, clientY);
			if (elementAtPoint && isElementInside(elementAtPoint)) {
				return { influence: 1, isDirectlyOver: true };
			}
			// Fallback for edge cases
			if (elementOpacity >= 0.5) {
				return { influence: 1, isDirectlyOver: true };
			}
		}

		// Calculate distance to element edge
		const distanceX = clientX < rect.left ? rect.left - clientX :
			clientX > rect.right ? clientX - rect.right : 0;
		const distanceY = clientY < rect.top ? rect.top - clientY :
			clientY > rect.bottom ? clientY - rect.bottom : 0;
		const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

		// If within proximity zone, return scaled influence (1 at edge, 0 at zone boundary)
		if (distance < proximityZone) {
			const influence = 1 - (distance / proximityZone);
			// Apply quadratic easing for more natural falloff
			return { influence: influence * influence, isDirectlyOver: false };
		}

		return { influence: 0, isDirectlyOver: false };
	}, [elementRef, isElementInside, proximityZone, minOpacity]);

	return {
		getMouseInfluence,
		isElementInside,
	};
}
