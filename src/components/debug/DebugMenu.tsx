"use client";

import { useState, useEffect } from "react";
import { Menu, X, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useDebugSafe, type DebugState } from "./DebugContext";

interface ToggleItem {
	key: keyof Omit<DebugState, "enabled">;
	label: string;
	description?: string;
}

const toggleItems: ToggleItem[] = [
	{
		key: "showCollisionArea",
		label: "Collision Area",
		description: "Red cells showing orb bodies",
	},
	{
		key: "showAvoidanceArea",
		label: "Avoidance Area",
		description: "Yellow cells showing proximity zones",
	},
	{
		key: "enableSpawnOnClick",
		label: "Spawn on Click",
		description: "Click to place orbs + green hover cell",
	},
	{
		key: "showArrowVector",
		label: "Arrow Vectors",
		description: "Velocity arrows on orbs",
	},
	{
		key: "showGrid",
		label: "Grid Lines",
		description: "Spatial grid visualization",
	},
	{
		key: "showGraphics",
		label: "Orb Graphics",
		description: "Visual orb rendering",
	},
	{
		key: "showCards",
		label: "Cards",
		description: "Card carousel visibility",
	},
];

/**
 * Toggle row component for consistent styling
 */
function ToggleRow({
	item,
	checked,
	onToggle,
}: {
	item: ToggleItem;
	checked: boolean;
	onToggle: () => void;
}) {
	return (
		<div className="flex items-center justify-between py-2">
			<div className="flex flex-col gap-0.5">
				<span className="text-sm font-medium text-foreground">{item.label}</span>
				{item.description && (
					<span className="text-xs text-muted-foreground">{item.description}</span>
				)}
			</div>
			<Switch checked={checked} onCheckedChange={onToggle} />
		</div>
	);
}

/**
 * Desktop panel content
 */
function DebugPanelContent() {
	const debug = useDebugSafe();

	// Should not happen if DebugMenu checks for context first
	if (!debug) return null;

	const { state, toggle } = debug;

	return (
		<div className="flex flex-col gap-1">
			{toggleItems.map((item) => (
				<ToggleRow
					key={item.key}
					item={item}
					checked={state[item.key]}
					onToggle={() => toggle(item.key)}
				/>
			))}
		</div>
	);
}

/**
 * Desktop debug panel - fixed position
 */
function DesktopPanel() {
	return (
		<div
			className="fixed top-4 right-4 z-1001 w-64 rounded-lg border border-border/50 bg-card/95 p-4 shadow-lg backdrop-blur-md"
			style={{ fontFamily: "var(--font-mono), monospace" }}
		>
			<div className="mb-3 flex items-center gap-2 border-b border-border/50 pb-2">
				<Bug className="size-4 text-primary" />
				<span className="text-sm font-semibold text-foreground">Debug Panel</span>
			</div>
			<DebugPanelContent />
		</div>
	);
}

/**
 * Mobile hamburger button + Sheet
 */
function MobileSheet() {
	const [open, setOpen] = useState(false);

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>
				<Button
					variant="outline"
					size="icon"
					className="fixed top-4 right-4 z-1001 size-10 rounded-full border-border/50 bg-card/95 backdrop-blur-md"
				>
					{open ? <X className="size-5" /> : <Menu className="size-5" />}
					<span className="sr-only">Toggle debug menu</span>
				</Button>
			</SheetTrigger>
			<SheetContent
				side="right"
				className="w-80 border-border/50 bg-card/98 backdrop-blur-md"
			>
				<SheetHeader>
					<SheetTitle className="flex items-center gap-2">
						<Bug className="size-4 text-primary" />
						Debug Panel
					</SheetTitle>
				</SheetHeader>
				<div className="mt-4 px-1">
					<DebugPanelContent />
				</div>
			</SheetContent>
		</Sheet>
	);
}

/**
 * Main DebugMenu component
 * Shows desktop panel on larger screens, hamburger menu on mobile
 */
export function DebugMenu() {
	const debug = useDebugSafe();
	const [isMobile, setIsMobile] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		checkMobile();
		window.addEventListener("resize", checkMobile);
		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	// Don't render until mounted to avoid hydration mismatch
	if (!mounted) return null;

	// Don't render if no debug context (not in debug mode)
	if (!debug) return null;

	// Only show when debug mode is enabled
	if (!debug.state.enabled) return null;

	return isMobile ? <MobileSheet /> : <DesktopPanel />;
}
