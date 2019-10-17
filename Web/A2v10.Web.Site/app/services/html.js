// Copyright © 2015-2019 Alex Kukhtin. All rights reserved.

// 20190717-7568
/* services/html.js */

app.modules['std:html'] = function () {

	const frameId = "print-direct-frame";// todo: shared CONST

	return {
		getColumnsWidth,
		getRowHeight,
		downloadBlob,
		downloadUrl,
		printDirect,
		removePrintFrame,
		updateDocTitle
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


		if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
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
};




