// =============================================================================
// OrbPhysics - Geometry and Grid Interaction
// =============================================================================

import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { CELL_FILLED, CELL_EMPTY, CELL_PROXIMITY } from '../../shared/types';
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
	 * Marks cells in a circular pattern based on orb size.
	 * 
	 * For multi-cell orbs (size > 1), marks all cells within the circular
	 * radius. Uses efficient circle rasterization with pre-computed offsets.
	 * Also marks an avoidance zone (proximity field) around the orb.
	 * 
	 * Uses addCellFlag so proximity and filled can coexist in the same cell.
	 * 
	 * @param grid - The spatial grid instance.
	 * @param orb - The orb to mark.
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param invCellSizeX - Inverse cell width for fast division.
	 * @param invCellSizeY - Inverse cell height for fast division.
	 */
	static markOrbCircular(
		grid: SpatialGrid,
		orb: Orb,
		startCellX: number,
		startCellY: number,
		invCellSizeX: number,
		invCellSizeY: number
	): void {
		const centerCellX = ((orb.pxX * invCellSizeX) | 0) + startCellX;
		const centerCellY = ((orb.pxY * invCellSizeY) | 0) + startCellY;

		// Radius is size - 1, ensuring each size is distinct:
		// Size 1 → radius 0 (1 cell), Size 2 → radius 1 (5 cells), etc.
		const radius = orb.size - 1;

		// Avoidance zone scales with orb size but with diminishing returns
		// Uses square root for sublinear growth: sqrt(size) + 1
		// Size 1 → ~2 cells, Size 4 → ~3 cells, Size 9 → ~4 cells, Size 16 → ~5 cells
		const avoidanceRadius = Math.floor(Math.sqrt(orb.size) + radius + 1);

		// First pass: Mark avoidance zone (yellow cells)
		for (let dy = -avoidanceRadius; dy <= avoidanceRadius; dy++) {
			for (let dx = -avoidanceRadius; dx <= avoidanceRadius; dx++) {
				const distSq = dx * dx + dy * dy;
				// Mark cells in avoidance ring (beyond orb but within avoidance radius)
				if (distSq > radius * radius && distSq <= avoidanceRadius * avoidanceRadius) {
					grid.addCellFlag(centerCellX + dx, centerCellY + dy, orb.layer, CELL_PROXIMITY);
				}
			}
		}

		// Second pass: Mark orb cells (red cells)
		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				// Check if cell is within circular boundary
				if (dx * dx + dy * dy <= radius * radius) {
					grid.addCellFlag(centerCellX + dx, centerCellY + dy, orb.layer, CELL_FILLED);
				}
			}
		}
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

	/**
	 * Clears an orb's circular footprint from the spatial grid.
	 * 
	 * Mirrors the marking pattern of markOrbCircular().
	 * 
	 * @param grid - The spatial grid instance.
	 * @param orb - The orb to clear.
	 * @param startCellX - Viewport start cell X offset.
	 * @param startCellY - Viewport start cell Y offset.
	 * @param invCellSizeX - Inverse cell width for fast division.
	 * @param invCellSizeY - Inverse cell height for fast division.
	 */
	static clearOrbCircular(
		grid: SpatialGrid,
		orb: Orb,
		startCellX: number,
		startCellY: number,
		invCellSizeX: number,
		invCellSizeY: number
	): void {
		const centerCellX = ((orb.pxX * invCellSizeX) | 0) + startCellX;
		const centerCellY = ((orb.pxY * invCellSizeY) | 0) + startCellY;
		const radius = orb.size - 1;

		for (let dy = -radius; dy <= radius; dy++) {
			for (let dx = -radius; dx <= radius; dx++) {
				if (dx * dx + dy * dy <= radius * radius) {
					grid.setCell(centerCellX + dx, centerCellY + dy, orb.layer, CELL_EMPTY);
				}
			}
		}
	}
}
