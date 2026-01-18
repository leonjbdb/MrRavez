"use client";

import { RefObject, useState, useRef, useCallback, useEffect } from "react";

export interface UseDragInteractionOptions {
	/** Reference to the track element that defines the draggable area */
	trackRef: RefObject<HTMLElement | null>;
	/** Width of the draggable handle in pixels */
	handleWidth?: number;
	/** Padding inside the track in pixels */
	trackPadding?: number;
	/** Called when drag starts */
	onDragStart?: () => void;
	/** Called during drag with normalized position (0-1) */
	onDragMove?: (position: number) => void;
	/** Called when drag ends with final position and velocity */
	onDragEnd?: (position: number, velocity: number) => void;
}

export interface UseDragInteractionResult {
	/** Whether currently dragging */
	isDragging: boolean;
	/** Props to spread onto the draggable handle element */
	handleProps: {
		onMouseDown: (e: React.MouseEvent) => void;
		onTouchStart: (e: React.TouchEvent) => void;
		onTouchMove: (e: React.TouchEvent) => void;
		onTouchEnd: (e: React.TouchEvent) => void;
	};
}

/**
 * Hook for mouse and touch drag interactions
 * Extracted from GlassSlider to follow Single Responsibility Principle
 * 
 * Handles:
 * - Mouse drag (mousedown, mousemove, mouseup)
 * - Touch drag (touchstart, touchmove, touchend)
 * - Position calculation relative to track
 * - Velocity tracking for momentum
 */
export function useDragInteraction(options: UseDragInteractionOptions): UseDragInteractionResult {
	const {
		trackRef,
		handleWidth = 64,
		trackPadding = 6,
		onDragStart,
		onDragMove,
		onDragEnd,
	} = options;

	const [isDragging, setIsDragging] = useState(false);

	// Track position and velocity for momentum calculation
	const lastPositionRef = useRef(0);
	const velocityRef = useRef(0);
	const dragStartRef = useRef<{ x: number } | null>(null);

	/**
	 * Calculate normalized position (0-1) from pointer X coordinate
	 */
	const calculatePosition = useCallback((clientX: number): number => {
		if (!trackRef.current) return 0;

		const rect = trackRef.current.getBoundingClientRect();

		// Available track width for the handle to move
		const trackWidth = rect.width - handleWidth - (trackPadding * 2);

		// Calculate relative position from the left edge of the track
		const trackLeft = rect.left + trackPadding;
		const relativeX = clientX - trackLeft - (handleWidth / 2);

		return Math.max(0, Math.min(1, relativeX / trackWidth));
	}, [trackRef, handleWidth, trackPadding]);

	/**
	 * Handle drag start
	 */
	const handleDragStart = useCallback((clientX: number) => {
		setIsDragging(true);
		dragStartRef.current = { x: clientX };
		lastPositionRef.current = calculatePosition(clientX);
		velocityRef.current = 0;
		onDragStart?.();
	}, [calculatePosition, onDragStart]);

	/**
	 * Handle drag move
	 */
	const handleDragMove = useCallback((clientX: number) => {
		if (!isDragging || !dragStartRef.current) return;

		const newPosition = calculatePosition(clientX);

		// Calculate velocity for momentum (scale to per-second)
		velocityRef.current = (newPosition - lastPositionRef.current) * 60;
		lastPositionRef.current = newPosition;

		onDragMove?.(newPosition);
	}, [isDragging, calculatePosition, onDragMove]);

	/**
	 * Handle drag end
	 */
	const handleDragEnd = useCallback(() => {
		if (!isDragging) return;

		setIsDragging(false);
		dragStartRef.current = null;

		onDragEnd?.(lastPositionRef.current, velocityRef.current);
	}, [isDragging, onDragEnd]);

	// Mouse event handlers (document-level for reliable tracking)
	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			e.preventDefault();
			handleDragMove(e.clientX);
		};

		const handleMouseUp = () => {
			handleDragEnd();
		};

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);

		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleDragMove, handleDragEnd]);

	// Handle props for the draggable element
	const handleMouseDown = useCallback((e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		handleDragStart(e.clientX);
	}, [handleDragStart]);

	const handleTouchStart = useCallback((e: React.TouchEvent) => {
		e.stopPropagation();
		handleDragStart(e.touches[0].clientX);
	}, [handleDragStart]);

	const handleTouchMove = useCallback((e: React.TouchEvent) => {
		e.preventDefault();
		e.stopPropagation();
		handleDragMove(e.touches[0].clientX);
	}, [handleDragMove]);

	const handleTouchEnd = useCallback((e: React.TouchEvent) => {
		e.stopPropagation();
		handleDragEnd();
	}, [handleDragEnd]);

	return {
		isDragging,
		handleProps: {
			onMouseDown: handleMouseDown,
			onTouchStart: handleTouchStart,
			onTouchMove: handleTouchMove,
			onTouchEnd: handleTouchEnd,
		},
	};
}
