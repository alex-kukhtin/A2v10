// Copyright © 2015-2024 Oleksandr Kukhtin. All rights reserved.

// 20241018-7971
/* services/html.js */

app.modules['std:html'] = function () {

	const frameId = "print-direct-frame";// todo: shared CONST

	return {
		getColumnsWidth,
		getRowHeight,
		downloadBlob,
		downloadUrl,
		openUrl,
		printDirect,
		removePrintFrame,
		updateDocTitle,
		uploadFile,
		purgeTable
	};

	function getColumnsWidth(elem) {
		let cols = elem.getElementsByTagName('col');
		// FF bug fix. Popover does not work inside <td>.
		let body = elem.querySelectorAll('tbody.col-shadow')[0];
		body.style.display = "table-row-group";
		let cells = elem.querySelectorAll('tbody.col-shadow > tr > td');
		let len = Math.min(cols.length, cells.length);
		for (let i = 0; i < len; i++) {
			let w = cells[i].offsetWidth;
			cols[i].setAttribute('data-col-width', w);
		}
		body.style.display = "none";
	}

	function getRowHeight(elem, padding) {
		let rows = elem.getElementsByTagName('tr');
		for (let r = 0; r < rows.length; r++) {
			let h = rows[r].offsetHeight - (padding || 12); /* padding from css */
			rows[r].setAttribute('data-row-height', h);
		}
	}

	function openUrl(url) {
		let link = document.createElement('a');
		link.style = "display:none";
		document.body.appendChild(link);
		link.href = url;
		link.setAttribute('target', '_blank');
		link.click();
		document.body.removeChild(link);
	}

	function downloadUrl(url) {
		let link = document.createElement('a');
		link.style = "display:none";
		document.body.appendChild(link);
		link.href = url;
		link.setAttribute('download', '');
		link.click();
		document.body.removeChild(link);
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

	function printDirect(url) {


		if (window.cefHost || navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
			window.open(url);
			return;
		}
		removePrintFrame();
		let frame = document.createElement("iframe");
		document.body.classList.add('waiting');
		frame.id = frameId;
		frame.style.cssText = "display:none;width:0;height:0;border:none;position:absolute;left:-10000,top:-100000";
		document.body.appendChild(frame);
		if (document.activeElement)
			document.activeElement.blur();
		//let emb = document.createElement('embed');
		//emb.setAttribute('src', url);
		//frame.appendChild(emb);
		frame.setAttribute('src', url);


		frame.onload = function (ev) {
			let cw = frame.contentWindow;
			if (cw.document.body) {
				let finp = cw.document.createElement('input');
				finp.setAttribute("id", "dummy-focus");
				finp.cssText = "width:0;height:0;border:none;position:absolute;left:-10000,top:-100000";
				cw.document.body.appendChild(finp);
				finp.focus();
				cw.document.body.removeChild(finp);
			}
			document.body.classList.remove('waiting');
			cw.print();
		};
	}

	function removePrintFrame() {
		let frame = window.frames[frameId];
		if (frame)
			document.body.removeChild(frame);
	}

	function updateDocTitle(title) {
		if (document.title === title)
			return;
		document.title = title;
	}

	function uploadFile(accept) {
		return new Promise(function (resolve, reject) {
			let input = document.createElement('input');
			input.setAttribute("type", "file");
			if (accept)
				input.setAttribute('accept', accept);
			input.style = "display:none";
			input.addEventListener('change', ev => {
				resolve(ev.target.files[0]);
			});
			document.body.appendChild(input); // FF!
			input.click();
			document.body.removeChild(input);
		});
	}
};

function purgeTable(tbl) {
	let node = tbl.cloneNode(true)
	for (let td of node.getElementsByTagName('TD')) {
		if (!td.childNodes.length) continue;
		td.removeAttribute('title');
		let c = td.childNodes[0];
		if (c.classList && (c.classList.contains('popover-wrapper') || c.classList.contains('hlink-dd-wrapper'))) {
			if (c.childNodes.length)
				td.innerText = c.childNodes[0].innerText;
		}
	}
	return node;
}


