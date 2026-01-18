"use client";

import { GlassButton } from "@/components/glass";
import { siteConfig } from "@/config/site.config";
import { EmailIcon } from "@/components/icons";
import { CardTemplate } from "./CardTemplate";
import { useCardKeyboardNavigation } from "./hooks";
import styles from "./ContactCard.module.css";

/**
 * ContactCard - Pure content component
 * Only handles the card's content, no animation/transition logic
 */
export function ContactCard() {
	const containerRef = useCardKeyboardNavigation();

	return (
		<CardTemplate title="Contact">
			<div ref={containerRef} className={styles.container}>
				<div className={styles.section}>
					<p className={styles.label}>
						Business Inquiries:
					</p>
					<GlassButton
						href={`mailto:${siteConfig.contact.email_personal}`}
						icon={<EmailIcon />}
						label={siteConfig.contact.email_personal}
					/>
				</div>
			</div>
		</CardTemplate>
	);
}
