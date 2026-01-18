import { ReactNode, CSSProperties } from 'react';

/**
 * Shared prop types for glass components
 */

export interface GlassStyleProps {
	/** Border radius in pixels */
	borderRadius?: number;
	/** Padding (string or number in px) */
	padding?: string | number;
	/** Custom className for styling overrides */
	className?: string;
	/** Custom inline styles */
	style?: CSSProperties;
}

export interface AnimationProps {
	/** Entry animation progress (0-1), 0 = hidden, 1 = fully visible */
	entryProgress?: number;
	/** Exit animation progress (0-1), 0 = visible, 1 = fully exited */
	exitProgress?: number;
	/** Opacity value (0-1) */
	opacity?: number;
}

export interface MobileProps {
	/** Mobile horizontal offset in vw units for swipe animation */
	mobileOffset?: number;
	/** Mobile scale for carousel effect (0.85-1.0) */
	mobileScale?: number;
	/** Mobile-specific border radius (applied at max-width: 480px) */
	mobileBorderRadius?: number;
	/** Mobile-specific padding (applied at max-width: 480px) */
	mobilePadding?: string | number;
}

export interface Wheel3DProps {
	/** 3D wheel rotation around Y axis (degrees) for mobile carousel */
	wheelRotateY?: number;
	/** 3D wheel horizontal translation (px) for mobile carousel */
	wheelTranslateX?: number;
	/** 3D wheel depth translation (px) for mobile carousel */
	wheelTranslateZ?: number;
}

export interface GlassCardProps extends GlassStyleProps, AnimationProps, MobileProps, Wheel3DProps {
	children?: ReactNode;
	/** Optional aria-label for the card */
	ariaLabel?: string;
}

export interface GlassButtonProps {
	icon: ReactNode;
	label: string;
	href: string;
	target?: string;
	rel?: string;
}

export interface SliderConfig {
	/** Track width in pixels */
	trackWidth: number;
	/** Track height in pixels */
	trackHeight: number;
	/** Handle width in pixels */
	handleWidth: number;
	/** Handle height in pixels */
	handleHeight: number;
	/** Padding inside track in pixels */
	padding: number;
}

export const DEFAULT_SLIDER_CONFIG: SliderConfig = {
	trackWidth: 280,
	trackHeight: 56,
	handleWidth: 64,
	handleHeight: 44,
	padding: 6,
};

/**
 * Selector constant for glass buttons (used by keyboard navigation)
 */
export const GLASS_BUTTON_SELECTOR = 'glass-button-link';
