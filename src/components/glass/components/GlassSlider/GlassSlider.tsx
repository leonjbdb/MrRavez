"use client";

import { useRef } from "react";
import { useMobileViewport } from "@/hooks/device";
import { useInteraction3D, useDragInteraction } from "../../hooks/interaction";
import { useSpringAnimation } from "../../hooks/animation";
import { useDelayedVisibility } from "../../hooks/visibility";
import { useDebugMode } from "../../hooks/debug";
import { DEFAULT_SLIDER_CONFIG } from "../../types";
import type { SliderConfig } from "../../types";
import { SliderTrack } from "./SliderTrack";
import { SliderHandle } from "./SliderHandle";

interface GlassSliderProps {
	visible: boolean;
	opacity?: number;
	onSlideComplete?: (side: 'left' | 'right') => void;
	config?: Partial<SliderConfig>;
}

/**
 * GlassSlider - A glassmorphic slider for toggling debug mode
 * 
 * SOLID Refactoring:
 * - Single Responsibility: Only orchestrates slider UI
 * - Open/Closed: Configuration via props
 * - Dependency Inversion: Uses abstractions (hooks, storage)
 * - Extracted: Debug logic, drag handling, spring physics, sub-components
 */
export function GlassSlider({ opacity = 1, onSlideComplete, config: configOverride }: GlassSliderProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const isMobile = useMobileViewport(768);

	// Merge configuration with defaults
	const config = { ...DEFAULT_SLIDER_CONFIG, ...configOverride };

	// Debug mode abstraction
	const { isEnabled: isDebugMode, wasActiveThisSession, setEnabled: setDebugMode } = useDebugMode();

	// Handle hover state
	const { isActive: isHovering, interactionProps: handleInteractionProps } = useInteraction3D({
		trigger: 'hover',
	});

	// Spring animation for smooth snap
	const { position, setPosition, setVelocity, snapTo, cancelAnimation } = useSpringAnimation({
		onSettle: (target: number) => {
			const newDebugMode = target > 0.5;
			setDebugMode(newDebugMode);
			onSlideComplete?.(target < 0.5 ? 'left' : 'right');
		},
	});

	// Drag interaction
	const { isDragging, handleProps } = useDragInteraction({
		trackRef,
		handleWidth: config.handleWidth,
		trackPadding: config.padding,
		onDragStart: cancelAnimation,
		onDragMove: (pos) => {
			setVelocity((pos - position) * 60);
			setPosition(pos);
		},
		onDragEnd: (pos) => {
			const target = pos > 0.55 ? 1 : 0;
			snapTo(target);
		},
	});

	// Delayed visibility
	const skipDelay = isDebugMode || wasActiveThisSession;
	const { finalOpacity, hasAppeared } = useDelayedVisibility({
		opacity,
		initialDelayMs: 10000,
		skipDelay,
	});

	// Keep slider visible if debug mode is/was active
	const keepVisible = isDebugMode || wasActiveThisSession;
	const computedOpacity = keepVisible ? 1 : finalOpacity;
	const computedVisibility = keepVisible
		? "visible"
		: ((hasAppeared && opacity > 0.01) || opacity > 0.5 ? "visible" : "hidden");

	return (
		<div
			onTouchStart={(e) => e.stopPropagation()}
			onTouchMove={(e) => e.stopPropagation()}
			onTouchEnd={(e) => e.stopPropagation()}
			style={{
				position: "fixed",
				bottom: isMobile ? 32 : 48,
				left: "50%",
				transform: "translateX(-50%)",
				opacity: computedOpacity,
				visibility: computedVisibility,
				transition: keepVisible ? "none" : "opacity 0.3s ease, visibility 0.3s",
				willChange: "opacity",
				zIndex: 9999,
			}}
		>
			<SliderTrack
				ref={trackRef}
				config={config}
				isDragging={isDragging}
				{...handleProps}
			>
				<SliderHandle
					config={config}
					position={position}
					isDragging={isDragging}
					isHovering={isHovering}
					{...handleProps}
					{...handleInteractionProps}
				/>
			</SliderTrack>
		</div>
	);
}
