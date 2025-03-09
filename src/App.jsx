import React, { useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import Fuse from 'fuse.js';

GlobalWorkerOptions.workerSrc = `../public/pdf.worker.min.mjs`;

const App = () => {
	const [pdf, setPdf] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [allTextItems, setAllTextItems] = useState([]);

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = async () => {
				const arrayBuffer = reader.result;
				const pdf = await getDocument({ data: arrayBuffer }).promise;
				const pages = [];
				const textItems = [];

				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const viewport = page.getViewport({ scale: 1 });
					const textContent = await page.getTextContent();

					const pageItems = textContent.items.map((item, index) => {
						const { transform, str, width, height } = item;
						const [, , , , translateX, translateY] = transform;

						textItems.push({ str, page: i, index });

						return {
							str,
							translateX,
							translateY,
							height,
							width,
							page: i,
							index,
							highlight: false,
						};
					});

					pages.push({
						pageNumber: i,
						textItems: pageItems,
						viewport,
					});
				}

				setAllTextItems(textItems);
				setPdf(pages);
			};

			reader.readAsArrayBuffer(file);
		}
	};

	const handleSearch = () => {
		const fuse = new Fuse(allTextItems, {
			keys: ['str'],
			threshold: 0.3,
		});
		const results = fuse.search(searchQuery);

		const highlightedPages = pdf.map((page) => {
			const highlightedItems = page.textItems.map((item) => {
				const isMatch = results.some((result) => {
					return (
						result.item.index === item.index &&
						result.item.page === page.pageNumber
					);
				});
				return {
					...item,
					highlight: isMatch,
				};
			});

			return {
				...page,
				textItems: highlightedItems,
			};
		});

		setPdf(highlightedPages);
	};

	return (
		<div>
			<h1>PDF Search App with Fuzzy Matching</h1>
			<input type='file' accept='application/pdf' onChange={handleFileChange} />
			<div>
				<input
					type='text'
					placeholder='Search text...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<button onClick={handleSearch}>Search</button>
			</div>
			<div>
				{pdf.map((page) => (
					<div
						key={page.pageNumber}
						style={{
							position: 'relative',
							border: '1px solid #ccc',
							marginBottom: '20px',
							width: `${page.viewport.width}px`,
							height: `${page.viewport.height}px`,
						}}
					>
						{page.textItems.map((item, index) => (
							<div
								key={index}
								style={{
									position: 'absolute',
									left: `${item.translateX}px`,
									bottom: `${item.translateY}px`,
									fontSize: `${Math.abs(item.height)}px`,
									width: `${item.width}px`,
									whiteSpace: 'pre',
									backgroundColor: item.highlight ? 'yellow' : 'transparent',
								}}
							>
								{item.str}
							</div>
						))}
					</div>
				))}
			</div>
		</div>
	);
};

export default App;
