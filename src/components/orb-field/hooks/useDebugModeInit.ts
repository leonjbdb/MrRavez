"use client";

// =============================================================================
// useDebugModeInit - Initializes debug mode state
// =============================================================================

import { useState, useEffect } from 'react';
import { debugStorage, DEBUG_EVENTS } from '@/lib/storage';

/**
 * Return values from the debug mode init hook.
 */
export interface UseDebugModeInitReturn {
	/** Whether debug mode is currently enabled. */
	isDebugMode: boolean;
}

/**
 * Initializes debug mode state from debugStorage and listens for changes.
 * 
 * Single Responsibility: Debug mode initialization only.
 * Follows Dependency Inversion Principle: Uses debugStorage abstraction.
 */
export function useDebugModeInit(isDebugModeRef: React.RefObject<boolean>): UseDebugModeInitReturn {
	const [isDebugMode, setIsDebugMode] = useState(false);

	useEffect(() => {
		const getDebugMode = (): boolean => {
			if (typeof window === 'undefined') {
				return process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
			}
			const stored = debugStorage.getEnabled();
			if (stored) {
				return true;
			}
			return process.env.NEXT_PUBLIC_DEBUG_MODE === 'true';
		};

		const debugMode = getDebugMode();
		isDebugModeRef.current = debugMode;
		queueMicrotask(() => {
			setIsDebugMode(debugMode);
		});

		const handleDebugModeChange = (e: CustomEvent) => {
			const enabled = e.detail.enabled;
			isDebugModeRef.current = enabled;
			queueMicrotask(() => {
				setIsDebugMode(enabled);
			});
		};

		window.addEventListener(DEBUG_EVENTS.MODE_CHANGED, handleDebugModeChange as EventListener);

		return () => {
			window.removeEventListener(DEBUG_EVENTS.MODE_CHANGED, handleDebugModeChange as EventListener);
		};
	}, [isDebugModeRef]);

	return {
		isDebugMode,
	};
}
