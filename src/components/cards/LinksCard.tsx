"use client";

import { GlassButton } from "@/components/glass";
import { siteConfig } from "@/config/site.config";
import { getIconByType } from "@/components/icons";
import { CardTemplate } from "./CardTemplate";
import { useCardKeyboardNavigation } from "./hooks";
import styles from "./LinksCard.module.css";

/**
 * LinksCard - Pure content component
 * Only handles the card's content, no animation/transition logic
 */
export function LinksCard() {
	const containerRef = useCardKeyboardNavigation();

	return (
		<CardTemplate title="Links">
			<div ref={containerRef} className={styles.container}>
				{siteConfig.links.map(link => (
					<GlassButton
						key={link.href}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						icon={getIconByType(link.icon)}
						label={link.label}
					/>
				))}
			</div>
		</CardTemplate>
	);
}
