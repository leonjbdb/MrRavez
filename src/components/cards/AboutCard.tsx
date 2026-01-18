"use client";

import { siteConfig } from "@/config/site.config";
import { HoverablePhoto } from "@/components/glass";
import { CardTemplate } from "./CardTemplate";
import styles from "./AboutCard.module.css";

/**
 * AboutCard - Pure content component
 * Only handles the card's content, no animation/transition logic
 */
export function AboutCard() {
	return (
		<CardTemplate title="About">
			<HoverablePhoto
				src="/MrRavez.webp"
				alt={siteConfig.identity.name}
				size={180}
				priority
			/>

			<h2 className={styles.name}>
				{siteConfig.identity.name}
			</h2>

			<div className={styles.info}>
				<p className={styles.role}>
					{siteConfig.identity.role}
				</p>
			</div>
		</CardTemplate>
	);
}
