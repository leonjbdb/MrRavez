/**
 * Configuration for DebugGitHubButton component
 * Follows Open/Closed Principle - extend by adding new config values
 */

import packageJson from "@/../package.json";

export const debugGitHubButtonConfig = {
	dimensions: {
		buttonSize: 44, // Same as GlassDebugMenu for consistency
		iconSize: 20, // Same as GlassDebugMenu for consistency
	},
	zIndex: {
		button: 10001, // Same level as debug menu button
	},
	spacing: {
		buttonBottom: 16, // Bottom right positioning
		buttonRight: 16,
	},
	colors: {
		iconDefault: "rgba(255, 255, 255, 0.8)",
		iconHover: "var(--color-maroon)", // Maroon color on hover (fallback for SSR)
	},
	transitions: {
		scale: "transform 0.2s",
	},
	githubUrl: typeof packageJson.repository === "string"
		? packageJson.repository
		: packageJson.repository?.url,
} as const;
