"use client";

import { CSSProperties } from "react";
import { glassStyles, combineGlassStyles, topEdgeHighlight } from "../../styles";

interface GlassCardBackgroundProps {
	borderRadius: number;
}

/**
 * GlassCardBackground - The glassmorphism background layer
 * Follows Single Responsibility Principle - only renders the glass background
 * Follows Open/Closed Principle - styles come from configuration
 */
export function GlassCardBackground({ borderRadius }: GlassCardBackgroundProps) {
	const backgroundStyle: CSSProperties = {
		position: "absolute",
		inset: 0,
		borderRadius,
		...combineGlassStyles(
			glassStyles.background.default,
			glassStyles.backdrop.blur,
			glassStyles.border.default,
			glassStyles.shadow.card
		),
		zIndex: 0,
		pointerEvents: "none",
		overflow: "hidden",
	};

	const highlightStyle: CSSProperties = {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 1,
		...topEdgeHighlight,
		zIndex: 2,
	};

	return (
		<div className="glass-card-bg" aria-hidden="true" style={backgroundStyle}>
			{/* Top edge highlight */}
			<div aria-hidden="true" style={highlightStyle} />
		</div>
	);
}
