"use client";

import type { SectionHeaderProps } from "../types";

/**
 * SectionHeader - A section header with optional icon
 * Follows Single Responsibility Principle - only handles section header UI
 */
export function SectionHeader({ title, icon }: SectionHeaderProps) {
	return (
		<div style={{
			marginBottom: "8px",
			paddingBottom: "8px",
			borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
			marginTop: "16px",
		}}>
			<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
				{icon}
				<span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>
					{title}
				</span>
			</div>
		</div>
	);
}
