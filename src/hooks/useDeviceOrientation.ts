import { useEffect, useState, useRef } from "react";

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, value));
}

interface DeviceOrientation {
	tiltX: number;       // Calibrated: 0.5 = initial position
	tiltY: number;       // Calibrated: 0.5 = initial position
	rawTiltX: number;    // Absolute: 0.5 = device flat
	rawTiltY: number;    // Absolute: 0.5 = device flat
	hasPermission: boolean;
}

// Throttle interval in ms (20fps = 50ms between updates)
const THROTTLE_INTERVAL_MS = 50;

export function useDeviceOrientation(): DeviceOrientation {
	const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
	const [hasPermission, setHasPermission] = useState(false);

	// Ref to track last update time for throttling
	const lastUpdateRef = useRef<number>(0);
	// Ref to store pending orientation data
	const pendingOrientationRef = useRef<{ beta: number; gamma: number } | null>(null);
	// Ref for throttle timeout
	const throttleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// State to store initial orientation for calibration (null until first reading)
	const [initialOrientation, setInitialOrientation] = useState<{ beta: number; gamma: number } | null>(null);

	useEffect(() => {
		const handleOrientation = (e: DeviceOrientationEvent) => {
			if (e.beta === null || e.gamma === null) return;

			const now = Date.now();
			const timeSinceLastUpdate = now - lastUpdateRef.current;

			// Capture initial orientation on first valid reading
			if (initialOrientation === null) {
				setInitialOrientation({
					beta: clamp(e.beta, -45, 45),
					gamma: clamp(e.gamma, -45, 45),
				});
			}

			// Store the latest orientation data
			pendingOrientationRef.current = {
				beta: clamp(e.beta, -45, 45),
				gamma: clamp(e.gamma, -45, 45),
			};

			// If enough time has passed, update immediately
			if (timeSinceLastUpdate >= THROTTLE_INTERVAL_MS) {
				lastUpdateRef.current = now;
				setOrientation(pendingOrientationRef.current);
				pendingOrientationRef.current = null;

				// Clear any pending timeout
				if (throttleTimeoutRef.current) {
					clearTimeout(throttleTimeoutRef.current);
					throttleTimeoutRef.current = null;
				}
			} else if (!throttleTimeoutRef.current) {
				// Schedule an update for when the throttle period ends
				const delay = THROTTLE_INTERVAL_MS - timeSinceLastUpdate;
				throttleTimeoutRef.current = setTimeout(() => {
					if (pendingOrientationRef.current) {
						lastUpdateRef.current = Date.now();
						setOrientation(pendingOrientationRef.current);
						pendingOrientationRef.current = null;
					}
					throttleTimeoutRef.current = null;
				}, delay);
			}
		};

		const requestPermission = async () => {
			// iOS 13+ requires permission for DeviceOrientationEvent
			const DOE = DeviceOrientationEvent as unknown as {
				new(): DeviceOrientationEvent;
				requestPermission?: () => Promise<'granted' | 'denied'>;
			};

			if (typeof DeviceOrientationEvent !== 'undefined' && DOE.requestPermission) {
				try {
					const permission = await DOE.requestPermission();
					if (permission === 'granted') {
						setHasPermission(true);
						window.addEventListener('deviceorientation', handleOrientation);
					}
				} catch { }
			} else if (typeof DeviceOrientationEvent !== 'undefined') {
				setHasPermission(true);
				window.addEventListener('deviceorientation', handleOrientation);
			}
		};

		const handleFirstTouch = () => {
			requestPermission();
			window.removeEventListener('touchstart', handleFirstTouch);
		};

		window.addEventListener('touchstart', handleFirstTouch);
		requestPermission();

		return () => {
			window.removeEventListener('deviceorientation', handleOrientation);
			window.removeEventListener('touchstart', handleFirstTouch);
			if (throttleTimeoutRef.current) {
				clearTimeout(throttleTimeoutRef.current);
			}
		};
	}, [initialOrientation]);

	// Calculate raw tilt values (absolute, 0.5 = device flat)
	const rawTiltX = (orientation.gamma + 45) / 90;
	const rawTiltY = (orientation.beta + 45) / 90;

	// Calculate calibrated tilt values (relative to initial position)
	let tiltX = rawTiltX;
	let tiltY = rawTiltY;

	if (initialOrientation !== null) {
		// Calculate offset from initial position
		const initialX = (initialOrientation.gamma + 45) / 90;
		const initialY = (initialOrientation.beta + 45) / 90;

		// Center around initial position (initial = 0.5)
		const offsetX = rawTiltX - initialX;
		const offsetY = rawTiltY - initialY;

		// Re-center to 0.5 and clamp to 0-1 range
		tiltX = clamp(0.5 + offsetX, 0, 1);
		tiltY = clamp(0.5 + offsetY, 0, 1);
	}

	return { tiltX, tiltY, rawTiltX, rawTiltY, hasPermission };
}
