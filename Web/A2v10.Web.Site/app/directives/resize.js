// Copyright © 2015-2018 Alex Kukhtin. All rights reserved.

/*20171234-7110*/
/* directives/resize.js */

Vue.directive('resize', {
	bind(el, binding, vnode) {

		Vue.nextTick(function () {

            const minWidth = 20;
            const handleWidth = 6;

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

            let minPaneWidth = Number.parseFloat(el.getAttribute('data-min-width'));
            let minSecondPaneWidth = Number.parseFloat(el.getAttribute('second-min-width'));
            if (isNaN(minPaneWidth))
                minPaneWidth = minWidth;
            if (isNaN(minSecondPaneWidth))
                minSecondPaneWidth = minWidth;


			let parts = {
				grid: grid,
				handle: findHandle(grid),
                resizing: false,
                minWidth: minPaneWidth,
                minWidth2: minSecondPaneWidth,
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


            el.addEventListener('mousedown', function (event) {
                let p = el._parts;
				if (p.resizing)
					return;
				event.preventDefault();
                let x = p.offsetX(event);
				p.handle.style.left = x + 'px';
				p.handle.style.display = 'block';
				p.grid.style.cursor = 'w-resize';
                document.addEventListener('mouseup', mouseUp, false);
                document.addEventListener('mousemove', mouseMove, false);
                p.resizing = true;
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

