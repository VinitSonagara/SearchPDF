import React, { useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import Fuse from 'fuse.js';
import './App.css';
import Page from './Page';

GlobalWorkerOptions.workerSrc = `/pdf.worker.min.mjs`;

const App = () => {
	const [pdf, setPdf] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [allTextItems, setAllTextItems] = useState([]);
	const [loading, setLoading] = useState(false);

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			setLoading(true);
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
						height: viewport.height,
						width: viewport.width,
					});
				}

				setAllTextItems(textItems);
				setPdf(pages);
				setLoading(false);
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
			<h1>PDF Search App</h1>
			<div className='input-field'>
				<input
					type='file'
					accept='application/pdf'
					onChange={handleFileChange}
				/>
			</div>
			<div className='input-field'>
				<input
					type='text'
					placeholder='Search text...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
				/>
				<button onClick={handleSearch}>Search</button>
			</div>

			{loading ? (
				<div className='loader' />
			) : (
				<div>
					{pdf.map((page) => {
						const { pageNumber, width, height, textItems } = page;
						return (
							<Page
								key={pageNumber}
								width={width}
								height={height}
								textItems={textItems}
							/>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default App;
