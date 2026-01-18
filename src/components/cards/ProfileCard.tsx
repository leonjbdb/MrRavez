"use client";

import Image from "next/image";
import { useState, useRef, useCallback } from "react";
import { siteConfig } from "@/config/site.config";
import { CardTemplate } from "./CardTemplate";
import styles from "./ProfileCard.module.css";

/**
 * ProfileCard - Pure content component
 * Only handles the card's content, no animation/transition logic
 */
export function ProfileCard() {
	const [isPhotoHovered, setIsPhotoHovered] = useState(false);
	const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	// Debounced hover handlers to prevent flickering at edges
	const handleMouseEnter = useCallback(() => {
		if (hoverTimeoutRef.current) {
			clearTimeout(hoverTimeoutRef.current);
			hoverTimeoutRef.current = null;
		}
		setIsPhotoHovered(true);
	}, []);

	const handleMouseLeave = useCallback(() => {
		// Small delay before removing hover state to prevent edge flickering
		hoverTimeoutRef.current = setTimeout(() => {
			setIsPhotoHovered(false);
		}, 50);
	}, []);

	return (
		<CardTemplate title="About">
			{/* Hover zone wrapper - stable bounds that don't change with scale */}
			<div
				className={styles.profilePhotoHoverZone}
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			>
				<div
					className={styles.profilePhotoWrapper}
					style={{
						transform: isPhotoHovered ? 'translateZ(50px) scale(1.08)' : 'scale(1)',
						boxShadow: isPhotoHovered
							? '0 16px 48px rgba(0, 0, 0, 0.4), 0 8px 24px rgba(0, 0, 0, 0.3)'
							: '0 8px 32px rgba(0, 0, 0, 0.3)',
					}}
				>
					<div className={styles.profilePhotoClipper}>
						<Image
							src="/leon.jpeg"
							alt={siteConfig.identity.name}
							width={140}
							height={140}
							className={styles.profilePhoto}
							priority
						/>
					</div>
				</div>
			</div>

			<h3 className={styles.profileName}>
				Leon Joachim Buverud <span className={styles.noBreak}>De Backer</span>
			</h3>

			<div className={styles.aboutInfo}>
				<p className={styles.aboutRole}>
					{siteConfig.identity.role} — {siteConfig.identity.division}
				</p>
				<p className={styles.aboutOrg}>
					{siteConfig.identity.organization}
				</p>
			</div>
		</CardTemplate>
	);
}
