// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181211-7384*/
/* directives/resize.js */

Vue.directive('resize', {
	unbind(el, binding, vnode) {
		let p = el._parts;
		if (p.mouseDown) {
			el.removeEventListener('mousedown', p.mouseDown, false);
		}
	},

	update(el) {

		const MIN_WIDTH = 20;

		if (!el._parts) return;
		let p = el._parts;
		if (p.init) return;
		//if (!p.grid.clientWidth) return; // yet not inserted
		p.init = true;

		p.handle = findHandle(p.grid);

		let dataMinWidth = el.getAttribute('data-min-width');
		let secondMinWidth = el.getAttribute('second-min-width');
		let firstPaneWidth = el.getAttribute('first-pane-width');

		p.minWidth = getPixelWidth(p.grid, dataMinWidth);
		p.minWidth2 = getPixelWidth(p.grid, secondMinWidth);
		p.firstWidth = getPixelWidth(p.grid, firstPaneWidth);

		let p1w = Math.max(p.minWidth, p.firstWidth);
		p.grid.style.gridTemplateColumns = `${p1w}px ${p.handleWidth}px 1fr`;

		p.grid.style.visibility = 'visible';

		function getPixelWidth(grid, w) {
			w = w || '';
			if (w.indexOf('px') !== -1) {
				return Number.parseFloat(w);
			}
			let temp = document.createElement('div');
			temp.style.width = w;
			temp.style.position = 'absolute';
			temp.style.visibility = 'hidden';
			document.body.appendChild(temp);
			let cw = temp.clientWidth;
			temp.remove();
			if (!cw)
				return MIN_WIDTH;
			if (isNaN(cw))
				return MIN_WIDTH;
			return cw;
		}

		function findHandle(el) {
			for (let ch of el.childNodes) {
				if (ch.nodeType === Node.ELEMENT_NODE) {
					if (ch.classList.contains('drag-handle'))
						return ch;
				}
			}
			return null;
		}

	},
	inserted(el, binding, vnode) {

		const HANDLE_WIDTH = 6;

		let grid = el.parentElement;

		let dataMinWidth = el.getAttribute('data-min-width');

		if (dataMinWidth) {
			grid.style.visibility = 'hidden'; // avoid flickering 
		}

		let parts = {
			handleWidth: HANDLE_WIDTH,
			grid: grid,
			handle: null,
			resizing: false,
			firstWidth: 0,
			minWidth: 0,
			minWidth2: 0,
			delta: 0,
			mouseDown: mouseDown,
			init: false,
			offsetX(event, useDx) {
				let dx = this.delta;
				let rc = this.grid.getBoundingClientRect();
				if (useDx) {
					let rt = event.target.getBoundingClientRect();
					dx = event.clientX - rt.left;
					this.delta = dx;
				}
				//console.dir(`x:${event.clientX}, rc.left:${rc.left}, rt.left:${rt.left}, dx:${dx}`);
				return event.clientX - rc.left - dx;
			},
			fitX(x) {
				if (x < this.minWidth)
					x = this.minWidth;
				let tcx = this.grid.clientWidth;
				if (x + this.handleWidth + this.minWidth2 > tcx)
					x = tcx - this.minWidth2 - this.handleWidth;
				return x;
			}
		};

		el._parts = parts;

		function mouseUp(event) {
			let p = el._parts;
			if (!p.resizing)
				return;
			event.preventDefault();
			p.handle.style.display = 'none';
			p.grid.style.cursor = 'default';
			let x = p.offsetX(event, false);
			x = p.fitX(x);
			p.grid.style.gridTemplateColumns = `${x}px ${p.handleWidth}px 1fr`;

			document.removeEventListener('mouseup', mouseUp);
			document.removeEventListener('mousemove', mouseMove);

			p.resizing = false;
		}

		function mouseMove(event) {
			let p = el._parts;
			if (!p.resizing)
				return;
			event.preventDefault();
			let x = p.offsetX(event, false);
			x = p.fitX(x);
			p.handle.style.left = x + 'px';
		}

		function mouseDown(event) {
			let p = el._parts;
			if (p.resizing)
				return;
			if (!p.handle)
				return;
			let t = event.target;
			if (!t.classList.contains('spl-handle')) {
				console.error('click out of splitter handle');
				return;
			}
			event.preventDefault();
			let x = p.offsetX(event, true);
			p.handle.style.left = x + 'px';
			p.handle.style.display = 'block';
			p.grid.style.cursor = 'w-resize';
			document.addEventListener('mouseup', mouseUp, false);
			document.addEventListener('mousemove', mouseMove, false);
			p.resizing = true;
		}

		el.addEventListener('mousedown', mouseDown, false);
	}
});

