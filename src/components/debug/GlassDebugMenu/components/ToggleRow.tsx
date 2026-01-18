"use client";

import { ToggleSlider } from "./ToggleSlider";
import type { ToggleRowProps } from "../types";

/**
 * ToggleRow - A row displaying a toggle option with label and description
 * Follows Single Responsibility Principle - only handles row layout
 */
export function ToggleRow({ item, checked, onToggle }: ToggleRowProps) {
	return (
		<div style={{
			display: "flex",
			alignItems: "center",
			justifyContent: "space-between",
			paddingTop: "8px",
			paddingBottom: "8px",
			gap: "12px",
		}}>
			<div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
				<span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255, 255, 255, 0.9)" }}>
					{item.label}
				</span>
				{item.description && (
					<span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{item.description}
					</span>
				)}
			</div>
			<ToggleSlider checked={checked} onToggle={onToggle} />
		</div>
	);
}
