// =============================================================================
// GridAnimator - Animation Loop Controller
// =============================================================================

/**
 * Manages a requestAnimationFrame-based animation loop.
 *
 * Provides frame callbacks with both linear and eased progress values.
 * Uses cubic ease-out for smooth deceleration.
 *
 * Single Responsibility: Control animation timing and callbacks.
 */
export class GridAnimator {
	/** Current animation frame ID for cancellation. */
	private animationId: number | null = null;

	/** Timestamp when animation started. */
	private startTime: number | null = null;

	/** Whether the animation is currently running. */
	private isRunning: boolean = false;

	/**
	 * Creates a new GridAnimator instance.
	 *
	 * @param duration - Total animation duration in milliseconds.
	 * @param onUpdate - Callback fired each frame with progress values.
	 * @param onComplete - Optional callback fired when animation completes.
	 */
	constructor(
		private duration: number,
		private onUpdate: (progress: number, eased: number) => void,
		private onComplete?: () => void
	) {}

	/**
	 * Starts the animation loop.
	 * No-op if already running.
	 */
	start(): void {
		if (this.isRunning) return;
		this.isRunning = true;
		this.startTime = null;
		this.animationId = requestAnimationFrame(this.animate);
	}

	/**
	 * Stops the animation loop immediately.
	 * Cancels any pending animation frame.
	 */
	stop(): void {
		this.isRunning = false;
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	/**
	 * Internal animation frame handler.
	 * Calculates progress and applies cubic ease-out.
	 *
	 * @param timestamp - High-resolution timestamp from requestAnimationFrame.
	 */
	private animate = (timestamp: number): void => {
		if (!this.isRunning) return;

		if (this.startTime === null) {
			this.startTime = timestamp;
		}

		const elapsed = timestamp - this.startTime;
		const progress = Math.min(1, elapsed / this.duration);

		// Cubic ease-out: fast start, smooth deceleration
		const eased = 1 - Math.pow(1 - progress, 3);

		this.onUpdate(progress, eased);

		if (progress < 1) {
			this.animationId = requestAnimationFrame(this.animate);
		} else {
			this.isRunning = false;
			this.onComplete?.();
		}
	};
}
