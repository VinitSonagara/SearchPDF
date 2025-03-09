import React from 'react';

const TextItem = (props) => {
	const { index, translateX, translateY, height, width, highlight, str } =
		props;

	return (
		<div
			key={index}
			style={{
				left: `${translateX}px`,
				bottom: `${translateY}px`,
				fontSize: `${Math.abs(height)}px`,
				width: `${width}px`,
			}}
			className={`text-item ${highlight ? 'highlight' : ''}`}
		>
			{str}
		</div>
	);
};

export default React.memo(TextItem);
