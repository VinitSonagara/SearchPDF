import React from 'react';
import TextItem from './TextItem';

const Page = (props) => {
	const { pageNumber, width, height, textItems } = props;
	return (
		<div
			key={pageNumber}
			style={{
				width: `${width}px`,
				height: `${height}px`,
			}}
			className='pdf-page'
		>
			{textItems.map((item, index) => {
				const {
					translateX,
					translateY,
					height: itemHeight,
					width: itemWidth,
					highlight,
					str,
				} = item;
				return (
					<TextItem
						index={index}
						translateX={translateX}
						translateY={translateY}
						height={itemHeight}
						width={itemWidth}
						highlight={highlight}
						str={str}
					/>
				);
			})}
		</div>
	);
};

export default React.memo(Page);
