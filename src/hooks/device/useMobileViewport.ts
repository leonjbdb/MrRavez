"use client";

import { useState, useEffect } from "react";

/**
 * Hook to detect if the device is mobile based on viewport width
 * Follows Single Responsibility Principle - only detects viewport size
 */
export function useMobileViewport(breakpoint: number = 768): boolean {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < breakpoint);
		};

		// Initial check
		checkMobile();

		// Listen for resize
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, [breakpoint]);

	return isMobile;
}
