"use client";

import { CSSProperties } from "react";
import { glassStyles, combineGlassStyles } from "../../styles";
import { SliderConfig } from "../../types";

interface SliderHandleProps {
	config: SliderConfig;
	position: number;
	isDragging: boolean;
	isHovering: boolean;
	onMouseDown: (e: React.MouseEvent) => void;
	onTouchStart: (e: React.TouchEvent) => void;
	onTouchMove: (e: React.TouchEvent) => void;
	onTouchEnd: (e: React.TouchEvent) => void;
	onMouseEnter?: () => void;
	onMouseLeave?: () => void;
}

/**
 * SliderHandle - The draggable handle component
 * Follows Single Responsibility Principle - only renders the handle
 */
export function SliderHandle({
	config,
	position,
	isDragging,
	isHovering,
	onMouseDown,
	onTouchStart,
	onTouchMove,
	onTouchEnd,
	onMouseEnter,
	onMouseLeave,
}: SliderHandleProps) {
	const borderRadius = config.handleHeight / 2;
	const handleLeft = `calc(${config.padding}px + ${position} * (100% - ${config.handleWidth}px - ${config.padding * 2}px))`;
	const arrowRotation = -(position * 180);

	const handleStyle: CSSProperties = {
		position: "absolute",
		top: "50%",
		left: handleLeft,
		transform: isDragging
			? "translateY(-50%) translateZ(50px) scale(1.05)"
			: "translateY(-50%) scale(1)",
		width: config.handleWidth,
		height: config.handleHeight,
		borderRadius: `${borderRadius}px`,
		...combineGlassStyles(
			isHovering || isDragging ? glassStyles.background.hover : glassStyles.background.subtle,
			isHovering || isDragging ? glassStyles.border.hover : glassStyles.border.subtle,
			isDragging ? glassStyles.shadow.handleDragging : glassStyles.shadow.handle
		),
		backdropFilter: "blur(12px)",
		WebkitBackdropFilter: "blur(12px)",
		cursor: isDragging ? "grabbing" : "grab",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		transition: "transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
		willChange: "left, transform",
		transformStyle: "preserve-3d",
	};

	return (
		<div
			onMouseDown={onMouseDown}
			onTouchStart={onTouchStart}
			onTouchMove={onTouchMove}
			onTouchEnd={onTouchEnd}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			style={handleStyle}
		>
			{/* Arrow icon */}
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke={isHovering || isDragging ? "var(--color-maroon, #4E0506)" : "var(--color-white, #ffffff)"}
				strokeWidth="2.5"
				strokeLinecap="round"
				strokeLinejoin="round"
				style={{
					transform: `rotate(${arrowRotation}deg)`,
					transition: isDragging
						? "none"
						: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.25s ease",
				}}
			>
				<path d="M9 18l6-6-6-6" />
			</svg>
		</div>
	);
}
