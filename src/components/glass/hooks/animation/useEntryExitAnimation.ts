"use client";

import { useMemo } from "react";
import { easings } from "./easings";

export interface EntryAnimationConfig {
	/** Starting scale (default: 0.8) */
	startScale?: number;
	/** Starting Y translation in px (default: 150) */
	startTranslateY?: number;
	/** Starting X rotation in degrees (default: -12) */
	startRotateX?: number;
}

export interface ExitAnimationConfig {
	/** Scale reduction at full exit (default: 0.12) */
	scaleReduction?: number;
	/** Y translation at full exit in px (default: -100) */
	translateY?: number;
	/** X rotation at full exit in degrees (default: 10) */
	rotateX?: number;
}

export interface UseEntryExitAnimationOptions {
	/** Entry animation progress (0-1), 0 = hidden, 1 = fully visible */
	entryProgress: number;
	/** Exit animation progress (0-1), 0 = visible, 1 = fully exited */
	exitProgress: number;
	/** Additional scale factor (e.g., for mobile carousel) */
	additionalScale?: number;
	/** Entry animation configuration */
	entryConfig?: EntryAnimationConfig;
	/** Exit animation configuration */
	exitConfig?: ExitAnimationConfig;
}

export interface UseEntryExitAnimationResult {
	/** Combined scale value */
	scale: number;
	/** Combined Y translation in px */
	translateY: number;
	/** Combined X rotation in degrees */
	rotateX: number;
	/** Entry scale component only */
	entryScale: number;
	/** Exit scale component only */
	exitScale: number;
}

/**
 * Hook for entry/exit animation calculations
 * Follows Single Responsibility Principle - only calculates animation values
 */
export function useEntryExitAnimation(options: UseEntryExitAnimationOptions): UseEntryExitAnimationResult {
	const {
		entryProgress,
		exitProgress,
		additionalScale = 1,
		entryConfig = {},
		exitConfig = {},
	} = options;

	return useMemo(() => {
		// Entry configuration with defaults
		const {
			startScale: entryStartScale = 0.8,
			startTranslateY: entryStartTranslateY = 150,
			startRotateX: entryStartRotateX = -12,
		} = entryConfig;

		// Exit configuration with defaults
		const {
			scaleReduction: exitScaleReduction = 0.12,
			translateY: exitTranslateY = -100,
			rotateX: exitRotateX = 10,
		} = exitConfig;

		// Entry animation: scale from startScale to 1, translateY from start to 0, rotateX from start to 0
		const easedEntry = easings.easeOutCubic(entryProgress);
		const entryScale = entryStartScale + ((1 - entryStartScale) * easedEntry);
		const entryTranslateY = entryStartTranslateY * (1 - easedEntry);
		const entryRotateX = entryStartRotateX * (1 - easedEntry);

		// Exit animation: scale from 1 to (1 - reduction), translateY from 0 to target, rotateX from 0 to target
		const easedExit = easings.easeInCubic(exitProgress);
		const exitScale = 1 - (exitScaleReduction * easedExit);
		const exitTranslateYValue = exitTranslateY * easedExit;
		const exitRotateXValue = exitRotateX * easedExit;

		// Combine entry and exit animations with additional scale
		const baseScale = entryScale * exitScale;
		const finalScale = baseScale * additionalScale;
		const finalTranslateY = entryTranslateY + exitTranslateYValue;
		const finalRotateX = entryRotateX + exitRotateXValue;

		return {
			scale: finalScale,
			translateY: finalTranslateY,
			rotateX: finalRotateX,
			entryScale,
			exitScale,
		};
	}, [entryProgress, exitProgress, additionalScale, entryConfig, exitConfig]);
}
