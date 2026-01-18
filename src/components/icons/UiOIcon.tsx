import type { CSSProperties } from "react";

/**
 * University of Oslo (UiO) icon component using mask image
 */
export function UiOIcon() {
	const style: CSSProperties = {
		display: 'block',
		width: '100%',
		height: '100%',
		backgroundColor: 'currentColor',
		maskImage: 'url(/uio_sigil.svg)',
		WebkitMaskImage: 'url(/uio_sigil.svg)',
		maskSize: 'contain',
		WebkitMaskSize: 'contain',
		maskRepeat: 'no-repeat',
		WebkitMaskRepeat: 'no-repeat',
		maskPosition: 'center',
		WebkitMaskPosition: 'center',
	};

	return <span style={style} />;
}
