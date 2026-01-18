export { useSpringAnimation, DEFAULT_SPRING_CONFIG } from './useSpringAnimation';
export type { UseSpringAnimationOptions, UseSpringAnimationResult, SpringConfig } from './useSpringAnimation';

export { useEntryExitAnimation } from './useEntryExitAnimation';
export type {
	UseEntryExitAnimationOptions,
	UseEntryExitAnimationResult,
	EntryAnimationConfig,
	ExitAnimationConfig,
} from './useEntryExitAnimation';

export { useTiltAnimation } from './useTiltAnimation';
export type { UseTiltAnimationOptions, UseTiltAnimationResult, TiltTarget } from './useTiltAnimation';

export { easings } from './easings';
export type { EasingFunction } from './easings';

export { buildEntryExitTransform } from './transformBuilder';
export type { AnimationTransform, TransformBuilderOptions } from './transformBuilder';
