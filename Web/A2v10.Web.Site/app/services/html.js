// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190114-7411
/* services/http.js */

app.modules['std:html'] = function () {


	return {
		getColumnsWidth,
		downloadBlob
	};

	function getColumnsWidth(elem) {
		let cols = elem.getElementsByTagName('col');
		let cells = elem.querySelectorAll('tbody.col-shadow > tr > td');
		let len = Math.min(cols.length, cells.length);
		for (let i = 0; i < len; i++) {
			let w = cells[i].offsetWidth;
			cols[i].setAttribute('data-col-width', w);
		}
	}

	function downloadBlob(blob, fileName, format) {
		let objUrl = URL.createObjectURL(blob);
		let link = document.createElement('a');
		link.style = "display:none";
		document.body.appendChild(link); // FF!
		let downloadFile = fileName || 'file';
		if (format === 'Excel')
			downloadFile += '.xlsx';
		link.download = downloadFile;
		link.href = objUrl;
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(objUrl);
	}
};




