"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";

// =============================================================================
// Types
// =============================================================================

type OrbType = 'giant' | 'medium' | 'spore';

interface OrbConfig {
    id: number;
    type: OrbType;
    baseSize: number;
    baseOpacity: number;
    baseBlur: number;
    hue: number;
    saturation: number;
    lightness: number;
}

interface OrbState {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    targetX: number;
    targetY: number;
    targetZ: number;
}

interface OrbFieldProps {
    visible: boolean;
    mouseX: number;
    mouseY: number;
}

// =============================================================================
// Constants
// =============================================================================

const ORB_COUNTS = {
    giant: { min: 2, max: 4 },
    medium: { min: 3, max: 6 },
    spore: { min: 8, max: 15 },
} as const;

// Slower speeds and stronger avoidance forces
const ORB_PROPERTIES = {
    giant: {
        sizeRange: [35, 55],
        opacityRange: [0.3, 0.5],
        blurRange: [60, 100],
        lightnessRange: [10, 18],
        baseSpeed: 0.00006, // slower horizontal/vertical speed
        zSpeed: 0.00004,
        avoidRadius: 30,
        avoidStrength: 0.0003,
    },
    medium: {
        sizeRange: [12, 28],
        opacityRange: [0.4, 0.6],
        blurRange: [35, 60],
        lightnessRange: [15, 25],
        baseSpeed: 0.0001,
        zSpeed: 0.00006,
        avoidRadius: 25,
        avoidStrength: 0.0005,
    },
    spore: {
        sizeRange: [3, 8],
        opacityRange: [0.6, 0.9],
        blurRange: [6, 18],
        lightnessRange: [25, 40],
        baseSpeed: 0.0002,
        zSpeed: 0.0001,
        avoidRadius: 18,
        avoidStrength: 0.001,
    },
} as const;

// =============================================================================
// Utility Functions
// =============================================================================

function randomInRange(min: number, max: number): number {
    return min + Math.random() * (max - min);
}

function randomInt(min: number, max: number): number {
    return Math.floor(randomInRange(min, max + 1));
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

// =============================================================================
// Orb Generation
// =============================================================================

function generateOrbConfig(id: number, type: OrbType): OrbConfig {
    const props = ORB_PROPERTIES[type];

    return {
        id,
        type,
        baseSize: randomInRange(props.sizeRange[0], props.sizeRange[1]),
        baseOpacity: randomInRange(props.opacityRange[0], props.opacityRange[1]),
        baseBlur: randomInRange(props.blurRange[0], props.blurRange[1]),
        hue: randomInRange(355, 365) % 360,
        saturation: randomInRange(70, 95),
        lightness: randomInRange(props.lightnessRange[0], props.lightnessRange[1]),
    };
}

function generateAllOrbs(): OrbConfig[] {
    const orbs: OrbConfig[] = [];
    let id = 0;
    const types: OrbType[] = ['giant', 'medium', 'spore'];
    for (const type of types) {
        const count = randomInt(ORB_COUNTS[type].min, ORB_COUNTS[type].max);
        for (let i = 0; i < count; i++) {
            orbs.push(generateOrbConfig(id++, type));
        }
    }
    return orbs;
}

function createInitialState(): OrbState {
    // Start near the centre with a gentle offset
    return {
        x: randomInRange(45, 55),
        y: randomInRange(45, 55),
        z: randomInRange(40, 60),
        vx: 0,
        vy: 0,
        vz: 0,
        targetX: randomInRange(10, 90),
        targetY: randomInRange(10, 90),
        targetZ: randomInRange(20, 80),
    };
}

// =============================================================================
// Depth‑based rendering calculations
// =============================================================================

function calculateDepthEffects(z: number, baseSize: number, baseOpacity: number, baseBlur: number) {
    const depthScale = 0.5 + (z / 100) * 1.0; // 0.5‑1.5×
    const size = baseSize * depthScale;
    const depthOpacity = 0.4 + (z / 100) * 0.8;
    const opacity = clamp(baseOpacity * depthOpacity, 0.1, 1);
    const distanceFromFocal = Math.abs(z - 50);
    const depthBlurMultiplier = 1 + (distanceFromFocal / 50) * 0.8;
    const blur = baseBlur * depthBlurMultiplier;
    return { size, opacity, blur };
}

// =============================================================================
// Single Orb Component
// =============================================================================

interface SingleOrbProps {
    config: OrbConfig;
    state: OrbState;
}

function SingleOrb({ config, state }: SingleOrbProps) {
    const color = `hsl(${config.hue}, ${config.saturation}%, ${config.lightness}%)`;
    const { size, opacity, blur } = calculateDepthEffects(
        state.z,
        config.baseSize,
        config.baseOpacity,
        config.baseBlur
    );
    return (
        <div
            style={{
                position: 'absolute',
                width: `${size}vmin`,
                height: `${size}vmin`,
                borderRadius: '50%',
                background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
                filter: `blur(${blur}px)`,
                opacity,
                left: `${state.x}%`,
                top: `${state.y}%`,
                transform: 'translate(-50%, -50%)',
                willChange: 'left, top, width, height, opacity, filter',
                pointerEvents: 'none',
            }}
        />
    );
}

// =============================================================================
// Device Orientation Hook (unchanged)
// =============================================================================

function useDeviceOrientation() {
    const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        const handleOrientation = (e: DeviceOrientationEvent) => {
            if (e.beta !== null && e.gamma !== null) {
                setOrientation({
                    beta: clamp(e.beta, -45, 45),
                    gamma: clamp(e.gamma, -45, 45),
                });
            }
        };
        const requestPermission = async () => {
            if (typeof DeviceOrientationEvent !== 'undefined' && 'requestPermission' in DeviceOrientationEvent) {
                try {
                    const permission = await (DeviceOrientationEvent as any).requestPermission();
                    if (permission === 'granted') {
                        setHasPermission(true);
                        window.addEventListener('deviceorientation', handleOrientation);
                    }
                } catch { }
            } else if (typeof DeviceOrientationEvent !== 'undefined') {
                setHasPermission(true);
                window.addEventListener('deviceorientation', handleOrientation);
            }
        };
        const handleFirstTouch = () => {
            requestPermission();
            window.removeEventListener('touchstart', handleFirstTouch);
        };
        window.addEventListener('touchstart', handleFirstTouch);
        requestPermission();
        return () => {
            window.removeEventListener('deviceorientation', handleOrientation);
            window.removeEventListener('touchstart', handleFirstTouch);
        };
    }, []);
    const tiltX = (orientation.gamma + 45) / 90;
    const tiltY = (orientation.beta + 45) / 90;
    return { tiltX, tiltY, hasPermission };
}

// =============================================================================
// OrbField Component – core animation loop
// =============================================================================

export function OrbField({ visible, mouseX, mouseY }: OrbFieldProps) {
    const orbConfigs = useMemo(() => generateAllOrbs(), []);
    const [states, setStates] = useState<Map<number, OrbState>>(() => {
        const initial = new Map<number, OrbState>();
        orbConfigs.forEach(orb => {
            initial.set(orb.id, createInitialState());
        });
        return initial;
    });
    const animationRef = useRef<number>();
    const lastTimeRef = useRef<number>(0);
    const { tiltX, tiltY, hasPermission } = useDeviceOrientation();
    const inputX = hasPermission ? tiltX : mouseX;
    const inputY = hasPermission ? tiltY : mouseY;

    useEffect(() => {
        if (!visible) return;
        const animate = (currentTime: number) => {
            const deltaTime = lastTimeRef.current ? currentTime - lastTimeRef.current : 16;
            lastTimeRef.current = currentTime;
            setStates(prev => {
                const next = new Map<number, OrbState>();
                orbConfigs.forEach(orb => {
                    const state = prev.get(orb.id);
                    if (!state) return;
                    const props = ORB_PROPERTIES[orb.type];
                    const inputPctX = inputX * 100;
                    const inputPctY = inputY * 100;
                    // ---------- Avoidance ----------
                    const distToInput = distance(state.x, state.y, inputPctX, inputPctY);
                    let avoidX = 0, avoidY = 0;
                    if (distToInput < props.avoidRadius && distToInput > 0.1) {
                        const dirX = (state.x - inputPctX) / distToInput;
                        const dirY = (state.y - inputPctY) / distToInput;
                        const strength = (1 - distToInput / props.avoidRadius) * props.avoidStrength;
                        avoidX = dirX * strength * deltaTime;
                        avoidY = dirY * strength * deltaTime;
                    }
                    // ---------- Target movement ----------
                    let { targetX, targetY, targetZ } = state;
                    const distToTarget = distance(state.x, state.y, targetX, targetY);
                    const distToTargetZ = Math.abs(state.z - targetZ);
                    if (distToTarget < 6 && distToTargetZ < 8) {
                        targetX = randomInRange(10, 90);
                        targetY = randomInRange(10, 90);
                        targetZ = randomInRange(20, 80);
                    }
                    const dx = targetX - state.x;
                    const dy = targetY - state.y;
                    const dz = targetZ - state.z;
                    const mag = Math.sqrt(dx * dx + dy * dy) || 1;
                    const targetVx = (dx / mag) * props.baseSpeed * deltaTime;
                    const targetVy = (dy / mag) * props.baseSpeed * deltaTime;
                    const targetVz = Math.sign(dz) * props.zSpeed * deltaTime;
                    const smoothing = 0.015; // smoother, slower acceleration
                    let vx = state.vx + (targetVx - state.vx) * smoothing + avoidX;
                    let vy = state.vy + (targetVy - state.vy) * smoothing + avoidY;
                    let vz = state.vz + (targetVz - state.vz) * smoothing;
                    // ---------- Speed clamp (prevent huge bursts) ----------
                    const maxSpeed = 0.5; // % per frame cap
                    const speed = Math.sqrt(vx * vx + vy * vy);
                    if (speed > maxSpeed) {
                        const scale = maxSpeed / speed;
                        vx *= scale;
                        vy *= scale;
                    }
                    // ---------- Position update ----------
                    let x = state.x + vx * deltaTime;
                    let y = state.y + vy * deltaTime;
                    let z = state.z + vz * deltaTime;
                    // Keep within visible bounds; if we hit an edge, bounce back gently
                    if (x < 0) { x = 0; targetX = randomInRange(50, 90); }
                    if (x > 100) { x = 100; targetX = randomInRange(10, 50); }
                    if (y < 0) { y = 0; targetY = randomInRange(50, 90); }
                    if (y > 100) { y = 100; targetY = randomInRange(10, 50); }
                    next.set(orb.id, {
                        x: clamp(x, 0, 100),
                        y: clamp(y, 0, 100),
                        z: clamp(z, 10, 90),
                        vx,
                        vy,
                        vz,
                        targetX,
                        targetY,
                        targetZ,
                    });
                });
                return next;
            });
            animationRef.current = requestAnimationFrame(animate);
        };
        animationRef.current = requestAnimationFrame(animate);
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [visible, inputX, inputY, orbConfigs]);

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
                zIndex: 1,
                opacity: visible ? 1 : 0,
                transform: visible ? 'scale(1)' : 'scale(0.8)',
                transition: 'opacity 1.2s ease-out, transform 1.2s ease-out',
            }}
        >
            {orbConfigs.map(orb => {
                const state = states.get(orb.id);
                if (!state) return null;
                return <SingleOrb key={orb.id} config={orb} state={state} />;
            })}
        </div>
    );
}

export default OrbField;
