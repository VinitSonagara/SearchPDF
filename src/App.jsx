import React, { useState } from 'react';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = `../public/pdf.worker.min.mjs`;

const App = () => {
	const [pdfText, setPdfText] = useState('');

	const handleFileChange = async (e) => {
		const file = e.target.files[0];
		if (file) {
			const reader = new FileReader();
			reader.onload = async () => {
				const arrayBuffer = reader.result;
				const pdf = await getDocument({ data: arrayBuffer }).promise;
				console.log({
					arrayBuffer,
					pdf,
				});
				let text = '';
				for (let i = 1; i <= pdf.numPages; i++) {
					const page = await pdf.getPage(i);
					const content = await page.getTextContent();
					text += content.items.map((item) => item.str).join(' ') + '\n';
				}
				setPdfText(text);
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
