"use client";

import { useState } from "react";
import { DEFAULT_ORB_SPAWN_CONFIG } from "@/components/orb-field/orb/config";
import { debugMenuConfig } from "../config/debugMenuConfig";
import { SectionHeader } from "./SectionHeader";
import type { OrbDebugProps } from "../types";

/**
 * OrbDebugSection - Displays orb debugging controls
 * Follows Single Responsibility Principle - only handles orb debug UI
 */
export function OrbDebugSection({
	orbs = [],
	targetOrbCount,
	selectedOrbId,
	selectedOrb: selectedOrbProp,
	orbSize = DEFAULT_ORB_SPAWN_CONFIG.defaultSize,
	onSelectOrb,
	onDeleteOrb,
	onSizeChange,
}: OrbDebugProps) {
	const { minSize, maxSize } = DEFAULT_ORB_SPAWN_CONFIG;

	// Track when the orb selector dropdown is open
	// When open, we freeze the orbs list to prevent it from updating and making selection impossible
	const [isOrbSelectorOpen, setIsOrbSelectorOpen] = useState(false);
	const [frozenOrbs, setFrozenOrbs] = useState(orbs);

	// Use frozen orbs list when dropdown is open, otherwise use real-time orbs
	const displayOrbs = isOrbSelectorOpen ? frozenOrbs : orbs;

	// Use real-time prop if available, otherwise find in list
	const selectedOrb = selectedOrbProp || orbs.find((o) => o.id === selectedOrbId);

	if (orbs.length === 0) return null;

	return (
		<>
			<SectionHeader title={`Orb Debug (${orbs.length}${targetOrbCount ? ` / ${targetOrbCount}` : ''})`} />

			{/* Orb Selector */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
				<label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11 }}>
					<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Select:</span>
					<select
						value={selectedOrbId || ''}
						onChange={(e) => {
							onSelectOrb?.(e.target.value || null);
							setIsOrbSelectorOpen(false);
						}}
						onFocus={() => {
							// Freeze the orb list when dropdown opens
							setFrozenOrbs([...orbs]);
							setIsOrbSelectorOpen(true);
						}}
						onBlur={() => {
							// Unfreeze when dropdown closes
							setIsOrbSelectorOpen(false);
						}}
						style={{
							background: 'rgba(255, 255, 255, 0.1)',
							color: 'rgba(255, 255, 255, 0.9)',
							border: '1px solid rgba(255, 255, 255, 0.15)',
							borderRadius: 6,
							fontSize: 10,
							padding: '4px 6px',
							maxWidth: 120,
							cursor: 'pointer',
						}}
					>
						<option value="">None</option>
						{displayOrbs.map((orb, i) => (
							<option key={orb.id} value={orb.id}>
								Orb {i + 1} ({orb.size})
							</option>
						))}
					</select>
				</label>
			</div>

			{/* Selected Orb Info */}
			{selectedOrb && (
				<div style={{ fontSize: 10, color: 'rgba(255, 255, 255, 0.6)', padding: '8px 0', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
					Pos: {selectedOrb.pxX.toFixed(0)}, {selectedOrb.pxY.toFixed(0)}, z={selectedOrb.z.toFixed(1)}
					<br />
					Size: {selectedOrb.size} | Speed: {selectedOrb.speed.toFixed(1)} px/s
					<br />
					Vel: vx={selectedOrb.vx.toFixed(1)}, vy={selectedOrb.vy.toFixed(1)}, vz={selectedOrb.vz.toFixed(2)}
				</div>
			)}

			{/* Delete Button */}
			<div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
				<button
					onClick={() => selectedOrbId && onDeleteOrb?.(selectedOrbId)}
					style={{
						flex: 1,
						background: debugMenuConfig.colors.maroonButton,
						color: 'rgba(255, 255, 255, 0.9)',
						border: '1px solid rgba(255, 255, 255, 0.15)',
						borderRadius: 6,
						padding: '6px 4px',
						fontSize: 10,
						cursor: selectedOrbId ? 'pointer' : 'not-allowed',
						opacity: selectedOrbId ? 1 : 0.5,
					}}
					disabled={!selectedOrbId}
				>
					Delete Selected
				</button>
			</div>

			{/* Brush Size Slider */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11 }}>
				<label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
					<span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Brush Size:</span>
					<span style={{ color: 'rgba(255, 255, 255, 0.9)' }}>{orbSize}</span>
				</label>
				<input
					type="range"
					min={minSize}
					max={maxSize}
					step={1}
					value={orbSize}
					onChange={(e) => onSizeChange?.(parseInt(e.target.value, 10))}
					style={{
						width: '100%',
						cursor: 'pointer',
						accentColor: debugMenuConfig.colors.maroonAccent,
					}}
				/>
			</div>

			<div style={{ fontSize: 9, color: 'rgba(255, 255, 255, 0.4)', fontStyle: 'italic', marginTop: 8 }}>
				* Tap grid to place orb
			</div>
		</>
	);
}
