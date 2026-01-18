"use client";

import { useState } from "react";
import { attributionConfig } from "./config/attributionConfig";
import { useHostDetection } from "./hooks/useHostDetection";
import styles from "./Attribution.module.css";

interface AttributionProps {
	/** Whether the attribution should be visible (based on active section) */
	visible?: boolean;
}

/**
 * Attribution - A subtle footer attribution linking to de-backer.no
 * 
 * Follows SOLID Principles:
 * - Single Responsibility: Only renders attribution link
 * - Open/Closed: Configuration via config file
 * - Liskov Substitution: Can be replaced with any React component
 * - Interface Segregation: Minimal props
 * - Dependency Inversion: Uses useHostDetection abstraction for host logic
 * 
 * Automatically hides when rendered on de-backer.no to avoid self-referential links
 * Also hides when not on the last section (contact card)
 */
export function Attribution({ visible = true }: AttributionProps) {
	const { shouldShow } = useHostDetection();
	const [isHovered, setIsHovered] = useState(false);

	// Don't render on hidden hosts (e.g., de-backer.no itself) or when not visible
	if (!shouldShow || !visible) {
		return null;
	}

	const { author, link, styles: configStyles } = attributionConfig;
	const { spacing, pill, colors, typography, transitions, zIndex } = configStyles;

	return (
		<footer
			style={{
				position: "fixed",
				bottom: 0,
				left: 0,
				right: 0,
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				padding: `${spacing.paddingVertical}px ${spacing.paddingHorizontal}px`,
				zIndex,
				pointerEvents: "none",
			}}
		>
			<a
				href={link.href}
				target={link.target}
				rel={link.rel}
				aria-label={`Visit ${author.name}'s website`}
				className={styles.attributionLink}
				style={{
					"--pill-padding": `${pill.paddingVertical}px ${pill.paddingHorizontal}px`,
					"--pill-border-radius": `${pill.borderRadius}px`,
					"--font-size": `${typography.fontSize}px`,
					"--letter-spacing": typography.letterSpacing,
					"--transition": transitions.all,
					color: isHovered ? colors.textHover : colors.text,
				} as React.CSSProperties}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
			>
				{author.displayPrefix} {author.name}
			</a>
		</footer>
	);
}
