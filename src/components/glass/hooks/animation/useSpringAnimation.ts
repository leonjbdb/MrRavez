"use client";

import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Spring physics configuration
 */
export interface SpringConfig {
	stiffness: number;
	damping: number;
	mass: number;
}

/**
 * Default spring configuration for smooth snap animations
 */
export const DEFAULT_SPRING_CONFIG: SpringConfig = {
	stiffness: 300,
	damping: 25,
	mass: 1,
};

export interface UseSpringAnimationOptions {
	/** Spring physics configuration */
	config?: SpringConfig;
	/** Callback when animation settles at target position */
	onSettle?: (position: number) => void;
	/** Initial position (default: 0) */
	initialPosition?: number;
}

export interface UseSpringAnimationResult {
	/** Current animated position */
	position: number;
	/** Animate to target position with spring physics */
	snapTo: (target: number) => void;
	/** Directly set position (for dragging) */
	setPosition: (pos: number) => void;
	/** Set velocity (for momentum on drag end) */
	setVelocity: (vel: number) => void;
	/** Cancel any running animation */
	cancelAnimation: () => void;
	/** Whether animation is currently running */
	isAnimating: boolean;
}

/**
 * Hook for spring physics animation
 * Extracted from GlassSlider to follow Single Responsibility Principle
 * 
 * Handles:
 * - Spring physics simulation (stiffness, damping, mass)
 * - Smooth animation to target positions
 * - Velocity-based momentum
 */
export function useSpringAnimation(options: UseSpringAnimationOptions = {}): UseSpringAnimationResult {
	const {
		config = DEFAULT_SPRING_CONFIG,
		onSettle,
		initialPosition = 0,
	} = options;

	const [position, setPosition] = useState(initialPosition);
	const [isAnimating, setIsAnimating] = useState(false);

	// Use refs for animation state to avoid stale closures
	const animationRef = useRef<number | null>(null);
	const velocityRef = useRef(0);
	const positionRef = useRef(initialPosition);

	// Sync position ref when state changes
	useEffect(() => {
		positionRef.current = position;
	}, [position]);

	const cancelAnimation = useCallback(() => {
		if (animationRef.current) {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;
		}
		setIsAnimating(false);
	}, []);

	const snapTo = useCallback((target: number) => {
		cancelAnimation();
		setIsAnimating(true);

		let currentPosition = positionRef.current;
		let velocity = velocityRef.current;

		const animate = () => {
			const { stiffness, damping, mass } = config;

			// Spring force: F = -k * x (where x is displacement from target)
			const displacement = currentPosition - target;
			const springForce = -stiffness * displacement;

			// Damping force: F = -c * v
			const dampingForce = -damping * velocity;

			// Acceleration: a = F / m
			const acceleration = (springForce + dampingForce) / mass;

			// Update velocity and position (using small time step)
			const dt = 1 / 60; // Assume 60fps
			velocity += acceleration * dt;
			currentPosition += velocity * dt;

			positionRef.current = currentPosition;
			velocityRef.current = velocity;
			setPosition(currentPosition);

			// Check if we've settled (very close to target with low velocity)
			const isSettled = Math.abs(displacement) < 0.001 && Math.abs(velocity) < 0.01;

			if (isSettled) {
				// Snap to exact target
				positionRef.current = target;
				velocityRef.current = 0;
				setPosition(target);
				setIsAnimating(false);
				animationRef.current = null;

				// Notify completion
				onSettle?.(target);
			} else {
				animationRef.current = requestAnimationFrame(animate);
			}
		};

		animationRef.current = requestAnimationFrame(animate);
	}, [config, cancelAnimation, onSettle]);

	const setPositionManual = useCallback((pos: number) => {
		positionRef.current = pos;
		setPosition(pos);
	}, []);

	const setVelocity = useCallback((vel: number) => {
		velocityRef.current = vel;
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => cancelAnimation();
	}, [cancelAnimation]);

	return {
		position,
		snapTo,
		setPosition: setPositionManual,
		setVelocity,
		cancelAnimation,
		isAnimating,
	};
}
