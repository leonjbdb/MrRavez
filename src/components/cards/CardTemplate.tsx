"use client";

import { ReactNode } from "react";
import { paddingDefaults } from "@/components/glass/styles";
import styles from "./CardTemplate.module.css";

interface CardTemplateProps {
	title: string;
	children: ReactNode;
	/** Additional gap between title and content (default from config) */
	contentGap?: number;
}

/**
 * Shared card template for consistent styling across all cards
 * Follows Open/Closed Principle - gap is configurable via props
 */
export function CardTemplate({ title, children, contentGap = paddingDefaults.cardGap }: CardTemplateProps) {
	return (
		<div className={styles.content} style={{ gap: `${contentGap}px` }}>
			<h1 className={styles.title}>
				{title}
			</h1>
			{children}
		</div>
	);
}
