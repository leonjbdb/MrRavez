/**
 * Storage abstraction for debug mode persistence
 * Follows Dependency Inversion Principle - components depend on this interface,
 * not on concrete localStorage implementation
 */

const DEBUG_MODE_KEY = 'debug-mode-enabled';

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
			new CustomEvent('debugModeChanged', {
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
