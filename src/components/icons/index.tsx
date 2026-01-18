import { ReactNode } from "react";
import { EmailIcon } from "./EmailIcon";
import { GitHubIcon } from "./GitHubIcon";
import { LinkedInIcon } from "./LinkedInIcon";
import { UiOIcon } from "./UiOIcon";

export { EmailIcon } from "./EmailIcon";
export { GitHubIcon } from "./GitHubIcon";
export { LinkedInIcon } from "./LinkedInIcon";
export { UiOIcon } from "./UiOIcon";

/**
 * Icon type identifiers used in site configuration
 */
export type IconType = "email" | "github" | "linkedin" | "uio";

/**
 * Get icon component by type identifier
 * @param iconType - The icon type from site configuration
 * @returns The corresponding icon component or null if not found
 */
export function getIconByType(iconType: string): ReactNode {
	switch (iconType) {
		case "email":
			return <EmailIcon />;
		case "github":
			return <GitHubIcon />;
		case "linkedin":
			return <LinkedInIcon />;
		case "uio":
			return <UiOIcon />;
		default:
			return null;
	}
}
