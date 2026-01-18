"use client";

import { SectionHeader } from "./SectionHeader";
import { debugMenuConfig } from "../config/debugMenuConfig";
import type { GridDebugProps } from "../types";

/**
 * GridDebugSection - Displays grid debugging controls
 * Follows Single Responsibility Principle - only handles grid debug UI
 */
export function GridDebugSection({
	gridConfig,
	viewportCells,
	currentLayer = 0,
	onLayerChange,
	hoveredCell,
}: GridDebugProps) {
	if (!gridConfig || !viewportCells) return null;

	return (
		<>
			<SectionHeader title="Grid Stats" />

			<div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
				<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Grid:</span>
				<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
					{gridConfig.cellsX}×{gridConfig.cellsY}×{gridConfig.layers}
				</span>
			</div>

			<div style={{ marginBottom: 6, display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
				<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Cell:</span>
				<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
					{viewportCells.cellSizeXCm.toFixed(2)}×{viewportCells.cellSizeYCm.toFixed(2)}cm
				</span>
			</div>

			<div style={{ marginBottom: 8, fontSize: 11 }}>
				<label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
					<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Z:</span>
					<input
						type="range"
						min={0}
						max={gridConfig.layers - 1}
						value={currentLayer}
						onChange={(e) => onLayerChange?.(parseInt(e.target.value))}
						style={{
							flex: 1,
							cursor: 'pointer',
							accentColor: debugMenuConfig.colors.maroonAccent,
						}}
					/>
					<span style={{ minWidth: 16, textAlign: 'right', color: 'rgba(255, 255, 255, 0.9)' }}>
						{currentLayer}
					</span>
				</label>
			</div>

			{hoveredCell && (
				<div style={{ color: 'rgba(136, 255, 136, 0.9)', fontSize: 10, paddingTop: 8, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
					Cell ({hoveredCell.x}, {hoveredCell.y})
					<br />
					{hoveredCell.worldX.toFixed(1)}cm, {hoveredCell.worldY.toFixed(1)}cm
				</div>
			)}
		</>
	);
}
