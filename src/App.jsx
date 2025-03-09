import React, { useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `../public/pdf.worker.min.mjs`;

const App = () => {
	const [pdfText, setPdfText] = useState([]);

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = async () => {
				const arrayBuffer = reader.result;
				const pdf = await getDocument({ data: arrayBuffer }).promise;
				const pages = [];

				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const viewport = page.getViewport({ scale: 1 });
					const textContent = await page.getTextContent();

					const textItems = textContent.items.map((item, index) => {
						console.log({ item });
						const { transform, str, width, height } = item;
						const [, , , , translateX, translateY] = transform;

						return (
							<div
								key={index}
								style={{
									position: 'absolute',
									left: `${translateX}px`,
									bottom: `${translateY}px`,
									fontSize: `${Math.abs(height)}px`,
									width: `${width}px`,
									height: `${height}px`,
									whiteSpace: 'pre',
								}}
							>
								{str}
							</div>
						);
					});

					pages.push(
						<div
							key={i}
							style={{
								position: 'relative',
								border: '1px solid #ccc',
								marginBottom: '20px',
								width: `${viewport.width}px`,
								height: `${viewport.height}px`,
							}}
						>
							{textItems}
						</div>
					);
				}

				setPdfText(pages);
			};
			reader.readAsArrayBuffer(file);
		}
	};

	return (
		<div>
			<h1>PDF Search App</h1>
			<input type='file' accept='application/pdf' onChange={handleFileChange} />
			<div>{pdfText}</div>
		</div>
	);
};

export default App;
