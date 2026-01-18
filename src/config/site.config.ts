/**
 * Site configuration
 */

export const siteConfig = {
	identity: {
		name: "MrRavez",
		role: "Content Creator & Photographer"
	},

	links: [
		{
			label: "Twitch",
			href: "https://www.twitch.tv/mrravez",
			icon: "twitch",
		},
		{
			label: "YouTube",
			href: "https://www.youtube.com/@MrRavez69",
			icon: "youtube",
		}
	],

	contact: {
		email_personal: "mrravez.ttv@gmail.com"
	},
} as const;

export type SiteConfig = typeof siteConfig;
export type LinkItem = (typeof siteConfig.links)[number];
