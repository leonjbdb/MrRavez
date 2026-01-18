/**
 * Mathematical utility functions
 * Pure functions - no side effects, fully reusable
 */

/**
 * Clamp a value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between current and target
 */
export function lerp(current: number, target: number, factor: number): number {
	return current + (target - current) * factor;
}
