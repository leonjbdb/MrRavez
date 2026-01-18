"use client";

import { useState, useEffect, useRef } from "react";
import { GitHubIcon } from "@/components/icons";
import { glassStyles, combineGlassStyles } from "@/components/glass/styles";
import { debugGitHubButtonConfig } from "./config/debugGitHubButtonConfig";
import { debugStorage } from "@/lib/storage";

/**
 * DebugGitHubButton - A glass-styled button linking to the GitHub repository
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Only renders a GitHub link button
 * - Open/Closed: Configuration via config file
 * - Liskov Substitution: Consistent with other debug components
 * - Interface Segregation: Minimal dependencies
 * - Dependency Inversion: Uses debugStorage abstraction
 */
export function DebugGitHubButton() {
	const [mounted, setMounted] = useState(false);
	const [isDebugEnabled, setIsDebugEnabled] = useState(() => debugStorage.getEnabled());
	const [isHovered, setIsHovered] = useState(false);
	const iconRef = useRef<HTMLDivElement>(null);

	// Client-side only rendering to avoid hydration mismatch
	useEffect(() => {
		requestAnimationFrame(() => setMounted(true));
	}, []);

	// Subscribe to debug storage changes (like GlassDebugMenu does)
	useEffect(() => {
		return debugStorage.subscribe(setIsDebugEnabled);
	}, []);

	// Don't render until mounted or if debug mode is not enabled
	if (!mounted || !isDebugEnabled) return null;

	const baseGlassStyles = combineGlassStyles(
		isHovered ? glassStyles.background.hover : glassStyles.background.default,
		glassStyles.backdrop.blur,
		isHovered ? glassStyles.border.hover : glassStyles.border.default,
		glassStyles.shadow.card
	);

	const { dimensions, zIndex, spacing, colors, transitions, githubUrl } = debugGitHubButtonConfig;

	return (
		<a
			href={githubUrl}
			target="_blank"
			rel="noopener noreferrer"
			aria-label="View source code on GitHub repository"
			style={{
				...baseGlassStyles,
				position: "fixed",
				bottom: `${spacing.buttonBottom}px`,
				right: `${spacing.buttonRight}px`,
				zIndex: zIndex.button,
				width: `${dimensions.buttonSize}px`,
				height: `${dimensions.buttonSize}px`,
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				cursor: "pointer",
				transition: `${transitions.scale}, background 0.2s ease, border 0.2s ease`,
				textDecoration: "none",
				fontFamily: "var(--font-mono), monospace",
			}}
			onMouseEnter={(e) => {
				setIsHovered(true);
				e.currentTarget.style.transform = "scale(1.05)";
			}}
			onMouseLeave={(e) => {
				setIsHovered(false);
				e.currentTarget.style.transform = "scale(1)";
			}}
		>
			<div
				ref={iconRef}
				style={{
					width: `${dimensions.iconSize}px`,
					height: `${dimensions.iconSize}px`,
					color: isHovered ? colors.iconHover : colors.iconDefault,
					transition: "color 0.2s ease",
				}}
			>
				<GitHubIcon />
			</div>
		</a>
	);
}
