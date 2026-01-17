// =============================================================================
// ViewportCellsFactory - Calculates viewport cell metrics from GridConfig
// =============================================================================

import { type GridConfig, type ViewportCells } from '../types';

/**
 * Factory responsible for calculating viewport cell metrics.
 * Converts world-space grid configuration into screen-space cell boundaries.
 */
export class ViewportCellsFactory {
	/**
	 * Creates a ViewportCells object from a GridConfig.
	 * Calculates which grid cells are visible in the current viewport
	 * and provides pixel-to-cell conversion factors.
	 *
	 * @param config - The GridConfig containing world-space dimensions.
	 * @returns A ViewportCells object with screen-space metrics.
	 */
	static create(config: GridConfig): ViewportCells {
		const {
			cellSizeXCm,
			cellSizeYCm,
			viewportMinXCm,
			viewportMaxXCm,
			viewportMinYCm,
			viewportMaxYCm,
			minXCm,
			minYCm,
			pixelsPerCm
		} = config;

		const cellSizeXPx = cellSizeXCm * pixelsPerCm;
		const cellSizeYPx = cellSizeYCm * pixelsPerCm;

		return {
			startCellX: Math.round((viewportMinXCm - minXCm) / cellSizeXCm),
			endCellX: Math.round((viewportMaxXCm - minXCm) / cellSizeXCm),
			startCellY: Math.round((viewportMinYCm - minYCm) / cellSizeYCm),
			endCellY: Math.round((viewportMaxYCm - minYCm) / cellSizeYCm),
			cellSizeXPx,
			cellSizeYPx,
			invCellSizeXPx: 1 / cellSizeXPx,
			invCellSizeYPx: 1 / cellSizeYPx,
			cellSizeXCm,
			cellSizeYCm,
		};
	}
}

