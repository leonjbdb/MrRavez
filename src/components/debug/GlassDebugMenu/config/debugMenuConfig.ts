/**
 * Configuration for GlassDebugMenu component
 * Follows Open/Closed Principle - extend by adding new config sections
 */

export const debugMenuConfig = {
	dimensions: {
		buttonSize: 44,
		buttonSizeMobile: 44,
		dropdownWidth: 280,
		panelWidth: 320,
		panelWidthMobile: 320,
		handleWidth: 20,
		trackWidth: 56,
		trackHeight: 28,
		handleHeight: 22,
		handleBorderRadius: 11,
		trackBorderRadius: 14,
		iconSize: 20,
		iconSizeMobile: 22,
	},
	zIndex: {
		backdrop: 9999,
		panel: 10000,
		button: 10001,
	},
	breakpoint: 768, // Mobile breakpoint in pixels
	spacing: {
		padding: 16,
		paddingMobile: 16,
		buttonTop: 16,
		buttonLeft: 16,
		buttonRight: 16,
		dropdownTop: 48,
		panelTopMobile: 72, // Space for button
	},
	transitions: {
		transform: "transform 0.3s ease",
		scale: "transform 0.2s",
		background: "background 0.3s ease",
	},
	colors: {
		maroon: "rgba(78, 5, 6, 0.4)", // Active state
		maroonAccent: "rgba(78, 5, 6, 0.8)", // Slider accent
		maroonButton: "rgba(170, 17, 17, 0.6)", // Delete button
	},
} as const;
