/**
 * GlassDebugMenu - SOLID-compliant debug menu component
 * 
 * Refactored structure:
 * - Main component orchestrates sub-components
 * - Configuration extracted to config file
 * - Types split into focused interfaces
 * - State management uses debugStorage abstraction
 * - Sub-components extracted for testability
 */

export { GlassDebugMenu } from "./GlassDebugMenu";
export type { GlassDebugMenuProps, OrbDebugProps, GridDebugProps, ToggleItem } from "./types";
