/**
 * Site configuration
 */

export const siteConfig = {
    identity: {
        name: "Leon Joachim Buverud De Backer",
		role: "Head Engineer",
		division: "AV and IoT",
		organization: "University of Oslo",
    },

    links: [
        {
            label: "GitHub (Work)",
            href: "https://github.com/leon-uio",
            icon: "github",
        },
        {
            label: "GitHub (Personal)",
            href: "https://github.com/leonjbdb",
            icon: "github",
        },
        {
            label: "LinkedIn",
            href: "https://www.linkedin.com/in/leon-joachim-buverud-de-backer-760346b8/",
            icon: "linkedin",
        },
        {
            label: "UiO Profile",
            href: "https://people.uio.no/leon",
            icon: "uio",
        },
    ],

    contact: {
        email_personal: "contact@de-backer.no",
		email_work: "l.j.b.de.backer@usit.uio.no",
    },
} as const;

export type SiteConfig = typeof siteConfig;
export type LinkItem = (typeof siteConfig.links)[number];
