/**
 * Transform builder utility
 * Builds CSS transform strings for entry/exit animations
 * Follows Single Responsibility Principle - only builds transform strings
 */

export interface AnimationTransform {
	scale: number;
	translateY: number;
	rotateX: number;
}

export interface TransformBuilderOptions {
	/** Horizontal offset in vw units */
	horizontalOffset?: number;
	/** Additional vertical shift (e.g., for mobile) */
	verticalShift?: string;
	/** Whether to center the element */
	centered?: boolean;
}

/**
 * Build a CSS transform string for entry/exit animation
 */
export function buildEntryExitTransform(
	animation: AnimationTransform,
	options: TransformBuilderOptions = {}
): string {
	const {
		horizontalOffset = 0,
		verticalShift = "",
		centered = true,
	} = options;

	const { scale, translateY, rotateX } = animation;

	if (centered) {
		const verticalPart = verticalShift
			? `calc(-50% + ${translateY}px ${verticalShift})`
			: `calc(-50% + ${translateY}px)`;

		return `
			translate3d(calc(-50% + ${horizontalOffset}vw), ${verticalPart}, 0)
			scale3d(${scale}, ${scale}, 1)
			rotateX(${rotateX}deg)
		`.replace(/\s+/g, ' ').trim();
	}

	return `
		translate3d(${horizontalOffset}vw, ${translateY}px, 0)
		scale3d(${scale}, ${scale}, 1)
		rotateX(${rotateX}deg)
	`.replace(/\s+/g, ' ').trim();
}
