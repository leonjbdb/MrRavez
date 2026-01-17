"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { DebugProvider } from "@/components/debug";
import { HomePage } from "../../homepage/components";

// Map card slugs to section indices
const cardToSection: Record<string, number> = {
	about: 0,
	links: 1,
	contact: 2,
};

// Valid card slugs
const validCards = Object.keys(cardToSection);

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

	// Validate card parameter
	if (!validCards.includes(card)) {
		notFound();
	}

	const initialSection = cardToSection[card];

	return (
		<DebugProvider initialEnabled={true} initialCard={card}>
			<HomePage initialSection={initialSection} />
		</DebugProvider>
	);
}
