"use client";

// =============================================================================
// useOrbManager - Custom hook for orb CRUD operations
// =============================================================================

import { useRef, useState, useCallback } from 'react';
import { type Orb } from '../types';
import { OrbPhysics } from '../core/OrbPhysics';
import { SpatialGrid } from '../../grid/core/SpatialGrid';
import { type ViewportCells } from '../../grid/types';
import { DEFAULT_ORB_SPAWN_CONFIG, type OrbSpawnConfig } from '../config';
import { CollisionSystem } from '../../collision/CollisionSystem';

interface UseOrbManagerOptions {
	/** Configuration for orb spawning. */
	spawnConfig?: Partial<OrbSpawnConfig>;
}

interface UseOrbManagerReturn {
	/** Ref to the internal orbs array for high-performance loop access. */
	orbsRef: React.MutableRefObject<Orb[]>;
	/** React state for orbs (for UI sync). */
	orbs: Orb[];
	/** Currently selected orb ID. */
	selectedOrbId: string | null;
	/** Currently selected orb data (real-time). */
	selectedOrbData: Orb | null;
	/** Ref for stable access to selected orb ID in loops. */
	selectedOrbIdRef: React.MutableRefObject<string | null>;
	/** Creates a new orb at the specified position. */
	createOrb: (pxX: number, pxY: number, layer: number, size: number, grid: SpatialGrid, vpc: ViewportCells) => void;
	/** Deletes an orb by ID. */
	deleteOrb: (id: string, grid: SpatialGrid, vpc: ViewportCells) => void;
	/** Selects an orb by ID. */
	selectOrb: (id: string | null) => void;
	/** Updates the selected orb data (for real-time debug display). */
	updateSelectedOrbData: () => void;
}

/**
 * Custom hook encapsulating all orb CRUD operations.
 * Separates orb management logic from the main controller component.
 */
export function useOrbManager(options: UseOrbManagerOptions = {}): UseOrbManagerReturn {
	const spawnConfig = { ...DEFAULT_ORB_SPAWN_CONFIG, ...options.spawnConfig };

	const orbsRef = useRef<Orb[]>([]);
	const selectedOrbIdRef = useRef<string | null>(null);

	const [orbs, setOrbs] = useState<Orb[]>([]);
	const [selectedOrbId, setSelectedOrbId] = useState<string | null>(null);
	const [selectedOrbData, setSelectedOrbData] = useState<Orb | null>(null);

	const createOrb = useCallback((
		pxX: number,
		pxY: number,
		layer: number,
		size: number,
		grid: SpatialGrid,
		vpc: ViewportCells
	) => {
		// Validate spawn position - block if cell is occupied
		if (!CollisionSystem.canSpawn(pxX, pxY, layer, grid, vpc)) {
			return;
		}

		const angle = Math.random() * Math.PI * 2;
		const speedRange = spawnConfig.maxSpeed - spawnConfig.minSpeed;
		const speed = spawnConfig.minSpeed + Math.random() * speedRange;

		const newOrb: Orb = {
			id: crypto.randomUUID(),
			pxX,
			pxY,
			vx: Math.cos(angle) * speed,
			vy: Math.sin(angle) * speed,
			speed,
			angle,
			layer,
			size
		};

		orbsRef.current.push(newOrb);
		setOrbs([...orbsRef.current]);
		setSelectedOrbId(newOrb.id);
		selectedOrbIdRef.current = newOrb.id;

		OrbPhysics.markOrb(grid, newOrb, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
	}, [spawnConfig.minSpeed, spawnConfig.maxSpeed]);

	const deleteOrb = useCallback((id: string, grid: SpatialGrid, vpc: ViewportCells) => {
		const orbToDelete = orbsRef.current.find(o => o.id === id);
		if (orbToDelete) {
			OrbPhysics.clearOrb(grid, orbToDelete, vpc.startCellX, vpc.startCellY, vpc.invCellSizeXPx, vpc.invCellSizeYPx);
			orbsRef.current = orbsRef.current.filter(o => o.id !== id);
			setOrbs([...orbsRef.current]);

			if (selectedOrbIdRef.current === id) {
				setSelectedOrbId(null);
				setSelectedOrbData(null);
				selectedOrbIdRef.current = null;
			}
		}
	}, []);

	const selectOrb = useCallback((id: string | null) => {
		setSelectedOrbId(id);
		selectedOrbIdRef.current = id;
		if (id) {
			const found = orbsRef.current.find(o => o.id === id);
			setSelectedOrbData(found ? { ...found } : null);
		} else {
			setSelectedOrbData(null);
		}
	}, []);

	const updateSelectedOrbData = useCallback(() => {
		if (selectedOrbIdRef.current) {
			const found = orbsRef.current.find(o => o.id === selectedOrbIdRef.current);
			if (found) {
				setSelectedOrbData({ ...found });
			}
		}
	}, []);

	return {
		orbsRef,
		orbs,
		selectedOrbId,
		selectedOrbData,
		selectedOrbIdRef,
		createOrb,
		deleteOrb,
		selectOrb,
		updateSelectedOrbData,
	};
}

