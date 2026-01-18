/**
 * Easing functions for animations
 * Pure functions - no side effects, fully reusable
 */

export const easings = {
	/** Cubic ease-out for natural entry motion */
	easeOutCubic: (t: number) => 1 - Math.pow(1 - t, 3),
	/** Cubic ease-in for natural exit motion */
	easeInCubic: (t: number) => t * t * t,
	/** Linear (no easing) */
	linear: (t: number) => t,
} as const;

export type EasingFunction = (t: number) => number;
