/**
 * Storage abstraction for debug mode persistence
 * Follows Dependency Inversion Principle - components depend on this interface,
 * not on concrete localStorage implementation
 */

/**
 * Storage key for debug mode persistence
 * Exported to ensure single source of truth across the application
 */
export const DEBUG_MODE_KEY = 'debug-mode-enabled';

/**
 * Custom event names for debug system
 * Centralized to prevent typos and ensure consistency
 */
export const DEBUG_EVENTS = {
	MODE_CHANGED: 'debugModeChanged',
	OPTION_CHANGED: 'debugOptionChanged',
} as const;

export interface DebugStorageAdapter {
	getEnabled(): boolean;
	setEnabled(enabled: boolean): void;
	subscribe(callback: (enabled: boolean) => void): () => void;
}

/**
 * LocalStorage implementation of DebugStorageAdapter
 */
class LocalStorageDebugAdapter implements DebugStorageAdapter {
	private listeners: Set<(enabled: boolean) => void> = new Set();

	getEnabled(): boolean {
		if (typeof window === 'undefined') return false;
		const stored = localStorage.getItem(DEBUG_MODE_KEY);
		return stored === 'true';
	}

	setEnabled(enabled: boolean): void {
		if (typeof window === 'undefined') return;

		localStorage.setItem(DEBUG_MODE_KEY, String(enabled));

		// Dispatch custom event for cross-component communication
		window.dispatchEvent(
			new CustomEvent(DEBUG_EVENTS.MODE_CHANGED, {
				detail: { enabled }
			})
		);

		// Notify subscribers
		this.listeners.forEach(listener => listener(enabled));
	}

	subscribe(callback: (enabled: boolean) => void): () => void {
		this.listeners.add(callback);

		// Return unsubscribe function
		return () => {
			this.listeners.delete(callback);
		};
	}
}

/**
 * Singleton instance for app-wide use
 */
export const debugStorage: DebugStorageAdapter = new LocalStorageDebugAdapter();
