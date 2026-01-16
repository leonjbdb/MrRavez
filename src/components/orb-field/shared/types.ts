// =============================================================================
// Shared Types - Common type definitions used across grid and orb systems
// =============================================================================

/**
 * Represents the occupancy state of a single grid cell.
 * Uses numeric values for efficient storage in Uint8Array.
 */
export type CellState = 0 | 1 | 2 | 3;

/** Cell is unoccupied and available. */
export const CELL_EMPTY = 0;

/** Cell is within the proximity field of an orb (soft repulsion zone). */
export const CELL_PROXIMITY = 1;

/** Cell is directly occupied by an orb (hard collision zone). */
export const CELL_FILLED = 2;

/** Cell is a permanent border wall that blocks movement. */
export const CELL_BORDER = 3;
