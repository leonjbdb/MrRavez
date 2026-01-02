"use client";

import { useRef, ReactNode, useState, useEffect } from "react";
import { useDeviceOrientationDelta } from "@/hooks/useDeviceOrientationDelta";

interface GlassCardProps {
    children?: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    borderRadius?: number;
    padding?: string | number;
    opacity?: number;
    /** Entry animation progress (0-1), controls scale and translateY */
    entryProgress?: number;
    /** Exit animation progress (0-1), controls scale and translateY for exit */
    exitProgress?: number;
    /** Mobile horizontal offset in vw units for swipe animation */
    mobileOffset?: number;
    /** Mobile scale for carousel effect (0.85-1.0) */
    mobileScale?: number;
    /** Mobile-specific border radius (applied at max-width: 480px) */
    mobileBorderRadius?: number;
    /** Mobile-specific padding (applied at max-width: 480px) */
    mobilePadding?: string | number;
}

// Global styles for mobile overrides using CSS custom properties
const globalMobileStyles = `
    @media (max-width: 480px) {
        .glass-card-mobile .glass-card-container,
        .glass-card-mobile .glass-card-bg {
            border-radius: var(--glass-card-mobile-radius) !important;
        }
        .glass-card-mobile .glass-card-content {
            padding: var(--glass-card-mobile-padding) !important;
        }
    }
`;

export function GlassCard({
    children,
    className,
    style,
    borderRadius = 60,
    padding = 40,
    opacity = 1,
    entryProgress = 1,
    exitProgress = 0,
    mobileOffset = 0,
    mobileScale = 1,
    mobileBorderRadius,
    mobilePadding,
}: GlassCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [transform, setTransform] = useState("rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
    const [isHovering, setIsHovering] = useState(false);
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    
    // Device orientation for mobile tilt
    const { rotateX: deviceRotateX, rotateY: deviceRotateY, isAvailable: hasDeviceOrientation } = useDeviceOrientationDelta();
    
    // Detect touch-primary devices (mobile/tablet)
    useEffect(() => {
        const checkTouchDevice = () => {
            // (hover: none) means the primary input cannot hover (touch devices)
            const isTouch = window.matchMedia('(hover: none)').matches;
            setIsTouchDevice(isTouch);
        };
        
        checkTouchDevice();
        
        // Listen for changes (e.g., connecting a mouse to tablet)
        const mediaQuery = window.matchMedia('(hover: none)');
        mediaQuery.addEventListener('change', checkTouchDevice);
        
        return () => {
            mediaQuery.removeEventListener('change', checkTouchDevice);
        };
    }, []);
    
    // Compute mobile tilt transform directly (device orientation is external system sync)
    const mobileTiltTransform = isTouchDevice && hasDeviceOrientation
        ? `rotateX(${deviceRotateX}deg) rotateY(${deviceRotateY}deg) scale3d(1, 1, 1)`
        : null;

    // Desktop: Mouse-based tilt on hover
    useEffect(() => {
        // Skip mouse handling on touch devices
        if (isTouchDevice) return;
        
        const card = cardRef.current;
        if (!card) return;

        let currentRotateX = 0;
        let currentRotateY = 0;
        const smoothingFactor = 0.15;
        const animationId: number | null = null;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isHovering) return;

            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const mouseX = e.clientX - centerX;
            const mouseY = e.clientY - centerY;

            const maxTilt = 3;
            const targetRotateX = (mouseY / (rect.height / 2)) * -maxTilt;
            const targetRotateY = (mouseX / (rect.width / 2)) * maxTilt;

            currentRotateX += (targetRotateX - currentRotateX) * smoothingFactor;
            currentRotateY += (targetRotateY - currentRotateY) * smoothingFactor;

            setTransform(`rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale3d(1.01, 1.01, 1.01)`);
        };

        const handleMouseEnter = () => {
            setIsHovering(true);
        };

        const handleMouseLeave = () => {
            setIsHovering(false);
            currentRotateX = 0;
            currentRotateY = 0;
            setTransform("rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)");
        };

        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseenter", handleMouseEnter);
        card.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            card.removeEventListener("mousemove", handleMouseMove);
            card.removeEventListener("mouseenter", handleMouseEnter);
            card.removeEventListener("mouseleave", handleMouseLeave);
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [isHovering, isTouchDevice]);

    const paddingValue = typeof padding === "number" ? `${padding}px` : padding;
    const mobilePaddingValue = mobilePadding 
        ? (typeof mobilePadding === "number" ? `${mobilePadding}px` : mobilePadding)
        : paddingValue;

    // Track visibility - hide element shortly after opacity reaches 0
    // Use ref to track delayed visibility state without triggering re-renders
    const [isVisible, setIsVisible] = useState(opacity > 0.01);
    const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    
    useEffect(() => {
        // Clear any pending timer
        if (visibilityTimerRef.current) {
            clearTimeout(visibilityTimerRef.current);
            visibilityTimerRef.current = null;
        }
        
        if (opacity > 0.01) {
            // Immediately show when opacity increases - use timer with 0ms to avoid sync setState
            visibilityTimerRef.current = setTimeout(() => setIsVisible(true), 0);
        } else {
            // Brief delay to ensure smooth transition completion
            visibilityTimerRef.current = setTimeout(() => setIsVisible(false), 100);
        }
        
        return () => {
            if (visibilityTimerRef.current) {
                clearTimeout(visibilityTimerRef.current);
            }
        };
    }, [opacity]);

    // Custom easing function: cubic ease-out for natural motion
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeInCubic = (t: number) => t * t * t;

    // Entry animation: scale from 0.8 to 1, translateY from 150px to 0, rotateX from -12deg to 0
    // Made more pronounced for visible slide-in effect
    const easedEntry = easeOutCubic(entryProgress);
    const entryScale = 0.8 + (0.2 * easedEntry);
    const entryTranslateY = 150 * (1 - easedEntry);
    const entryRotateX = -12 * (1 - easedEntry);

    // Exit animation: scale from 1 to 0.88, translateY from 0 to -100px, rotateX from 0 to 10deg
    // Made more pronounced to match entry
    const easedExit = easeInCubic(exitProgress);
    const exitScale = 1 - (0.12 * easedExit);
    const exitTranslateY = -100 * easedExit;
    const exitRotateX = 10 * easedExit;

    // Combine entry and exit animations with mobile scale
    const baseScale = entryScale * exitScale;
    const finalScale = baseScale * mobileScale; // Apply mobile carousel scale
    const finalTranslateY = entryTranslateY + exitTranslateY;
    const finalRotateX = entryRotateX + exitRotateX;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { transform: _, ...styleWithoutTransform } = style || {};
    
    // Build optimized 3D transform for GPU compositing
    // translate3d triggers GPU layer promotion for smoother animations
    // Order: centering -> mobile offset -> vertical animation -> scale -> rotation
    const combinedTransform = `
        translate3d(calc(-50% + ${mobileOffset}vw), calc(-50% + ${finalTranslateY}px), 0)
        scale3d(${finalScale}, ${finalScale}, 1)
        rotateX(${finalRotateX}deg)
    `.replace(/\s+/g, ' ').trim();

    // Check if mobile overrides are provided
    const hasMobileOverrides = mobileBorderRadius !== undefined || mobilePadding !== undefined;

    // Build CSS custom properties for mobile overrides
    const cssVars = hasMobileOverrides ? {
        '--glass-card-mobile-radius': `${mobileBorderRadius ?? borderRadius}px`,
        '--glass-card-mobile-padding': mobilePaddingValue,
    } as React.CSSProperties : {};

    return (
        <div
            ref={cardRef}
            className={`${hasMobileOverrides ? 'glass-card-mobile' : ''} ${className || ''}`.trim() || undefined}
            style={{
                position: "relative",
                perspective: "1200px",
                transformStyle: "preserve-3d",
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                opacity: opacity,
                visibility: isVisible ? "visible" : "hidden",
                pointerEvents: opacity > 0.01 ? "auto" : "none",
                // No CSS transition - JS handles smooth animation via requestAnimationFrame
                transform: combinedTransform,
                ...cssVars,
                ...styleWithoutTransform,
            }}
        >
            {hasMobileOverrides && (
                <style suppressHydrationWarning dangerouslySetInnerHTML={{ __html: globalMobileStyles }} />
            )}
            {/* Glass container with 3D tilt */}
            <div
                className="glass-card-container"
                style={{
                    position: "relative",
                    borderRadius,
                    transform: mobileTiltTransform ?? transform,
                    transition: isTouchDevice
                        ? "transform 0.1s ease-out"  // Slightly longer for smooth device orientation
                        : isHovering
                            ? "transform 0.05s ease-out"
                            : "transform 0.5s ease-out",
                    transformStyle: "preserve-3d",
                }}
            >
                {/* Glass background with backdrop-filter */}
                <div
                    className="glass-card-bg"
                    style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius,
                        background: "rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(24px) saturate(120%)",
                        WebkitBackdropFilter: "blur(24px) saturate(120%)",
                        boxShadow: `
                            0 25px 50px rgba(0, 0, 0, 0.25),
                            0 10px 20px rgba(0, 0, 0, 0.15),
                            inset 0 1px 0 rgba(255, 255, 255, 0.2),
                            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                        `,
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        zIndex: 0,
                        pointerEvents: "none",
                    }}
                />

                {/* Top edge highlight */}
                <div
                    style={{
                        position: "absolute",
                        top: 1,
                        left: "8%",
                        right: "8%",
                        height: 1,
                        background: "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.5) 20%, rgba(255, 255, 255, 0.6) 50%, rgba(255, 255, 255, 0.5) 80%, transparent 100%)",
                        borderRadius: borderRadius / 2,
                        zIndex: 2,
                        pointerEvents: "none",
                    }}
                />

                {/* Content layer */}
                <div
                    className="glass-card-content"
                    style={{
                        position: "relative",
                        zIndex: 1,
                        padding: paddingValue,
                        transform: "translateZ(10px)",
                        transformStyle: "preserve-3d",
                    }}
                >
                    {children}
                </div>
            </div>
        </div>
    );
}

