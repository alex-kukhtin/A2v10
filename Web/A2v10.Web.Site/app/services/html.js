// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190117-7417
/* services/http.js */

app.modules['std:html'] = function () {


	return {
		getColumnsWidth,
		getRowHeight,
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

	function getRowHeight(elem) {
		let rows = elem.getElementsByTagName('tr');
		for (let r = 0; r < rows.length; r++) {
			let h = rows[r].offsetHeight - 12; /* padding !!!*/
			rows[r].setAttribute('data-row-height', h);
		}
	}

	function downloadBlob(blob, fileName, format) {
		let objUrl = URL.createObjectURL(blob);
		let link = document.createElement('a');
		link.style = "display:none";
		document.body.appendChild(link); // FF!
		let downloadFile = fileName || 'file';
		format = (format || '').toLowerCase();
		if (format === 'excel')
			downloadFile += '.xlsx';
		else if (format === "pdf")
			downloadFile += ".pdf";
		link.download = downloadFile;
		link.href = objUrl;
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(objUrl);
	}
};




