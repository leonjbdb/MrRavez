// =============================================================================
// Orb Field - 3D Spatial Grid System
// =============================================================================

// Core Grid System
export { SpatialGrid } from './grid/core/SpatialGrid';
export { GridConfigFactory } from './grid/core/GridConfigFactory';
export { ViewportCellsFactory } from './grid/core/ViewportCellsFactory';
export { type GridConfig, type ViewportCells } from './grid/types';

// Core Orb System
export { OrbPhysics } from './orb/core/OrbPhysics';
export { useOrbManager } from './orb/hooks/useOrbManager';
export { type Orb } from './orb/types';

// Shared Types
export {
	CELL_EMPTY,
	CELL_PROXIMITY,
	CELL_FILLED,
	type CellState,
} from './shared/types';

// Configuration
export {
	DEFAULT_GRID_CONFIG,
	DEFAULT_REVEAL_CONFIG,
	DEFAULT_STYLE_CONFIG,
	DEFAULT_ORBFIELD_CONFIG,
	type GridSystemConfig,
	type GridRevealConfig,
	type GridStyleConfig,
	type OrbFieldConfig,
} from './shared/config';
export {
	DEFAULT_ORB_SPAWN_CONFIG,
	DEFAULT_ORB_DEBUG_CONFIG,
	type OrbSpawnConfig,
	type OrbDebugVisualConfig,
} from './orb/config';

// Visualization
export { default as GridView } from './OrbField';
export { OrbField } from './OrbField';
export { GridRenderer } from './grid/visuals/GridRenderer';
export { GridAnimator } from './grid/visuals/GridAnimator';

// Debug Components
export { OrbDebugPanel } from './debug-info/components/OrbDebugPanel';
export { GridDebugPanel } from './debug-info/components/GridDebugPanel';
