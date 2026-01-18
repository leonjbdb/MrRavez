"use client";

import { ReactNode, useState, useRef, useCallback, useEffect } from "react";
import styles from "./GlassButton.module.css";

interface GlassButtonProps {
	icon: ReactNode;
	label: string;
	href: string;
	target?: string;
	rel?: string;
}

/**
 * GlassButton - A glassmorphic button/link component with hover effects
 * 
 * Note: The 'glass-button-link' class is added alongside the module class
 * because it's used by other components for focus management and keyboard navigation.
 */
export function GlassButton({ icon, label, href, target, rel }: GlassButtonProps) {
	const [isHovered, setIsHovered] = useState(false);
	const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;

	const handleMouseEnter = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsHovered(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		// Small delay before removing hover to prevent flickering at edges
		timeoutRef.current = setTimeout(() => {
			setIsHovered(false);
		}, 100);
	}, []);

	const handleFocus = useCallback(() => {
		if (timeoutRef.current) {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}
		setIsHovered(true);
	}, []);

	const handleBlur = useCallback(() => {
		setIsHovered(false);
	}, []);

	useEffect(() => {
		return () => {
			if (timeoutRef.current) {
				clearTimeout(timeoutRef.current);
			}
		};
	}, []);

	// Build className - 'glass-button-link' is kept for cross-component compatibility
	const linkClassName = [
		styles.link,
		'glass-button-link',
		isHovered ? styles.isHovered : '',
	].filter(Boolean).join(' ');

	return (
		<a
			href={href}
			target={target}
			rel={rel}
			className={linkClassName}
			onMouseEnter={supportsHover ? handleMouseEnter : undefined}
			onMouseLeave={supportsHover ? handleMouseLeave : undefined}
			onFocus={handleFocus}
			onBlur={handleBlur}
		>
			<div className={styles.content}>
				<span className={styles.icon}>
					{icon}
				</span>
				<span className={styles.label}>
					{label}
				</span>
				<span className={styles.arrow} aria-hidden="true">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</span>
			</div>
		</a>
	);
}
