// =============================================================================
// OrbVisualRenderer - Visual rendering for orbs with depth-based effects
// =============================================================================

import { type Orb } from '../types';
import { type OrbVisualConfig, DEFAULT_ORB_VISUAL_CONFIG } from './OrbVisualConfig';

/**
 * Represents the current window dimensions.
 */
interface WindowSize {
	width: number;
	height: number;
}

/**
 * Handles the visual rendering of orbs with maroon coloring, glow effects,
 * and depth-based blur simulation.
 *
 * Single Responsibility: Only responsible for drawing visual orb representations.
 * Uses radial gradients for performant glow and blur effects.
 *
 * Design Notes:
 * - Orbs are rendered back-to-front (sorted by z-depth) for proper layering
 * - Depth affects opacity and gradient softness (bokeh simulation)
 * - Glow is achieved via extended radial gradient with color fade
 */
export class OrbVisualRenderer {
	/**
	 * Renders all orbs to the canvas with visual effects.
	 *
	 * @param ctx - The 2D canvas rendering context.
	 * @param windowSize - Current window dimensions.
	 * @param orbs - Array of orbs to render.
	 * @param totalLayers - Total number of z-layers in the system.
	 * @param config - Visual configuration for orb appearance.
	 */
	static draw(
		ctx: CanvasRenderingContext2D,
		windowSize: WindowSize,
		orbs: Orb[],
		totalLayers: number,
		config: OrbVisualConfig = DEFAULT_ORB_VISUAL_CONFIG
	): void {
		const { width, height } = windowSize;

		// Clear the canvas
		ctx.clearRect(0, 0, width, height);

		// Skip if no orbs
		if (orbs.length === 0) return;

		// Sort orbs by z-depth (back to front) for proper layering
		// Higher z = further back = render first
		const sortedOrbs = [...orbs].sort((a, b) => b.z - a.z);

		// Use 'screen' blend mode for additive-like blending
		// This makes overlapping orbs blend together nicely (brighter where they overlap)
		ctx.globalCompositeOperation = 'screen';

		// Render each orb on ALL layers (no layer filtering)
		for (const orb of sortedOrbs) {
			this.drawOrb(ctx, orb, totalLayers, config);
		}

		// Reset composite operation
		ctx.globalCompositeOperation = 'source-over';
	}

	/**
	 * Draws a single orb with radial gradient for glow and depth blur effect.
	 *
	 * @param ctx - The 2D canvas rendering context.
	 * @param orb - The orb to render.
	 * @param totalLayers - Total number of z-layers.
	 * @param config - Visual configuration.
	 */
	private static drawOrb(
		ctx: CanvasRenderingContext2D,
		orb: Orb,
		totalLayers: number,
		config: OrbVisualConfig
	): void {
		const { pxX, pxY, z, size } = orb;

		// Calculate depth factor (0 = closest, 1 = furthest)
		const depthFactor = this.calculateDepthFactor(z, totalLayers);

		// Calculate orb visual radius based on size
		const baseRadius = config.baseRadiusPx * Math.pow(size, config.sizeExponent);

		// Calculate glow radius (extends beyond base radius)
		const glowRadius = baseRadius * config.glowSpread;

		// Calculate depth-based properties
		const opacity = this.lerp(config.maxOpacity, config.minOpacity, depthFactor);
		const blurSoftness = this.lerp(config.minBlurSoftness, config.maxBlurSoftness, depthFactor);

		// Create and apply the radial gradient
		const gradient = this.createOrbGradient(
			ctx,
			pxX,
			pxY,
			baseRadius,
			glowRadius,
			blurSoftness,
			opacity,
			config
		);

		// Draw the orb as a circle with the gradient
		ctx.beginPath();
		ctx.arc(pxX, pxY, glowRadius, 0, Math.PI * 2);
		ctx.fillStyle = gradient;
		ctx.fill();
	}

	/**
	 * Calculates the depth factor from z-position.
	 * Returns 0 for closest (z=0) and 1 for furthest (z=totalLayers).
	 *
	 * @param z - Current z-position of the orb.
	 * @param totalLayers - Total number of z-layers.
	 * @returns Depth factor from 0 (close) to 1 (far).
	 */
	private static calculateDepthFactor(z: number, totalLayers: number): number {
		return Math.max(0, Math.min(1, z / totalLayers));
	}

	/**
	 * Creates a radial gradient for an orb with glow and blur effects.
	 *
	 * The gradient structure:
	 * - Center: Solid maroon color (core of the orb)
	 * - Inner edge: Color with blur softness transition
	 * - Outer glow: Color fades to transparent
	 *
	 * @param ctx - The 2D canvas rendering context.
	 * @param x - Center X position.
	 * @param y - Center Y position.
	 * @param baseRadius - The orb's base visual radius.
	 * @param glowRadius - The extended radius including glow.
	 * @param blurSoftness - How soft the edge transition is (0-1).
	 * @param opacity - Overall opacity of the orb.
	 * @param config - Visual configuration.
	 * @returns A radial gradient for filling the orb.
	 */
	private static createOrbGradient(
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		baseRadius: number,
		glowRadius: number,
		blurSoftness: number,
		opacity: number,
		config: OrbVisualConfig
	): CanvasGradient {
		const { baseHue, baseSaturation, baseLightness, glowIntensity } = config;

		// Create radial gradient from center to glow edge
		const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);

		// Calculate brightened center for glowing effect
		// The core is brighter (higher lightness) to simulate internal luminosity
		const coreLightness = Math.min(baseLightness + 30, 50);
		const innerLightness = Math.min(baseLightness + 20, 40);
		const midLightness = Math.min(baseLightness + 10, 30);

		// Very soft opacity curve - starts fading immediately from center
		// blurSoftness controls how quickly opacity drops off (higher = faster fade = softer)
		const coreOpacity = opacity * 0.7;
		const innerOpacity = opacity * 0.45 * (1 - blurSoftness * 0.3);
		const midOpacity = opacity * 0.25 * (1 - blurSoftness * 0.5);
		const glowOpacity = opacity * glowIntensity * 0.12;
		const outerOpacity = opacity * glowIntensity * 0.04;

		// Colors with very gradual opacity falloff for soft, diffused look
		const coreColor = `hsla(${baseHue}, ${baseSaturation}%, ${coreLightness}%, ${coreOpacity})`;
		const innerColor = `hsla(${baseHue}, ${baseSaturation}%, ${innerLightness}%, ${innerOpacity})`;
		const midColor = `hsla(${baseHue}, ${baseSaturation}%, ${midLightness}%, ${midOpacity})`;
		const glowColor = `hsla(${baseHue}, ${baseSaturation}%, ${baseLightness}%, ${glowOpacity})`;
		const outerGlow = `hsla(${baseHue}, ${baseSaturation}%, ${baseLightness}%, ${outerOpacity})`;
		const transparentColor = `hsla(${baseHue}, ${baseSaturation}%, ${baseLightness}%, 0)`;

		// Very early fade stops for extremely soft, diffused edges
		// The gradient fades out across most of the radius for a bokeh-like blur effect
		const stop1 = 0.0;                          // Center - brightest
		const stop2 = 0.05 * (1 - blurSoftness);    // Core fades very early
		const stop3 = 0.12 * (1 - blurSoftness * 0.5);
		const stop4 = 0.25;                         // Mid fade
		const stop5 = 0.45;                         // Glow region
		const stop6 = 0.7;                          // Outer glow
		// stop 1.0 = fully transparent

		// Add gradient color stops for ultra-soft, diffused glow
		gradient.addColorStop(stop1, coreColor);
		gradient.addColorStop(Math.max(0.02, stop2), coreColor);
		gradient.addColorStop(Math.max(0.05, stop3), innerColor);
		gradient.addColorStop(stop4, midColor);
		gradient.addColorStop(stop5, glowColor);
		gradient.addColorStop(stop6, outerGlow);
		gradient.addColorStop(1, transparentColor);

		return gradient;
	}

	/**
	 * Linear interpolation between two values.
	 *
	 * @param a - Start value.
	 * @param b - End value.
	 * @param t - Interpolation factor (0-1).
	 * @returns Interpolated value.
	 */
	private static lerp(a: number, b: number, t: number): number {
		return a + (b - a) * t;
	}
}
