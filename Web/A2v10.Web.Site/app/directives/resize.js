// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20181111-7252*/
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
		p.init = true;

		let dataMinWidth = el.getAttribute('data-min-width');
		let secondMinWidth = el.getAttribute('second-min-width');

		let minPaneWidth = getPixelWidth(p.grid, dataMinWidth);
		let minSecondPaneWidth = getPixelWidth(p.grid, secondMinWidth);
		if (isNaN(minPaneWidth))
			minPaneWidth = MIN_WIDTH;
		if (isNaN(minSecondPaneWidth))
			minSecondPaneWidth = MIN_WIDTH;
		p.minWidth = minPaneWidth;
		p.minWidth2 = minSecondPaneWidth;

		let pane1 = p.grid.querySelector('.spl-first');
		let p1w = Math.max(p.minWidth, pane1.clientWidth);
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
			grid.appendChild(temp);
			let cw = temp.clientWidth;
			temp.remove();
			return cw;
		}
	},
	bind(el, binding, vnode) {

		Vue.nextTick(function () {

			const handleWidth = 6;

			function findHandle(el) {
				for (let ch of el.childNodes) {
					if (ch.nodeType === Node.ELEMENT_NODE) {
						if (ch.classList.contains('drag-handle'))
							return ch;
					}
				}
				return null;
			}

			let grid = el.parentElement;
			grid.style.visibility = 'hidden'; // avoid flickering 

			let parts = {
				handleWidth: handleWidth,
				grid: grid,
				handle: findHandle(grid),
				resizing: false,
				minWidth: 0,
				minWidth2: 0,
				mouseDown: mouseDown,
				init: false,
				offsetX(event) {
					let rc = this.grid.getBoundingClientRect();
					return event.clientX - rc.left;
				},
				fitX(x) {
					if (x < this.minWidth)
						x = this.minWidth;
					let tcx = this.grid.clientWidth;
					if (x + handleWidth + this.minWidth2 > tcx)
						x = tcx - this.minWidth2 - handleWidth;
					return x;
				}
			};

			if (!parts.handle) {
				console.error('Resize handle not found');
				return;
			}

			el._parts = parts;

			function mouseUp(event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				event.preventDefault();
				p.handle.style.display = 'none';
				p.grid.style.cursor = 'default';
				let x = p.offsetX(event);
				x = p.fitX(x);
				p.grid.style.gridTemplateColumns = `${x}px ${handleWidth}px 1fr`;

				document.removeEventListener('mouseup', mouseUp);
				document.removeEventListener('mousemove', mouseMove);

				p.resizing = false;
			}

			function mouseMove(event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				event.preventDefault();
				let x = p.offsetX(event);
				x = p.fitX(x);
				p.handle.style.left = x + 'px';
			}

			function mouseDown(event) {
				let p = el._parts;
				if (p.resizing)
					return;
				let t = event.target;
				if (!t.classList.contains('spl-handle')) {
					console.error('click out of splitter handle');
					return;
				}
				event.preventDefault();
				let x = p.offsetX(event);
				p.handle.style.left = x + 'px';
				p.handle.style.display = 'block';
				p.grid.style.cursor = 'w-resize';
				document.addEventListener('mouseup', mouseUp, false);
				document.addEventListener('mousemove', mouseMove, false);
				p.resizing = true;
			}
			el.addEventListener('mousedown', mouseDown, false);
		});
	}
});

