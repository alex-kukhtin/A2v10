/*20170912-7031*/
/* directives/resize.js */

Vue.directive('resize', {
	bind(el, binding, vnode) {

		Vue.nextTick(function () {
			const minWidth = 20;
			function findHandle(el) {
				for (ch of el.childNodes) {
					if (ch.nodeType === Node.ELEMENT_NODE) {
						if (ch.classList.contains('drag-handle'))
							return ch;
					}
				}
				return null;
			}

			let grid = el.parentElement;

			let parts = {
				grid: grid,
				handle: findHandle(grid),
				resizing: false,
				offsetX(event) {
					let rc = this.grid.getBoundingClientRect();
					return event.clientX - rc.left;
				}
			};

			if (!parts.handle) {
				console.error('Resize handle not found');
				return;
			}

			el._parts = parts;

			grid.addEventListener('mouseup', function (event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				p.resizing = false;
				event.preventDefault();
				p.handle.style.display = 'none';
				p.grid.style.cursor = 'default';
				let x = p.offsetX(event);
				if (x < minWidth) x = minWidth;
				p.grid.style.gridTemplateColumns = x + 'px 6px 1fr';
			}, false);

			grid.addEventListener('mousemove', function (event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				event.preventDefault();
				let x = p.offsetX(event);
				p.handle.style.left = x + 'px';
			}, false);

			el.addEventListener('mousedown', function (event) {
				let p = el._parts;
				if (p.resizing)
					return;
				event.preventDefault();
				p.resizing = true;
				let x = p.offsetX(event);
				p.handle.style.left = x + 'px';
				p.handle.style.display = 'block';
				p.grid.style.cursor = 'w-resize';
			}, false);
		});
		/*
		Vue.nextTick(function () {

			const minWidth = 20;

			function findHandle(el) {
				for (ch of el.childNodes) {
					if (ch.nodeType === Node.ELEMENT_NODE) {
						if (ch.classList.contains('drag-handle'))
							return ch;
					}
				}
				return null;
			}

			let grid = el.parentElement;

			let parts = {
				grid: grid,
				handle: findHandle(grid),
				resizing: false
			};

			if (!parts.handle) {
				console.error('Resize handle not found');
				return;
			}

			el._parts = parts;

			el._parts.grid.addEventListener('mouseup', function (event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				p.resizing = false;
				event.preventDefault();
				p.handle.style.display = 'none';
				p.grid.style.cursor = 'default';
				let rc = p.getBoundingClientRect();
				let x = event.clientX - rc.left;
				if (x < minWidth) x = minWidth;
				p.grid.style.gridTemplateColumns = x + 'px 6px 1fr';
			}, false);

			el._parts.grid.addEventListener('mousemove', function (event) {
				let p = el._parts;
				if (!p.resizing)
					return;
				let rc = p.grid.getBoundingClientRect();
				event.preventDefault();
				let x = event.clientX - rc.left;
				p.handle.style.left = x + 'px';
			}, false);

			el.addEventListener('mousedown', function (event) {
				let p = el._parts;
				if (p.resizing)
					return;
				event.preventDefault();
				p.resizing = true;
				let rc = p.grid.getBoundingClientRect();
				let x = event.offsetX + event.target.offsetLeft;
				let x = event.clientX - rc.left;
				p.handle.style.left = x + 'px';
				p.handle.style.display = 'block';
				p.grid.style.cursor = 'w-resize';
			}, false);
		});

		*/
	}
});

