// =============================================================================
// Grid Types - Type definitions for the spatial grid system
// =============================================================================

/**
 * Configuration for the 3D spatial grid geometry.
 * Contains both world-space measurements (centimeters) and grid dimensions.
 */
export interface GridConfig {
	/** Total number of cells along the X-axis. */
	cellsX: number;
	/** Total number of cells along the Y-axis. */
	cellsY: number;
	/** Number of depth layers (Z-axis). */
	layers: number;
	/** Width of a single cell in centimeters. */
	cellSizeXCm: number;
	/** Height of a single cell in centimeters. */
	cellSizeYCm: number;

	// Grid Bounds (World Coordinates in cm)
	/** Minimum X coordinate of the grid in centimeters. */
	minXCm: number;
	/** Minimum Y coordinate of the grid in centimeters. */
	minYCm: number;

	// Viewport Bounds (Screen Area in cm)
	/** Minimum X coordinate of the visible viewport in centimeters. */
	viewportMinXCm: number;
	/** Maximum X coordinate of the visible viewport in centimeters. */
	viewportMaxXCm: number;
	/** Minimum Y coordinate of the visible viewport in centimeters. */
	viewportMinYCm: number;
	/** Maximum Y coordinate of the visible viewport in centimeters. */
	viewportMaxYCm: number;

	// Conversion Factors
	/** Number of pixels per centimeter (for cm to px conversion). */
	pixelsPerCm: number;
	/** Number of centimeters per pixel (for px to cm conversion). */
	cmPerPixel: number;
}

/**
 * Viewport cell metrics for efficient rendering and coordinate conversion.
 * Pre-calculated values for the visible portion of the grid.
 */
export interface ViewportCells {
	/** Grid X-index of the first visible cell. */
	startCellX: number;
	/** Grid X-index of the last visible cell. */
	endCellX: number;
	/** Grid Y-index of the first visible cell. */
	startCellY: number;
	/** Grid Y-index of the last visible cell. */
	endCellY: number;
	/** Width of a cell in pixels. */
	cellSizeXPx: number;
	/** Height of a cell in pixels. */
	cellSizeYPx: number;
	/** Inverse of cell width in pixels (1/cellSizeXPx) for optimized division. */
	invCellSizeXPx: number;
	/** Inverse of cell height in pixels (1/cellSizeYPx) for optimized division. */
	invCellSizeYPx: number;
	/** Width of a cell in centimeters. */
	cellSizeXCm: number;
	/** Height of a cell in centimeters. */
	cellSizeYCm: number;
}
