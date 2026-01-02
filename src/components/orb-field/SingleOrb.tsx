"use client";

import { memo } from 'react';
import type { OrbConfig, OrbState } from './types';
import { calculateDepthEffects } from './utils';

interface SingleOrbProps {
    config: OrbConfig;
    state: OrbState;
    focalZ: number;
    tiltX: number;
    tiltY: number;
}

export const SingleOrb = memo(function SingleOrb({ config, state, focalZ, tiltX, tiltY }: SingleOrbProps) {
    const color = `hsl(${config.hue}, ${config.saturation}%, ${config.lightness}%)`;
    
    // Use lifecycle-based scale for smooth spawn/despawn
    const scale = state.scale;
    
    // Calculate depth effects with dynamic focal plane
    const { size, opacity, blur, glowIntensity } = calculateDepthEffects(
        state.z,
        config.baseSize,
        config.baseOpacity,
        config.baseBlur,
        focalZ
    );
    
    // Apply scale to size and opacity for fluid spawn/despawn
    const scaledSize = size * scale;
    const finalOpacity = opacity * scale;
    
    // Parallax effect based on tilt and depth
    const parallaxStrength = (state.z / 100) * 12;
    const displayX = state.x + (tiltX - 0.5) * parallaxStrength;
    const displayY = state.y + (tiltY - 0.5) * parallaxStrength;
    
    // Glow effect for foreground orbs - disable on low scale to reduce GPU work
    const scaledGlow = scale > 0.5 ? glowIntensity * scale : 0;
    const glowColor = `hsla(${config.hue}, ${config.saturation}%, ${config.lightness + 20}%, ${scaledGlow})`;
    
    return (
        <div
            style={{
                position: 'absolute',
                width: `${scaledSize}vmin`,
                height: `${scaledSize}vmin`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter: `blur(${blur * scale}px)`,
                opacity: finalOpacity,
                left: 0,
                top: 0,
                // Use transform for GPU-accelerated positioning (prevents mobile flickering)
                transform: `translate3d(calc(${displayX}vw - 50%), calc(${displayY}vh - 50%), 0)`,
                boxShadow: scaledGlow > 0.1 ? `0 0 ${scaledSize * 2}px ${glowColor}` : 'none',
                // Force GPU compositing layer for smooth rendering on mobile
                backfaceVisibility: 'hidden',
                // Isolate this element's rendering to prevent repaints affecting siblings
                contain: 'strict',
                pointerEvents: 'none',
            }}
        />
    );
});


