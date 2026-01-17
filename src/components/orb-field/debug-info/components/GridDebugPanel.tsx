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
	const glassStyles: React.CSSProperties = {
		background: "rgba(255, 255, 255, 0.08)",
		backdropFilter: "blur(24px) saturate(120%)",
		WebkitBackdropFilter: "blur(24px) saturate(120%)",
		border: "1px solid rgba(255, 255, 255, 0.15)",
		boxShadow: `
			0 25px 50px rgba(0, 0, 0, 0.25),
			0 10px 20px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1)
		`,
	};

	return (
		<div
			style={{
				...glassStyles,
				padding: 12,
				borderRadius: 12,
				color: 'rgba(255, 255, 255, 0.9)',
				fontFamily: 'var(--font-mono), monospace',
				fontSize: 11,
				minWidth: 160,
			}}
		>
			<div
				style={{
					fontWeight: 600,
					fontSize: 12,
					color: 'rgba(255, 255, 255, 0.9)',
					borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
					paddingBottom: 8,
					marginBottom: 8,
				}}
			>
				Grid Stats
			</div>

			<div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
				<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Grid:</span>
				<span>{gridConfig.cellsX}×{gridConfig.cellsY}×{gridConfig.layers}</span>
			</div>

			<div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
				<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cell:</span>
				<span>{viewportCells.cellSizeXCm.toFixed(2)}×{viewportCells.cellSizeYCm.toFixed(2)}cm</span>
			</div>

			<div style={{ marginBottom: 8 }}>
				<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Z:</span>
					<input
						type="range"
						min={0}
						max={gridConfig.layers - 1}
						value={currentLayer}
						onChange={(e) => onLayerChange(parseInt(e.target.value))}
						style={{ 
							flex: 1,
							cursor: 'pointer',
							accentColor: 'rgba(78, 5, 6, 0.8)',
						}}
					/>
					<span style={{ minWidth: 16, textAlign: 'right' }}>{currentLayer}</span>
				</label>
			</div>

			{hoveredCell && (
				<div
					style={{
						color: 'rgba(136, 255, 136, 0.9)',
						fontSize: 10,
						borderTop: '1px solid rgba(255, 255, 255, 0.1)',
						paddingTop: 8,
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
