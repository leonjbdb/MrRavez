"use client";

// =============================================================================
// GridDebugPanel - Debug UI for Grid System Information
// =============================================================================

import { type GridConfig, type ViewportCells } from '../../grid/types';

/**
 * Props for the GridDebugPanel component.
 */
interface GridDebugPanelProps {
	/** Current grid configuration. */
	gridConfig: GridConfig;
	/** Current viewport cell metrics. */
	viewportCells: ViewportCells;
	/** Currently active depth layer. */
	currentLayer: number;
	/** Callback when the depth layer slider changes. */
	onLayerChange: (layer: number) => void;
	/** Currently hovered cell information, or null. */
	hoveredCell: { x: number; y: number; worldX: number; worldY: number } | null;
}

/**
 * Debug panel displaying grid system statistics.
 *
 * Shows:
 * - Grid dimensions (cells × cells × layers)
 * - Cell size in centimeters
 * - Depth layer slider
 * - Currently hovered cell coordinates
 *
 * Only visible when debug mode is enabled.
 */
export function GridDebugPanel({
	gridConfig,
	viewportCells,
	currentLayer,
	onLayerChange,
	hoveredCell,
}: GridDebugPanelProps) {
	return (
		<div
			style={{
				padding: 12,
				background: 'rgba(0, 0, 0, 0.7)',
				border: '1px solid #333',
				borderRadius: 6,
				color: 'white',
				fontFamily: 'monospace',
				fontSize: 11,
				backdropFilter: 'blur(4px)',
				minWidth: 160,
			}}
		>
			<div
				style={{
					fontWeight: 'bold',
					borderBottom: '1px solid #444',
					paddingBottom: 4,
					marginBottom: 4,
				}}
			>
				Grid Stats
			</div>

			<div style={{ marginBottom: 4 }}>
				<strong>Grid:</strong> {gridConfig.cellsX}×{gridConfig.cellsY}×{gridConfig.layers}
			</div>

			<div style={{ marginBottom: 4 }}>
				<strong>Cell:</strong> {viewportCells.cellSizeXCm.toFixed(2)}×{viewportCells.cellSizeYCm.toFixed(2)}cm
			</div>

			<div style={{ marginBottom: 6 }}>
				<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<strong>Z:</strong>
					<input
						type="range"
						min={0}
						max={gridConfig.layers - 1}
						value={currentLayer}
						onChange={(e) => onLayerChange(parseInt(e.target.value))}
						style={{ width: 60 }}
					/>
					<span>{currentLayer}</span>
				</label>
			</div>

			{hoveredCell && (
				<div
					style={{
						color: '#8f8',
						fontSize: 10,
						borderTop: '1px solid #333',
						paddingTop: 4,
					}}
				>
					Cell ({hoveredCell.x}, {hoveredCell.y})
					<br />
					{hoveredCell.worldX.toFixed(1)}cm, {hoveredCell.worldY.toFixed(1)}cm
				</div>
			)}
		</div>
	);
}
