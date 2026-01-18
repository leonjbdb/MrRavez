"use client";

import { useState, useEffect } from "react";
import { attributionConfig } from "../config/attributionConfig";

/**
 * Hook to detect if the current host should hide the attribution
 * 
 * Follows Single Responsibility Principle:
 * - Only handles host detection logic
 * - Returns whether attribution should be visible
 * 
 * @returns Object containing visibility state and loading state
 */
export function useHostDetection() {
	const [shouldHide, setShouldHide] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	useEffect(() => {
		const currentHost = window.location.hostname.toLowerCase();
		const isHiddenHost = attributionConfig.hiddenHosts.some(
			(host) => currentHost === host.toLowerCase()
		);

		// Use queueMicrotask to avoid synchronous setState in effect
		queueMicrotask(() => {
			setShouldHide(isHiddenHost);
			setIsLoaded(true);
		});
	}, []);

	return {
		/** Whether the attribution should be hidden */
		shouldHide,
		/** Whether the host detection has completed */
		isLoaded,
		/** Convenience: whether attribution should be visible */
		shouldShow: isLoaded && !shouldHide,
	};
}
