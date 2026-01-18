// Main glass component exports
export { GlassCard, GlassCardBackground, GlassCardContent } from './components/GlassCard';
export { GlassButton, GLASS_BUTTON_SELECTOR } from './components/GlassButton';
export { GlassSlider, SliderTrack, SliderHandle } from './components/GlassSlider';
export { HoverablePhoto, DEFAULT_PHOTO_SIZE } from './components/HoverablePhoto';

// Types
export type {
	GlassStyleProps,
	AnimationProps,
	MobileProps,
	Wheel3DProps,
	GlassCardProps,
	GlassButtonProps,
	SliderConfig,
} from './types';
export { DEFAULT_SLIDER_CONFIG } from './types';

// Styles
export {
	glassStyles,
	combineGlassStyles,
	topEdgeHighlight,
	animationTimings,
	interactionDefaults,
	visibilityDefaults,
	borderRadiusDefaults,
	paddingDefaults,
} from './styles';

// Hooks - Animation
export {
	useSpringAnimation,
	useEntryExitAnimation,
	useTiltAnimation,
	easings,
	buildEntryExitTransform,
	DEFAULT_SPRING_CONFIG,
} from './hooks/animation';
export type {
	UseSpringAnimationOptions,
	UseSpringAnimationResult,
	SpringConfig,
	UseEntryExitAnimationOptions,
	UseEntryExitAnimationResult,
	EntryAnimationConfig,
	ExitAnimationConfig,
	UseTiltAnimationOptions,
	UseTiltAnimationResult,
	TiltTarget,
	EasingFunction,
	AnimationTransform,
	TransformBuilderOptions,
} from './hooks/animation';

// Hooks - Interaction
export {
	useInteraction3D,
	useDragInteraction,
	useMouseProximity,
} from './hooks/interaction';
export type {
	UseInteraction3DOptions,
	UseInteraction3DResult,
	UseDragInteractionOptions,
	UseDragInteractionResult,
	UseMouseProximityOptions,
	MouseProximityResult,
} from './hooks/interaction';

// Hooks - Visibility
export {
	useDelayedVisibility,
	useOpacityVisibility,
} from './hooks/visibility';
export type {
	UseDelayedVisibilityOptions,
	UseDelayedVisibilityResult,
	UseOpacityVisibilityOptions,
	UseOpacityVisibilityResult,
} from './hooks/visibility';

// Hooks - Tilt
export {
	useCardTilt,
	calculateOrientationTilt,
} from './hooks/tilt';
export type {
	UseCardTiltOptions,
	UseCardTiltResult,
} from './hooks/tilt';

// Hooks - Debug
export {
	useDebugMode,
} from './hooks/debug';
export type {
	UseDebugModeOptions,
	UseDebugModeResult,
} from './hooks/debug';
