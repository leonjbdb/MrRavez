"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Settings, X } from "lucide-react";
import { useDebugSafe, type DebugState } from "./DebugContext";

interface ToggleItem {
	key: keyof Omit<DebugState, "enabled">;
	label: string;
	description?: string;
}

const toggleItems: ToggleItem[] = [
	{ key: "showGrid", label: "Grid Lines", description: "Spatial grid visualization" },
	{ key: "showCollisionArea", label: "Collision Area", description: "Red cells showing orb bodies" },
	{ key: "showAvoidanceArea", label: "Avoidance Area", description: "Yellow cells showing proximity zones" },
	{ key: "showGraphics", label: "Orb Graphics", description: "Visual orb rendering" },
	{ key: "pausePhysics", label: "Pause Physics", description: "Freeze orb movement" },
	{ key: "enableOrbSpawning", label: "Orb Spawning", description: "Continuous orb spawning" },
	{ key: "enableOrbDespawning", label: "Orb Despawning", description: "Lifetime expiration" },
	{ key: "enableSpawnOnClick", label: "Click to Create", description: "Click to spawn orbs" },
	{ key: "showCards", label: "Show Cards", description: "Card carousel visibility" },
];

const defaultState: Omit<DebugState, "enabled"> = {
	showCollisionArea: true,
	showAvoidanceArea: true,
	enableSpawnOnClick: true,
	showGraphics: true,
	showCards: true,
	showArrowVector: true,
	showGrid: true,
	enableOrbSpawning: true,
	enableOrbDespawning: true,
	pausePhysics: false,
};

/**
 * Toggle slider component - similar to GlassSlider but smaller
 */
function ToggleSlider({ checked, onToggle }: { checked: boolean; onToggle: () => void }) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [position, setPosition] = useState(checked ? 1 : 0);
	const [isDragging, setIsDragging] = useState(false);
	const dragStartRef = useRef<{ x: number; startPosition: number } | null>(null);

	// Sync position with checked state
	useEffect(() => {
		setPosition(checked ? 1 : 0);
	}, [checked]);

	const calculatePosition = useCallback((clientX: number): number => {
		if (!trackRef.current) return position;
		const rect = trackRef.current.getBoundingClientRect();
		const handleWidth = 20;
		const padding = 3;
		const trackWidth = rect.width - handleWidth - (padding * 2);
		const trackLeft = rect.left + padding;
		const relativeX = clientX - trackLeft - (handleWidth / 2);
		return Math.max(0, Math.min(1, relativeX / trackWidth));
	}, [position]);

	const handleDragStart = useCallback((clientX: number) => {
		setIsDragging(true);
		dragStartRef.current = { x: clientX, startPosition: position };
	}, [position]);

	const handleDragMove = useCallback((clientX: number) => {
		if (!isDragging || !dragStartRef.current) return;
		const newPosition = calculatePosition(clientX);
		setPosition(newPosition);
	}, [isDragging, calculatePosition]);

	const handleDragEnd = useCallback(() => {
		if (!isDragging) return;
		setIsDragging(false);
		dragStartRef.current = null;
		const shouldBeOn = position > 0.5;
		setPosition(shouldBeOn ? 1 : 0);
		if (shouldBeOn !== checked) {
			onToggle();
		}
	}, [isDragging, position, checked, onToggle]);

	useEffect(() => {
		if (!isDragging) return;
		const handleMouseMove = (e: MouseEvent) => {
			e.preventDefault();
			handleDragMove(e.clientX);
		};
		const handleMouseUp = () => handleDragEnd();
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		return () => {
			document.removeEventListener("mousemove", handleMouseMove);
			document.removeEventListener("mouseup", handleMouseUp);
		};
	}, [isDragging, handleDragMove, handleDragEnd]);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onToggle();
	};

	const handleWidth = 20;
	const padding = 3;
	const handleLeft = `calc(${padding}px + ${position} * (100% - ${handleWidth}px - ${padding * 2}px))`;

	return (
		<div
			ref={trackRef}
			onClick={handleClick}
			style={{
				position: "relative",
				width: "56px",
				height: "28px",
				borderRadius: "14px",
				background: position > 0.5 
					? "rgba(78, 5, 6, 0.4)"  // Maroon when on
					: "rgba(255, 255, 255, 0.1)",
				border: "1px solid rgba(255, 255, 255, 0.15)",
				cursor: "pointer",
				transition: "background 0.3s ease",
				flexShrink: 0,
			}}
		>
			<div
				onMouseDown={(e) => {
					e.preventDefault();
					e.stopPropagation();
					handleDragStart(e.clientX);
				}}
				style={{
					position: "absolute",
					top: "50%",
					left: handleLeft,
					transform: "translateY(-50%)",
					width: handleWidth,
					height: "22px",
					borderRadius: "11px",
					background: position > 0.5 
						? "rgba(255, 255, 255, 0.9)"
						: "rgba(255, 255, 255, 0.6)",
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
					cursor: isDragging ? "grabbing" : "grab",
					transition: isDragging ? "none" : "left 0.3s ease, background 0.3s ease",
				}}
			/>
		</div>
	);
}

/**
 * Toggle row with slider
 */
function ToggleRow({ item, checked, onToggle }: {
	item: ToggleItem;
	checked: boolean;
	onToggle: () => void;
}) {
	return (
		<div style={{ 
			display: "flex", 
			alignItems: "center", 
			justifyContent: "space-between", 
			paddingTop: "8px",
			paddingBottom: "8px",
			gap: "12px",
		}}>
			<div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
				<span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255, 255, 255, 0.9)" }}>
					{item.label}
				</span>
				{item.description && (
					<span style={{ fontSize: "10px", color: "rgba(255, 255, 255, 0.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
						{item.description}
					</span>
				)}
			</div>
			<ToggleSlider checked={checked} onToggle={onToggle} />
		</div>
	);
}

/**
 * Glass-styled debug menu with slider toggles
 */
export function GlassDebugMenu() {
	const debugContext = useDebugSafe();
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isDebugEnabled, setIsDebugEnabled] = useState(false);
	const [localState, setLocalState] = useState<Omit<DebugState, "enabled">>(defaultState);

	useEffect(() => {
		setMounted(true);
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem("debug-mode-enabled");
			setIsDebugEnabled(stored === "true");
		}
		
		const handleDebugModeChange = (e: CustomEvent) => {
			setIsDebugEnabled(e.detail.enabled);
		};
		
		const checkDebugMode = () => {
			if (typeof window !== 'undefined') {
				const stored = localStorage.getItem("debug-mode-enabled");
				setIsDebugEnabled(stored === "true");
			}
		};
		
		window.addEventListener("debugModeChanged", handleDebugModeChange as EventListener);
		window.addEventListener("storage", checkDebugMode);
		
		return () => {
			window.removeEventListener("debugModeChanged", handleDebugModeChange as EventListener);
			window.removeEventListener("storage", checkDebugMode);
		};
	}, []);

	const handleToggle = useCallback((key: keyof Omit<DebugState, "enabled">) => {
		if (debugContext) {
			debugContext.toggle(key);
		} else {
			setLocalState(prev => {
				const newState = { ...prev, [key]: !prev[key] };
				window.dispatchEvent(
					new CustomEvent("debugOptionChanged", { 
						detail: { key, value: newState[key] } 
					})
				);
				return newState;
			});
		}
	}, [debugContext]);

	if (!mounted) return null;

	const debugEnabled = debugContext?.state.enabled || isDebugEnabled;
	if (!debugEnabled) return null;

	const state = debugContext?.state || { ...localState, enabled: true };

	const glassStyles: React.CSSProperties = {
		background: "rgba(255, 255, 255, 0.08)",
		backdropFilter: "blur(24px) saturate(120%)",
		WebkitBackdropFilter: "blur(24px) saturate(120%)",
		border: "1px solid rgba(255, 255, 255, 0.15)",
		boxShadow: `
			0 25px 50px rgba(0, 0, 0, 0.25),
			0 10px 20px rgba(0, 0, 0, 0.15),
			inset 0 1px 0 rgba(255, 255, 255, 0.2),
			inset 0 -1px 0 rgba(0, 0, 0, 0.1)
		`,
	};

	return (
		<div
			style={{
				position: "fixed",
				top: "16px",
				left: "16px",
				zIndex: 9999,
				fontFamily: "var(--font-mono), monospace",
			}}
		>
			<button
				onClick={() => setIsOpen(!isOpen)}
				style={{
					...glassStyles,
					width: "40px",
					height: "40px",
					borderRadius: "50%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					cursor: "pointer",
					transition: "transform 0.2s",
				}}
				onMouseEnter={(e) => {
					e.currentTarget.style.transform = "scale(1.05)";
				}}
				onMouseLeave={(e) => {
					e.currentTarget.style.transform = "scale(1)";
				}}
				aria-label={isOpen ? "Close debug menu" : "Open debug menu"}
			>
				{isOpen ? (
					<X style={{ width: "20px", height: "20px", color: "rgba(255, 255, 255, 0.8)" }} />
				) : (
					<Settings style={{ width: "20px", height: "20px", color: "rgba(255, 255, 255, 0.8)" }} />
				)}
			</button>

			{isOpen && (
				<div
					style={{
						...glassStyles,
						position: "absolute",
						top: "48px",
						left: "0",
						width: "280px",
						borderRadius: "12px",
						padding: "12px",
						maxHeight: "calc(100vh - 80px)",
						overflowY: "auto",
					}}
				>
					<div style={{ marginBottom: "8px", paddingBottom: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<Settings style={{ width: "14px", height: "14px", color: "rgba(255, 255, 255, 0.7)" }} />
							<span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255, 255, 255, 0.9)" }}>
								Debug Options
							</span>
						</div>
					</div>

					<div style={{ display: "flex", flexDirection: "column" }}>
						{toggleItems.map((item) => (
							<ToggleRow
								key={item.key}
								item={item}
								checked={state[item.key]}
								onToggle={() => handleToggle(item.key)}
							/>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
