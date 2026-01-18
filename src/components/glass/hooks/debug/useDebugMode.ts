"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebugSafe } from "@/components/debug/DebugContext";
import { debugStorage } from "@/lib/storage";

export interface UseDebugModeOptions {
	/** Callback when debug mode is toggled */
	onToggle?: (enabled: boolean) => void;
}

export interface UseDebugModeResult {
	/** Whether debug mode is currently enabled */
	isEnabled: boolean;
	/** Whether debug mode was active at any point this session */
	wasActiveThisSession: boolean;
	/** Toggle debug mode on/off */
	toggle: () => void;
	/** Set debug mode to specific value */
	setEnabled: (enabled: boolean) => void;
}

/**
 * Hook for managing debug mode state
 * Follows Single Responsibility Principle - only handles debug mode state
 * Follows Dependency Inversion Principle - depends on debugStorage abstraction
 * 
 * Handles:
 * - Debug mode state management
 * - Persistence via storage abstraction
 * - Synchronization with debug context
 * - Session tracking
 */
export function useDebugMode(options: UseDebugModeOptions = {}): UseDebugModeResult {
	const { onToggle } = options;
	const debugContext = useDebugSafe();

	const [isEnabled, setIsEnabled] = useState(false);
	const [wasActiveThisSession, setWasActiveThisSession] = useState(false);

	// Set debug mode with side effects
	const setDebugMode = useCallback((newValue: boolean) => {
		if (newValue === isEnabled) return;

		setIsEnabled(newValue);

		// Persist to storage
		debugStorage.setEnabled(newValue);

		// Update debug context if available
		if (debugContext) {
			debugContext.setEnabled(newValue);
		}

		// Track if debug mode was ever active
		if (newValue) {
			setWasActiveThisSession(true);
		}

		// Notify callback
		onToggle?.(newValue);
	}, [isEnabled, debugContext, onToggle]);

	// Sync with debug context if available
	useEffect(() => {
		if (debugContext) {
			const enabled = debugContext.state.enabled;
			queueMicrotask(() => {
				setIsEnabled(enabled);
				if (enabled) {
					setWasActiveThisSession(true);
				}
			});
		}
	}, [debugContext]);

	// Initialize from storage on mount (fallback when no context)
	useEffect(() => {
		if (!debugContext) {
			const stored = debugStorage.getEnabled();
			queueMicrotask(() => {
				setIsEnabled(stored);
				if (stored) {
					setWasActiveThisSession(true);
				}
			});
		}
	}, [debugContext]);

	const toggle = useCallback(() => {
		setDebugMode(!isEnabled);
	}, [isEnabled, setDebugMode]);

	return {
		isEnabled,
		wasActiveThisSession,
		toggle,
		setEnabled: setDebugMode,
	};
}
