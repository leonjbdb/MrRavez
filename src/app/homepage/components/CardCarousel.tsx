"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { GlassCard } from "@/components/glass";
import { useDebugSafe } from "@/components/debug";
import { cardsConfig } from "@/config/cards.config";
import type { AllSectionVisibility, SectionVisibility } from "../types";

interface CardCarouselProps {
	visibility: AllSectionVisibility;
	isReady: boolean;
	activeSection: number;
}

// Shared card wrapper styles
const cardWrapperStyle: React.CSSProperties = {
	position: "fixed",
	top: "50%",
	left: "50%",
	zIndex: 10,
	maxWidth: "480px",
	width: "calc(100% - 32px)",
};

/**
 * Wrapper component that applies GlassCard with animation props
 * Cards only handle content, this handles all animation/transition logic
 */
function AnimatedCard({
	children,
	visibility,
	padding,
	mobilePadding,
	mobileBorderRadius,
	ariaLabel,
}: {
	children: React.ReactNode;
	visibility: SectionVisibility;
	padding: string;
	mobilePadding: string;
	mobileBorderRadius: number;
	ariaLabel: string;
}) {
	return (
		<GlassCard
			style={cardWrapperStyle}
			padding={padding}
			borderRadius={60}
			mobileBorderRadius={mobileBorderRadius}
			mobilePadding={mobilePadding}
			opacity={visibility.opacity}
			entryProgress={visibility.entryProgress}
			exitProgress={visibility.exitProgress}
			mobileOffset={visibility.mobileOffset}
			mobileScale={visibility.mobileScale}
			wheelRotateY={visibility.wheelRotateY}
			wheelTranslateX={visibility.wheelTranslateX}
			wheelTranslateZ={visibility.wheelTranslateZ}
			ariaLabel={ariaLabel}
		>
			{children}
		</GlassCard>
	);
}

/**
 * Screen reader only styles for accessibility announcements
 */
const srOnlyStyle: React.CSSProperties = {
	position: 'absolute',
	width: '1px',
	height: '1px',
	padding: '0',
	margin: '-1px',
	overflow: 'hidden',
	clip: 'rect(0, 0, 0, 0)',
	whiteSpace: 'nowrap',
	borderWidth: '0',
};

/**
 * Renders all cards with their visibility states
 * Cards are rendered dynamically from cardsConfig with scroll-based animations
 * 
 * Animation/transition logic is handled here via GlassCard wrapper,
 * card components only handle their content
 */
export function CardCarousel({ visibility, isReady, activeSection }: CardCarouselProps) {
	// Track if cards have faded in (for initial appearance animation)
	const [hasFadedIn, setHasFadedIn] = useState(false);

	// Check debug context for showCards flag
	const debugContext = useDebugSafe();
	const [localShowCards, setLocalShowCards] = useState(true);

	// Use context value if available, otherwise use local state
	const showCards = debugContext?.state.showCards ?? localShowCards;

	// Create refs for each card container
	const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
	const previousActiveSectionRef = useRef<number>(activeSection);

	// Map card IDs to their visibility state
	const visibilityMap = useMemo(() => ({
		about: visibility.about,
		links: visibility.links,
		contact: visibility.contact,
	}), [visibility.about, visibility.links, visibility.contact]);

	useEffect(() => {
		if (isReady && !hasFadedIn) {
			// Double RAF + small timeout ensures browser has painted initial state
			const timer = requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setTimeout(() => {
						setHasFadedIn(true);
					}, 50);
				});
			});
			return () => cancelAnimationFrame(timer);
		}
	}, [isReady, hasFadedIn]);

	// Listen for debug option changes when context is not available
	useEffect(() => {
		const handleDebugOptionChange = (e: CustomEvent<{ key: string; value: boolean }>) => {
			if (e.detail.key === "showCards") {
				setLocalShowCards(e.detail.value);
			}
		};

		window.addEventListener("debugOptionChanged", handleDebugOptionChange as EventListener);
		return () => {
			window.removeEventListener("debugOptionChanged", handleDebugOptionChange as EventListener);
		};
	}, []);

	// Focus management: when switching cards, focus first focusable element if a button was focused
	useEffect(() => {
		// Only handle focus if the active section has changed
		if (previousActiveSectionRef.current === activeSection) {
			return;
		}

		const previousSection = previousActiveSectionRef.current;
		previousActiveSectionRef.current = activeSection;

		// Check if focus is currently on a button within a card
		const activeElement = document.activeElement as HTMLElement;
		const isButtonFocused = activeElement?.classList.contains('glass-button-link');
		const previousCard = document.querySelector(`[data-card-section="${previousSection}"]`);
		const wasFocusedInPreviousCard = previousCard?.contains(activeElement);

		// Only auto-focus if a button in the previous card was focused
		if (!isButtonFocused || !wasFocusedInPreviousCard) {
			return;
		}

		// Focus the first focusable element on the new card after a delay
		// to ensure the card transition has completed
		setTimeout(() => {
			// Query using data attribute
			const newCard = document.querySelector(`[data-card-section="${activeSection}"]`);
			if (!newCard) {
				return;
			}

			// Find all glass-button-link elements in the new card
			const focusableElements = newCard.querySelectorAll<HTMLElement>('.glass-button-link');

			if (focusableElements.length > 0) {
				focusableElements[0].focus();
			}
		}, 150);
	}, [activeSection]);

	// Don't render if not ready or showCards is disabled
	if (!isReady || !showCards) {
		return null;
	}

	// Wrapper style for initial fade-in animation
	const wrapperStyle: React.CSSProperties = {
		position: 'relative',
		zIndex: 10,
		opacity: hasFadedIn ? 1 : 0,
		transition: 'opacity 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
		willChange: 'opacity',
	};

	return (
		<div
			style={wrapperStyle}
			role="region"
			aria-roledescription="carousel"
			aria-label="Leon's Profile"
		>
			{/* Screen reader announcement for section changes */}
			<div className="sr-only" aria-live="polite" aria-atomic="true" style={srOnlyStyle}>
				{`Now showing: ${cardsConfig[activeSection]?.label || 'Section'} section`}
			</div>

			{/* Render cards dynamically from config */}
			{cardsConfig.map((cardConfig, index) => {
				const CardComponent = cardConfig.component;
				const cardVisibility = visibilityMap[cardConfig.id as keyof typeof visibilityMap];

				return (
					<div
						key={cardConfig.id}
						ref={(el) => { cardRefs.current[index] = el; }}
						data-card-section={index}
					>
						<AnimatedCard
							visibility={cardVisibility}
							padding={cardConfig.style.padding}
							mobilePadding={cardConfig.style.mobilePadding}
							mobileBorderRadius={cardConfig.style.mobileBorderRadius}
							ariaLabel={`${cardConfig.label} section`}
						>
							<CardComponent />
						</AnimatedCard>
					</div>
				);
			})}
		</div>
	);
}
