// =============================================================================
// CollisionSystem - Collision Detection and Resolution
// =============================================================================

import { CELL_EMPTY } from '../shared/types';
import { SpatialGrid } from '../grid/core/SpatialGrid';
import { type ViewportCells } from '../grid/types';
import { type Orb } from '../orb/types';

/**
 * Result of a collision check containing blocking status and reflection axes.
 */
export interface CollisionResult {
	/** Whether any collision was detected. */
	blocked: boolean;
	/** Whether to reflect velocity on the X-axis. */
	reflectX: boolean;
	/** Whether to reflect velocity on the Y-axis. */
	reflectY: boolean;
}

/**
 * Collision detection and resolution system.
 *
 * Single Responsibility: All collision logic in one place.
 * Separates concerns from physics (movement) and grid (storage).
 */
export class CollisionSystem {
	/**
	 * Checks if a move would result in collision and returns resolution.
	 *
	 * Performs axis-independent collision detection for proper corner handling.
	 * Tests X-axis, Y-axis, and diagonal movement separately.
	 * For multi-cell orbs (size > 1), checks the circular footprint.
	 *
	 * @param orb - The orb attempting to move.
	 * @param deltaTime - Time elapsed since last frame in seconds.
	 * @param grid - The spatial grid instance for collision queries.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 * @returns CollisionResult with blocking status and reflection axes.
	 */
	static checkMove(
		orb: Orb,
		deltaTime: number,
		grid: SpatialGrid,
		vpc: ViewportCells
	): CollisionResult {
		const nextX = orb.pxX + orb.vx * deltaTime;
		const nextY = orb.pxY + orb.vy * deltaTime;

		const currCellX = ((orb.pxX * vpc.invCellSizeXPx) | 0) + vpc.startCellX;
		const currCellY = ((orb.pxY * vpc.invCellSizeYPx) | 0) + vpc.startCellY;
		const nextCellX = ((nextX * vpc.invCellSizeXPx) | 0) + vpc.startCellX;
		const nextCellY = ((nextY * vpc.invCellSizeYPx) | 0) + vpc.startCellY;

		// For size 1 orbs, use simple single-cell collision
		if (orb.size === 1) {
			const blockedX = grid.isBlocking(nextCellX, currCellY, orb.layer);
			const blockedY = grid.isBlocking(currCellX, nextCellY, orb.layer);
			const blockedDiag = grid.isBlocking(nextCellX, nextCellY, orb.layer);

			return {
				blocked: blockedX || blockedY || blockedDiag,
				reflectX: blockedX || (blockedDiag && nextCellX !== currCellX),
				reflectY: blockedY || (blockedDiag && nextCellY !== currCellY),
			};
		}

		// For multi-cell orbs, check circular footprint
		// Radius is size - 1, ensuring each size is distinct
		const radius = orb.size - 1;
		let blockedX = false;
		let blockedY = false;

		// Check cells in circular footprint at next position
		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				if (dx * dx + dy * dy <= radius * radius) {
					// Check X-axis movement
					if (grid.isBlocking(nextCellX + dx, currCellY + dy, orb.layer)) {
						blockedX = true;
					}
					// Check Y-axis movement
					if (grid.isBlocking(currCellX + dx, nextCellY + dy, orb.layer)) {
						blockedY = true;
					}
				}
			}
		}

		return {
			blocked: blockedX || blockedY,
			reflectX: blockedX,
			reflectY: blockedY,
		};
	}

	/**
	 * Validates if spawning at a position is allowed.
	 *
	 * Prevents spawning in occupied cells or on border walls.
	 * For multi-cell orbs (size > 1), checks the entire circular footprint.
	 *
	 * @param pxX - Pixel X position where spawn is attempted.
	 * @param pxY - Pixel Y position where spawn is attempted.
	 * @param layer - Z-layer for the spawn.
	 * @param size - Size of the orb in grid cells.
	 * @param grid - The spatial grid instance for occupancy queries.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 * @returns True if spawning is allowed, false if blocked.
	 */
	static canSpawn(
		pxX: number,
		pxY: number,
		layer: number,
		size: number,
		grid: SpatialGrid,
		vpc: ViewportCells
	): boolean {
		const centerCellX = ((pxX * vpc.invCellSizeXPx) | 0) + vpc.startCellX;
		const centerCellY = ((pxY * vpc.invCellSizeYPx) | 0) + vpc.startCellY;

		// For size 1 orbs, check single cell
		if (size === 1) {
			return grid.getCell(centerCellX, centerCellY, layer) === CELL_EMPTY;
		}

		// For multi-cell orbs, check circular footprint
		// Radius is size - 1, ensuring each size is distinct
		const radius = size - 1;

		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				if (dx * dx + dy * dy <= radius * radius) {
					if (grid.getCell(centerCellX + dx, centerCellY + dy, layer) !== CELL_EMPTY) {
						return false;
					}
				}
			}
		}

		return true;
	}

	/**
	 * Applies collision response to orb velocity.
	 *
	 * Reflects velocity components on specified axes.
	 * Call this after detecting a collision via checkMove().
	 *
	 * @param orb - The orb to update.
	 * @param reflectX - Whether to reflect X-axis velocity.
	 * @param reflectY - Whether to reflect Y-axis velocity.
	 */
	static applyReflection(
		orb: Orb,
		reflectX: boolean,
		reflectY: boolean
	): void {
		if (reflectX) orb.vx = -orb.vx;
		if (reflectY) orb.vy = -orb.vy;
	}
}
