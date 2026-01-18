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
	// Track current target to prevent stale closure issues with rapid calls
	const targetRef = useRef<number | null>(null);
	// Track animation generation to detect stale animations
	const animationGenRef = useRef(0);

	// Store callbacks in refs to avoid stale closures
	const onSettleRef = useRef(onSettle);
	useEffect(() => {
		onSettleRef.current = onSettle;
	}, [onSettle]);

	// Store config in ref to avoid stale closures
	const configRef = useRef(config);
	useEffect(() => {
		configRef.current = config;
	}, [config]);

	const cancelAnimation = useCallback(() => {
		if (animationRef.current !== null) {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;
		}
		targetRef.current = null;
		setIsAnimating(false);
	}, []);

	const snapTo = useCallback((target: number) => {
		// Cancel any existing animation first
		if (animationRef.current !== null) {
			cancelAnimationFrame(animationRef.current);
			animationRef.current = null;
		}

		// Increment generation to invalidate any pending animations
		animationGenRef.current += 1;
		const currentGen = animationGenRef.current;

		targetRef.current = target;
		setIsAnimating(true);

		// Start from current position with clamped initial velocity
		// Clamp velocity to prevent wild animations from rapid dragging
		let currentPosition = positionRef.current;
		const rawVelocity = velocityRef.current;
		const maxVelocity = 10; // Reasonable max velocity
		let velocity = Math.max(-maxVelocity, Math.min(maxVelocity, rawVelocity));

		// Reset velocity ref to prevent accumulation
		velocityRef.current = 0;

		const animate = () => {
			// Check if this animation is still valid (not superseded by a newer one)
			if (currentGen !== animationGenRef.current) {
				return;
			}

			const { stiffness, damping, mass } = configRef.current;

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

			// Clamp position to valid range to prevent overshooting beyond bounds
			currentPosition = Math.max(0, Math.min(1, currentPosition));

			positionRef.current = currentPosition;
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
				targetRef.current = null;

				// Notify completion using ref to avoid stale closure
				onSettleRef.current?.(target);
			} else {
				animationRef.current = requestAnimationFrame(animate);
			}
		};

		animationRef.current = requestAnimationFrame(animate);
	}, []);

	const setPositionManual = useCallback((pos: number) => {
		positionRef.current = pos;
		setPosition(pos);
	}, []);

	const setVelocity = useCallback((vel: number) => {
		velocityRef.current = vel;
	}, []);

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (animationRef.current !== null) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, []);

	return {
		position,
		snapTo,
		setPosition: setPositionManual,
		setVelocity,
		cancelAnimation,
		isAnimating,
	};
}
