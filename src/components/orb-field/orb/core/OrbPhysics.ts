// =============================================================================
// OrbPhysics - Geometry and Grid Interaction
// =============================================================================

import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { CELL_FILLED, CELL_EMPTY } from '../../shared/types';
import { type Orb } from '../types';

/**
 * Handles the physical representation and movement of orbs on the spatial grid.
 *
 * Single Responsibility: Translating orb state into grid modifications
 * and updating orb positions based on velocity.
 */
export class OrbPhysics {
	/**
	 * Updates an orb's position based on its velocity and delta time.
	 * Uses frame-rate independent calculation.
	 *
	 * @param orb - The orb to update.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 */
	static updatePosition(orb: Orb, deltaTime: number): void {
		orb.pxX += orb.vx * deltaTime;
		orb.pxY += orb.vy * deltaTime;
	}

	/**
	 * Synchronizes velocity components (vx, vy) from speed and angle.
	 * Call this after modifying an orb's speed or angle directly.
	 *
	 * @param orb - The orb to synchronize.
	 */
	static syncVelocity(orb: Orb): void {
		orb.vx = Math.cos(orb.angle) * orb.speed;
		orb.vy = Math.sin(orb.angle) * orb.speed;
	}

	/**
	 * Marks an orb's footprint on the spatial grid.
	 * Uses bitwise OR for efficient floor operation.
	 *
	 * @param grid - The spatial grid instance.
	 * @param orb - The orb to mark.
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param invCellSizeX - Inverse cell width for fast division.
	 * @param invCellSizeY - Inverse cell height for fast division.
	 */
	static markOrb(
		grid: SpatialGrid,
		orb: Orb,
		startCellX: number,
		startCellY: number,
		invCellSizeX: number,
		invCellSizeY: number
	): void {
		const cellX = ((orb.pxX * invCellSizeX) | 0) + startCellX;
		const cellY = ((orb.pxY * invCellSizeY) | 0) + startCellY;

		grid.setCell(cellX, cellY, orb.layer, CELL_FILLED);
	}

	/**
	 * Clears an orb's footprint from the spatial grid.
	 *
	 * @param grid - The spatial grid instance.
	 * @param orb - The orb to clear.
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param invCellSizeX - Inverse cell width for fast division.
	 * @param invCellSizeY - Inverse cell height for fast division.
	 */
	static clearOrb(
		grid: SpatialGrid,
		orb: Orb,
		startCellX: number,
		startCellY: number,
		invCellSizeX: number,
		invCellSizeY: number
	): void {
		const cellX = ((orb.pxX * invCellSizeX) | 0) + startCellX;
		const cellY = ((orb.pxY * invCellSizeY) | 0) + startCellY;

		grid.setCell(cellX, cellY, orb.layer, CELL_EMPTY);
	}
}
