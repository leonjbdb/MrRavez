/**
 * Orientation calibration utilities
 * Follows Single Responsibility Principle - only handles calibration math
 */

export interface OrientationData {
	beta: number;
	gamma: number;
}

export interface CalibrationResult {
	tiltX: number;
	tiltY: number;
	rawTiltX: number;
	rawTiltY: number;
}

/**
 * Calculate calibrated tilt values from raw orientation and calibration point
 */
export function calculateCalibratedTilt(
	orientation: OrientationData,
	calibration: OrientationData | null
): CalibrationResult {
	// Calculate raw tilt values (absolute, 0.5 = device flat)
	const rawTiltX = (orientation.gamma + 45) / 90;
	const rawTiltY = (orientation.beta + 90) / 180;

	// Calculate calibrated tilt values (relative to calibration point)
	let tiltX = rawTiltX;
	let tiltY = rawTiltY;

	if (calibration !== null) {
		// Calculate offset from calibration position
		const calX = (calibration.gamma + 45) / 90;
		const calY = (calibration.beta + 90) / 180;

		// Center around calibration position (calibration = 0.5)
		const offsetX = rawTiltX - calX;
		const offsetY = rawTiltY - calY;

		// Circular clamping: limit magnitude to max radius
		const MAX_RADIUS = 0.5; // Max distance from center (allows full 0-1 range)
		const magnitude = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

		if (magnitude > MAX_RADIUS) {
			// Normalize to circle edge - smoothly slide along the boundary
			const scale = MAX_RADIUS / magnitude;
			tiltX = 0.5 + offsetX * scale;
			tiltY = 0.5 + offsetY * scale;
		} else {
			// Within circle - use values as-is
			tiltX = 0.5 + offsetX;
			tiltY = 0.5 + offsetY;
		}
	}

	return { tiltX, tiltY, rawTiltX, rawTiltY };
}
