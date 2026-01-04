// =============================================================================
// Orb Types - Type definitions for the orb system
// =============================================================================

/**
 * Represents an individual orb in the simulation.
 *
 * Orbs have pixel-perfect positioning and velocity for smooth movement,
 * with additional metadata for layer, size, and direction tracking.
 */
export interface Orb {
	/** Unique identifier for the orb. */
	id: string;

	/** Pixel X position relative to the viewport origin. */
	pxX: number;

	/** Pixel Y position relative to the viewport origin. */
	pxY: number;

	/** X velocity component in pixels per second. */
	vx: number;

	/** Y velocity component in pixels per second. */
	vy: number;

	/** Speed magnitude in pixels per second. */
	speed: number;

	/** Direction of travel in radians. */
	angle: number;

	/** Depth layer index (Z-axis). */
	layer: number;

	/** Orb diameter in grid cells. */
	size: number;
}
