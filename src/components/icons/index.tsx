import { ReactNode } from "react";
import { EmailIcon } from "./EmailIcon";
import { TwitchIcon } from "./TwitchIcon";
import { YouTubeIcon } from "./YouTubeIcon";
import { GitHubIcon } from "./GitHubIcon";

export { EmailIcon } from "./EmailIcon";
export { TwitchIcon } from "./TwitchIcon";
export { YouTubeIcon } from "./YouTubeIcon";
export { GitHubIcon } from "./GitHubIcon";

/**
 * Icon type identifiers used in site configuration
 */
export type IconType = "email" | "twitch" | "youtube" | "github";

/**
 * Get icon component by type identifier
 * @param iconType - The icon type from site configuration
 * @returns The corresponding icon component or null if not found
 */
export function getIconByType(iconType: string): ReactNode {
	switch (iconType) {
		case "email":
			return <EmailIcon />;
		case "twitch":
			return <TwitchIcon />;
		case "youtube":
			return <YouTubeIcon />;
		case "github":
			return <GitHubIcon />;
		default:
			return null;
	}
}
