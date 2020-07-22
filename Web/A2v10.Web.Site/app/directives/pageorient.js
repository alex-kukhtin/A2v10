// Copyright © 2018-2020 Alex Kukhtin. All rights reserved.

/*20200722-7691/
/* directives/pageorient.js */


(function () {

	const pageStyle = Symbol();

	let bindVal = null;
	let elemStyle = null;

	Vue.directive('page-orientation', {
		bind(el, binding) {
			bindVal = null;
			elemStyle = null;
			let style = document.createElement('style');
			style.innerHTML = `@page {size: A4 ${binding.value}; margin:1cm;}`;
			document.head.appendChild(style);
			el[pageStyle] = style;
		},

		unbind(el) {
			let style = el[pageStyle];
			if (style) {
				document.head.removeChild(style);
			}
		}
	});

	function resetScroll() {
		let el = document.getElementsByClassName("with-wrapper");
		if (el && el.length) {
			let spw = el[0];
			spw.scrollTo(0, 0);
		}
	}

	function createStyleText(zoom) {
		if (!bindVal) return null;
		let stv = `@media print {@page {size: ${bindVal.pageSize || 'A4'} ${bindVal.orientation}; margin:${bindVal.margin};}`;
		zoom = zoom || bindVal.zoom;
		if (zoom)
			stv += `.sheet-page > .sheet { zoom: ${zoom}; width: 1px;}`;
		stv += '}';
		return stv;
	}

	function calcPrintArea() {
		let div = document.createElement('div');
		div.classList.add('mm-100-100')
		document.body.appendChild(div);
		let rv = {
			w: (div.clientWidth - 5) / 100.0,
			h: (div.clientHeight - 5) / 100.0
		};
		document.body.removeChild(div);
		return rv;
	}

	function printEvent(ev) {
		// margin: 2cm;
		resetScroll();
		if (!bindVal) return;
		if (bindVal.zoom != 'auto') return;
		let ecls = document.getElementsByClassName('sheet');
		if (!ecls || !ecls.length) return;
		let tbl = ecls[0];
		let pageSize = { w: 210, h: 297 }; // A4
		let margin = { t: 10, r: 10, b: 10, l: 10 };
		if (bindVal.orientation === 'landscape')
			[pageSize.w, pageSize.h] = [pageSize.h, pageSize.w];
		let k = calcPrintArea();
		let wx = tbl.clientWidth / k.w;
		let hy = tbl.clientHeight / k.h;
		let zx = (pageSize.w - margin.l - margin.r - 5) / wx;
		let zy = (pageSize.h - margin.t - margin.b - 5) / hy;
		let z = Math.round(Math.min(zx, zy) * 1000) / 1000;
		elemStyle.innerHTML = createStyleText(z);
	}


	Vue.directive('print-page', {
		bind(el, binding) {
			let val = binding.value;
			bindVal = val;
			let stv = createStyleText();
			if (stv) {
				let style = document.createElement('style');
				style.innerHTML = stv;
				elemStyle = document.head.appendChild(style);
				el[pageStyle] = style;
			}
			window.addEventListener('beforeprint', printEvent);
		},

		unbind(el) {
			let style = el[pageStyle];
			if (style) {
				document.head.removeChild(style);
			}
			window.removeEventListener('beforeprint', printEvent);
		}
	});

})();