"use client";

import { ForwardedRef, forwardRef, CSSProperties } from "react";
import { glassStyles, combineGlassStyles, topEdgeHighlight } from "../../styles";
import { SliderConfig } from "../../types";

interface SliderTrackProps {
	config: SliderConfig;
	isDragging?: boolean;
	onTouchStart?: (e: React.TouchEvent) => void;
	onTouchMove?: (e: React.TouchEvent) => void;
	onTouchEnd?: (e: React.TouchEvent) => void;
	children: React.ReactNode;
}

/**
 * SliderTrack - The glass track container for the slider
 * Follows Single Responsibility Principle - only renders the track
 */
export const SliderTrack = forwardRef<HTMLDivElement, SliderTrackProps>(
	function SliderTrack(
		{ config, isDragging, onTouchStart, onTouchMove, onTouchEnd, children },
		ref: ForwardedRef<HTMLDivElement>
	) {
		const borderRadius = config.trackHeight / 2;

		const trackStyle: CSSProperties = {
			position: "relative",
			width: `${config.trackWidth}px`,
			height: `${config.trackHeight}px`,
			borderRadius: `${borderRadius}px`,
			...combineGlassStyles(
				glassStyles.background.default,
				glassStyles.backdrop.blur,
				glassStyles.border.default,
				glassStyles.shadow.card
			),
			cursor: isDragging ? "grabbing" : "default",
			userSelect: "none",
			WebkitUserSelect: "none",
			touchAction: "none",
			perspective: "1200px",
			transformStyle: "preserve-3d",
		};

		const highlightStyle: CSSProperties = {
			position: "absolute",
			top: 0,
			left: "8%",
			right: "8%",
			height: 1,
			...topEdgeHighlight,
			borderRadius: 14,
			pointerEvents: "none",
		};

		return (
			<div
				ref={ref}
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
				style={trackStyle}
			>
				{/* Top edge highlight */}
				<div style={highlightStyle} />
				{children}
			</div>
		);
	}
);
