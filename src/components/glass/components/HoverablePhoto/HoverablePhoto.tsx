"use client";

import Image from "next/image";
import { useInteraction3D } from "../../hooks/interaction";
import styles from "./HoverablePhoto.module.css";

// Configuration constant following Open/Closed Principle
export const DEFAULT_PHOTO_SIZE = 140;

interface HoverablePhotoProps {
	src: string;
	alt: string;
	size?: number;
	priority?: boolean;
}

/**
 * HoverablePhoto - A photo component with 3D hover effects
 * Follows Single Responsibility Principle - only renders a hoverable photo
 * Follows Open/Closed Principle - size is configurable via props
 */
export function HoverablePhoto({ src, alt, size = DEFAULT_PHOTO_SIZE, priority }: HoverablePhotoProps) {
	const { isActive, interactionProps } = useInteraction3D({ trigger: 'hover' });

	return (
		<div className={styles.wrapper} {...interactionProps}>
			<div 
				className={`${styles.photo} ${isActive ? styles.active : ''}`}
				style={{ width: `${size}px`, height: `${size}px` }}
			>
				<div className={styles.clipper}>
					<Image
						src={src}
						alt={alt}
						width={size}
						height={size}
						className={styles.image}
						priority={priority}
						unoptimized
					/>
				</div>
			</div>
		</div>
	);
}
