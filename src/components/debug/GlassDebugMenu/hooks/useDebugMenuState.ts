"use client";

import { useState, useEffect, useCallback } from "react";
import { useDebugSafe, type DebugState } from "../../DebugContext";
import { debugStorage } from "@/lib/storage";

/**
 * State management hook for GlassDebugMenu
 * Follows Dependency Inversion Principle - uses debugStorage abstraction
 * Follows Single Responsibility Principle - only handles debug menu state
 */
export function useDebugMenuState() {
	const debugContext = useDebugSafe();
	const [isDebugEnabled, setIsDebugEnabled] = useState(() =>
		debugStorage.getEnabled()
	);
	const [localState, setLocalState] = useState<Omit<DebugState, "enabled">>({
		showCollisionArea: true,
		showAvoidanceArea: true,
		enableSpawnOnClick: true,
		showGraphics: true,
		showCards: true,
		showArrowVector: true,
		showTruePosition: true,
		showGrid: true,
		enableOrbSpawning: true,
		enableOrbDespawning: true,
		pausePhysics: false,
		disableCollisions: false,
		disableAvoidance: false,
	});

	// Subscribe to storage changes
	useEffect(() => {
		return debugStorage.subscribe(setIsDebugEnabled);
	}, []);

	// Toggle a specific debug option
	const handleToggle = useCallback((key: keyof Omit<DebugState, "enabled">) => {
		if (debugContext) {
			debugContext.toggle(key);
		} else {
			setLocalState(prev => {
				const newState = { ...prev, [key]: !prev[key] };
				// Defer event dispatch to avoid setState during render
				queueMicrotask(() => {
					window.dispatchEvent(
						new CustomEvent("debugOptionChanged", {
							detail: { key, value: newState[key] }
						})
					);
				});
				return newState;
			});
		}
	}, [debugContext]);

	// Get effective debug state
	const debugEnabled = debugContext?.state.enabled || isDebugEnabled;
	const state = debugContext?.state || { ...localState, enabled: true };

	return {
		isDebugEnabled: debugEnabled,
		state,
		handleToggle,
	};
}
