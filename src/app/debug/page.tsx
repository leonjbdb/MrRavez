"use client";

import { DebugProvider } from "@/components/debug";
import { HomePage } from "../homepage/components";

/**
 * Debug mode route - displays homepage with debug panel enabled.
 * URL: /debug
 */
export default function DebugPage() {
	return (
		<DebugProvider initialEnabled={true}>
			<HomePage />
		</DebugProvider>
	);
}
