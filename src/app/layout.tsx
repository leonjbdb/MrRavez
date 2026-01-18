import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components";

const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
	display: "swap",
});

export const metadata: Metadata = {
	title: "Leon",
	description: "Leon Joachim Buverud De Backer",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={jetbrainsMono.className}>
				<Providers>{children}</Providers>
			</body>
		</html>
	);
}
