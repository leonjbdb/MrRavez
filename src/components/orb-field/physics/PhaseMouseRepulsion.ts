// =============================================================================
// PhaseMouseRepulsion - Phase 2: Apply mouse repulsion to orbs
// =============================================================================

import { type Orb } from '../orb/types';
import { MouseRepulsion } from '../collision';

/**
 * Phase 2: Apply mouse repulsion.
 * 
 * Single Responsibility: Mouse repulsion force application only.
 */
export class PhaseMouseRepulsion {
	/**
	 * Applies mouse repulsion to all orbs.
	 * 
	 * The mouse position is in screen coordinates, but orbs are in physics space.
	 * When parallax scrolling is active, we need to adjust the mouse position
	 * to match the physics coordinate space by subtracting the scroll offset.
	 * 
	 * @param orbs - Array of orbs to update.
	 * @param mousePos - Current mouse position in screen coordinates (or null).
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 * @param disableAvoidance - Whether avoidance is disabled.
	 * @param scrollOffset - Current parallax scroll offset for coordinate adjustment.
	 */
	static execute(
		orbs: Orb[],
		mousePos: { x: number; y: number } | null,
		deltaTime: number,
		disableAvoidance: boolean,
		scrollOffset: { x: number; y: number } = { x: 0, y: 0 }
	): void {
		if (!disableAvoidance && mousePos) {
			// Convert mouse position from screen space to physics space
			// by subtracting the parallax offset that shifts rendered orbs
			const adjustedMouseX = mousePos.x - scrollOffset.x;
			const adjustedMouseY = mousePos.y - scrollOffset.y;
			MouseRepulsion.applyRepulsion(orbs, adjustedMouseX, adjustedMouseY, deltaTime);
		}
	}
}
