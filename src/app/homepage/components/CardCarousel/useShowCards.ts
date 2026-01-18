/**
 * Hook for managing card visibility based on debug mode
 * Integrates with DebugContext and custom events
 */

import { useState, useEffect } from "react";
import { useDebugSafe } from "@/components/debug";
import { DEBUG_EVENTS } from "@/lib/storage";

export interface UseShowCardsState {
	showCards: boolean;
}

/**
 * Tracks whether cards should be shown based on debug mode settings
 * Integrates with debug context and falls back to local state + events
 */
export function useShowCards(): UseShowCardsState {
	const debugContext = useDebugSafe();
	const [localShowCards, setLocalShowCards] = useState(true);

	// Use context value if available, otherwise use local state
	const showCards = debugContext?.state.showCards ?? localShowCards;

	// Listen for debug option changes when context is not available
	useEffect(() => {
		const handleDebugOptionChange = (e: CustomEvent<{ key: string; value: boolean }>) => {
			if (e.detail.key === "showCards") {
				setLocalShowCards(e.detail.value);
			}
		};

		window.addEventListener(DEBUG_EVENTS.OPTION_CHANGED, handleDebugOptionChange as EventListener);
		return () => {
			window.removeEventListener(DEBUG_EVENTS.OPTION_CHANGED, handleDebugOptionChange as EventListener);
		};
	}, []);

	return { showCards };
}
