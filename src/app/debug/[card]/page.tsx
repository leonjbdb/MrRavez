"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { DebugProvider } from "@/components/debug";
import { HomePage } from "../../homepage/components";
import { cardIdToIndex, validCardIds } from "@/config/cards.config";

interface DebugCardPageProps {
	params: Promise<{ card: string }>;
}

/**
 * Debug mode route with specific card - displays homepage with debug panel enabled
 * and starts at the specified card section.
 * URL: /debug/about, /debug/links, /debug/contact
 */
export default function DebugCardPage({ params }: DebugCardPageProps) {
	const { card } = use(params);

	// Validate card parameter using centralized config
	if (!validCardIds.has(card)) {
		notFound();
	}

	const initialSection = cardIdToIndex[card];

	return (
		<DebugProvider initialEnabled={true} initialCard={card}>
			<HomePage initialSection={initialSection} />
		</DebugProvider>
	);
}
