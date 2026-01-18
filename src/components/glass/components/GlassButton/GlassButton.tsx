"use client";

import { useInteraction3D } from "../../hooks/interaction";
import { GLASS_BUTTON_SELECTOR } from "../../types";
import type { GlassButtonProps } from "../../types";
import styles from "./GlassButton.module.css";

/**
 * GlassButton - A glassmorphic button/link component with hover effects
 * Follows Single Responsibility Principle - only renders a glass button
 * Follows Open/Closed Principle - uses configuration constants
 */
export function GlassButton({ icon, label, href, target, rel }: GlassButtonProps) {
	const { isActive, interactionProps } = useInteraction3D({
		trigger: 'hover',
		enableFocus: true,
	});

	// Build className using selector constant
	const linkClassName = [
		styles.link,
		GLASS_BUTTON_SELECTOR,
		isActive ? styles.isHovered : '',
	].filter(Boolean).join(' ');

	return (
		<a
			href={href}
			target={target}
			rel={rel}
			className={linkClassName}
			{...interactionProps}
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
