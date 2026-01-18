// =============================================================================
// OrbOrbCollision - Hard collision resolution between orbs
// =============================================================================

import { type ViewportCells } from '../grid/types';
import { type Orb } from '../orb/types';

/**
 * Handles hard collision resolution between orbs.
 * 
 * Single Responsibility: Orb-to-orb elastic collision physics only.
 */
export class OrbOrbCollision {
	/**
	 * Resolves 3D orb-orb collisions with mass-weighted elastic bounce.
	 * 
	 * Checks all pairs of orbs for overlap and applies impulses based on
	 * their relative masses (size). Larger orbs affect smaller orbs more.
	 * 
	 * Uses the elastic collision formula in 3D:
	 * v1' = v1 - (2*m2/(m1+m2)) * dot(v1-v2, n) * n
	 * v2' = v2 + (2*m1/(m1+m2)) * dot(v1-v2, n) * n
	 * 
	 * Also includes position correction to prevent orbs from getting stuck.
	 * 
	 * @param orbs - Array of all orbs to check.
	 * @param vpc - Viewport cell metrics for coordinate conversion.
	 */
	static resolveCollisions(
		orbs: Orb[],
		vpc: ViewportCells
	): void {
		for (let i = 0; i < orbs.length; i++) {
			for (let j = i + 1; j < orbs.length; j++) {
				const orbA = orbs[i];
				const orbB = orbs[j];

				// Calculate 3D distance between centers in cells
				const cellAX = orbA.pxX * vpc.invCellSizeXPx;
				const cellAY = orbA.pxY * vpc.invCellSizeYPx;
				const cellAZ = orbA.z;
				const cellBX = orbB.pxX * vpc.invCellSizeXPx;
				const cellBY = orbB.pxY * vpc.invCellSizeYPx;
				const cellBZ = orbB.z;

				const dx = cellBX - cellAX;
				const dy = cellBY - cellAY;
				const dz = cellBZ - cellAZ;
				const distSq = dx * dx + dy * dy + dz * dz;

				// Combined radius (in cells) - orbs touch when distance <= sum of radii + 1
				const radiusA = orbA.size - 1;
				const radiusB = orbB.size - 1;
				const minDist = radiusA + radiusB + 1;

				if (distSq < minDist * minDist) {
					let dist: number;
					let nxCell: number, nyCell: number, nzCell: number;

					// Handle zero-distance case (orbs at same position)
					if (distSq < 0.001) {
						// Generate random separation direction to unstick orbs
						const randomAngle = Math.random() * Math.PI * 2;
						const randomPhi = (Math.random() - 0.5) * Math.PI;
						nxCell = Math.cos(randomAngle) * Math.cos(randomPhi);
						nyCell = Math.sin(randomAngle) * Math.cos(randomPhi);
						nzCell = Math.sin(randomPhi);
						dist = 0.001; // Use tiny distance to prevent division by zero
					} else {
						dist = Math.sqrt(distSq);
						nxCell = dx / dist;
						nyCell = dy / dist;
						nzCell = dz / dist;
					}

					// Convert direction from cell space back to pixel space
					// Cell space may be non-square, so we need to scale the direction vector
					const cellSizeXPx = vpc.cellSizeXPx;
					const cellSizeYPx = vpc.cellSizeYPx;
					const nxPx = nxCell * cellSizeXPx;
					const nyPx = nyCell * cellSizeYPx;
					// Z is in layers, keep it as-is for now (vz is in layers/s)
					const nzPx = nzCell;
					const lenPx = Math.sqrt(nxPx * nxPx + nyPx * nyPx + nzPx * nzPx);

					// Normalized direction in pixel space for velocity updates
					const nx = lenPx > 0.001 ? nxPx / lenPx : 0;
					const ny = lenPx > 0.001 ? nyPx / lenPx : 0;
					const nz = lenPx > 0.001 ? nzPx / lenPx : 0;

					// Use size as mass (larger orbs have more momentum)
					const massA = orbA.size;
					const massB = orbB.size;
					const totalMass = massA + massB;

					// Position correction: ALWAYS push orbs apart if overlapping
					// This is critical to prevent orbs from getting stuck
					const overlap = minDist - dist;
					const overlapRatio = overlap > 0 ? overlap / minDist : 0;

					if (overlap > 0) {
						// More aggressive separation for deep overlaps
						// Scale factor: 1.2x for small overlaps, up to 2.0x for deep overlaps
						const separationMultiplier = 1.2 + (0.8 * overlapRatio);

						// Distribute separation based on mass (smaller orbs move more)
						// Separation is in cells, use cell-space direction to move orbs apart
						const separationA = (overlap * massB / totalMass) * separationMultiplier;
						const separationB = (overlap * massA / totalMass) * separationMultiplier;

						// Guard against NaN propagation
						// Use cell-space direction (nxCell, nyCell, nzCell) for position correction
						// Then convert to pixels via cellSizeXPx/cellSizeYPx
						if (isFinite(separationA) && isFinite(separationB) && isFinite(nxCell) && isFinite(nyCell) && isFinite(nzCell)) {
							orbA.pxX -= nxCell * separationA * cellSizeXPx;
							orbA.pxY -= nyCell * separationA * cellSizeYPx;
							orbA.z -= nzCell * separationA;
							orbB.pxX += nxCell * separationB * cellSizeXPx;
							orbB.pxY += nyCell * separationB * cellSizeYPx;
							orbB.z += nzCell * separationB;
						}
					}

					// Velocity resolution
					// Relative velocity of A with respect to B in 3D
					const dvx = orbA.vx - orbB.vx;
					const dvy = orbA.vy - orbB.vy;
					const dvz = orbA.vz - orbB.vz;

					// Relative velocity in collision normal direction
					const dvn = dvx * nx + dvy * ny + dvz * nz;

					// Minimum separation speed for stuck orbs
					const minSeparationSpeed = 20; // pixels/sec

					if (dvn > 0 && isFinite(dvn)) {
						// Objects are approaching - apply elastic collision response
						// Mass-weighted impulse factors with reduced elasticity
						const elasticity = 0.8;
						const impulseA = (elasticity * massB / totalMass) * dvn;
						const impulseB = (elasticity * massA / totalMass) * dvn;

						// Guard against NaN propagation
						if (isFinite(impulseA) && isFinite(impulseB)) {
							orbA.vx -= impulseA * nx;
							orbA.vy -= impulseA * ny;
							orbA.vz -= impulseA * nz;
							orbB.vx += impulseB * nx;
							orbB.vy += impulseB * ny;
							orbB.vz += impulseB * nz;
						}
					} else if (overlapRatio > 0.3) {
						// Objects are stuck (significant overlap but not approaching)
						// Apply minimum separation velocity to unstick them
						const separationImpulse = minSeparationSpeed * overlapRatio;
						const impulseA = separationImpulse * (massB / totalMass);
						const impulseB = separationImpulse * (massA / totalMass);

						if (isFinite(impulseA) && isFinite(impulseB)) {
							orbA.vx -= impulseA * nx;
							orbA.vy -= impulseA * ny;
							orbA.vz -= impulseA * nz * 0.05; // Scale Z since it's in layers/s
							orbB.vx += impulseB * nx;
							orbB.vy += impulseB * ny;
							orbB.vz += impulseB * nz * 0.05;
						}
					}

					// Update angles to match new velocity directions
					orbA.angle = Math.atan2(orbA.vy, orbA.vx);
					orbB.angle = Math.atan2(orbB.vy, orbB.vx);
				}
			}
		}
	}
}
